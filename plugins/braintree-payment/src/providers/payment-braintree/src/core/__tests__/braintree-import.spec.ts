import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import BraintreeImportService from '../../services/braintree-import';
import { BraintreeConstructorArgs } from '../braintree-base';

const buildService = () => {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
  const cache = { get: jest.fn(), set: jest.fn() } as any;

  const container: BraintreeConstructorArgs = { logger, cache };

  const options = {
    environment: 'sandbox' as const,
    merchantId: 'merchant',
    publicKey: 'public',
    privateKey: 'private',
    enable3DSecure: false,
    savePaymentMethod: false,
    webhookSecret: 'whsec',
    autoCapture: true,
  } as any;

  const service = new BraintreeImportService(container, options);

  // Replace gateway used only for actual refunds
  const gateway = {
    transaction: {
      find: jest.fn(),
      void: jest.fn(),
      refund: jest.fn(),
    },
  } as any;

  (service as any).gateway = gateway;

  return { service, gateway };
};

describe('BraintreeImportService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('simulates authorize/capture without API calls', async () => {
    const { service, gateway } = buildService();
    const init = await service.initiatePayment({
      data: { transactionId: 't1' },
      amount: 10,
      currency_code: 'USD',
      context: { idempotency_key: 'idem' },
    } as any);
    expect(init.id).toBeDefined();

    const auth = await service.authorizePayment({ data: init.data } as any);
    expect(auth.status).toBe('authorized');
    expect(gateway.transaction.find).not.toHaveBeenCalled();

    const cap = await service.capturePayment({ data: auth.data } as any);
    expect((cap.data as any).status).toBe('captured');
  });

  it('simulates refund when importedAsRefunded=true', async () => {
    const { service, gateway } = buildService();
    const session = { transactionId: 't1', importedAsRefunded: true, refundedTotal: 2, status: 'captured' } as any;

    const res = await service.refundPayment({ amount: 3, data: session } as any);
    expect((res.data as any).refundedTotal).toBe(5);
    expect(gateway.transaction.void).not.toHaveBeenCalled();
    expect(gateway.transaction.refund).not.toHaveBeenCalled();
  });

  it('performs real void for authorized/submitted_for_settlement when not imported-refunded', async () => {
    const { service, gateway } = buildService();
    const session = { transactionId: 't2', importedAsRefunded: false, refundedTotal: 0, status: 'captured' } as any;
    gateway.transaction.find.mockResolvedValueOnce({ id: 't2', status: 'authorized' });
    gateway.transaction.void.mockResolvedValueOnce({ success: true });

    const res = await service.refundPayment({ amount: 10, data: session } as any);
    expect(gateway.transaction.void).toHaveBeenCalledWith('t2');
    expect((res.data as any).refundedTotal).toBe(10);
  });

  it('performs real refund for settled/settling when not imported-refunded', async () => {
    const { service, gateway } = buildService();
    const session = { transactionId: 't3', importedAsRefunded: false, refundedTotal: 1.25, status: 'captured' } as any;
    gateway.transaction.find.mockResolvedValueOnce({ id: 't3', status: 'settled' });
    gateway.transaction.refund.mockResolvedValueOnce({ transaction: { id: 'r3' } });

    const res = await service.refundPayment({ amount: 2.75, data: session } as any);
    expect(gateway.transaction.refund).toHaveBeenCalledWith('t3', '2.75');
    expect((res.data as any).refundedTotal).toBe(4.0);
  });

  it('gracefully handles already-refunded transactions when allowRefundOnRefunded is enabled', async () => {
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const cache = { get: jest.fn(), set: jest.fn() } as any;

    const container: BraintreeConstructorArgs = { logger, cache };

    const options = {
      environment: 'sandbox' as const,
      merchantId: 'merchant',
      publicKey: 'public',
      privateKey: 'private',
      enable3DSecure: false,
      savePaymentMethod: false,
      webhookSecret: 'whsec',
      autoCapture: true,
      allowRefundOnRefunded: true, // Enable graceful handling
    } as any;

    const service = new BraintreeImportService(container, options);

    const gateway = {
      transaction: {
        find: jest.fn(),
        void: jest.fn(),
        refund: jest.fn(),
      },
    } as any;

    (service as any).gateway = gateway;

    const session = { transactionId: 't4', importedAsRefunded: false, refundedTotal: 0, status: 'captured' } as any;
    gateway.transaction.find.mockResolvedValueOnce({ id: 't4', status: 'settled' });
    gateway.transaction.refund.mockRejectedValueOnce(new Error('Transaction has already been refunded'));

    const res = await service.refundPayment({ amount: 10, data: session } as any);

    // Should not throw error, but log warning and update locally
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('already refunded in Braintree'),
    );
    expect((res.data as any).refundedTotal).toBe(10);
  });

  it('throws error on non-refund-related errors even with allowRefundOnRefunded enabled', async () => {
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const cache = { get: jest.fn(), set: jest.fn() } as any;

    const container: BraintreeConstructorArgs = { logger, cache };

    const options = {
      environment: 'sandbox' as const,
      merchantId: 'merchant',
      publicKey: 'public',
      privateKey: 'private',
      enable3DSecure: false,
      savePaymentMethod: false,
      webhookSecret: 'whsec',
      autoCapture: true,
      allowRefundOnRefunded: true,
    } as any;

    const service = new BraintreeImportService(container, options);

    const gateway = {
      transaction: {
        find: jest.fn(),
        void: jest.fn(),
        refund: jest.fn(),
      },
    } as any;

    (service as any).gateway = gateway;

    const session = { transactionId: 't5', importedAsRefunded: false, refundedTotal: 0, status: 'captured' } as any;
    gateway.transaction.find.mockResolvedValueOnce({ id: 't5', status: 'settled' });
    gateway.transaction.refund.mockRejectedValueOnce(new Error('Network timeout'));

    await expect(service.refundPayment({ amount: 10, data: session } as any)).rejects.toThrow('Network timeout');
  });
});
