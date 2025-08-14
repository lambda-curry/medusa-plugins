import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import BraintreeProviderService from '../../services/braintree-provider';
import { BraintreeConstructorArgs, BraintreePaymentSessionData } from '../braintree-base';

const buildService = () => {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
  const cache = { get: jest.fn(), set: jest.fn() } as any;

  const container: BraintreeConstructorArgs = {
    logger,
    cache,
  };

  const options = {
    environment: 'sandbox' as const,
    merchantId: 'merchant',
    publicKey: 'public',
    privateKey: 'private',
    enable3DSecure: false,
    savePaymentMethod: false,
    webhookSecret: 'whsec',
    autoCapture: true,
  } as any; // satisfy BraintreeOptions without bringing full type deps

  const service = new BraintreeProviderService(container, options);

  // Replace gateway with a mock implementation
  const gateway = {
    clientToken: { generate: jest.fn() },
    transaction: {
      sale: jest.fn(),
      find: jest.fn(),
      submitForSettlement: jest.fn(),
      void: jest.fn(),
      refund: jest.fn(),
    },
    paymentMethod: { create: jest.fn() },
    customer: { find: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    webhookNotification: { parse: jest.fn() },
  } as any;

  (service as any).gateway = gateway;

  return { service, gateway, logger, cache };
};

describe('BraintreeProviderService core behaviors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns cached client token when available', async () => {
    const { service, gateway, cache } = buildService();
    cache.get.mockResolvedValueOnce('cached-token');

    const token = await (service as any).getValidClientToken('cust_1');

    expect(token).toBe('cached-token');
    expect(gateway.clientToken.generate).not.toHaveBeenCalled();
  });

  it('generates and caches client token when missing, with correct TTL', async () => {
    const { service, gateway, cache } = buildService();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00Z'));

    cache.get.mockResolvedValueOnce(null);
    gateway.clientToken.generate.mockResolvedValueOnce({ clientToken: 'new-token' });

    const token = await (service as any).getValidClientToken('cust_2');

    expect(token).toBe('new-token');
    expect(cache.set).toHaveBeenCalled();
    const setArgs = cache.set.mock.calls[0];
    // [key, value, ttlSeconds]
    expect(setArgs[1]).toBe('new-token');
    // 24h - 1s
    expect(setArgs[2]).toBe(24 * 3600 - 1);
  });

  it('authorizePayment creates a sale with decimal string amount and returns captured when autoCapture=true', async () => {
    const { service, gateway } = buildService();

    const input = {
      data: {
        clientToken: 'ct',
        amount: 1000, // smallest unit
        currency_code: 'USD',
        paymentMethodNonce: 'fake-nonce',
      },
      context: {
        idempotency_key: 'idem_1',
        customer: { id: 'cust', email: 'c@example.com' },
      },
    } as any;

    gateway.transaction.sale.mockResolvedValueOnce({ success: true, transaction: { id: 't1' } });
    gateway.transaction.find.mockResolvedValue({ id: 't1', status: 'authorized', amount: '10.00' });

    const result = await service.authorizePayment(input);

    expect(gateway.transaction.sale).toHaveBeenCalled();
    const saleArgs = gateway.transaction.sale.mock.calls[0][0];
    expect(saleArgs.amount).toBe('10.00');
    expect(result.status).toBe('captured');
  });

  it('capturePayment submits for settlement when status is authorized', async () => {
    const { service, gateway } = buildService();

    const input = {
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't1' },
      },
    } as any;

    gateway.transaction.find
      .mockResolvedValueOnce({ id: 't1', status: 'authorized', amount: '10.00' }) // pre-check
      .mockResolvedValueOnce({ id: 't1', status: 'submitted_for_settlement', amount: '10.00' }); // retrieve after submit
    gateway.transaction.submitForSettlement.mockResolvedValueOnce({ success: true });

    const result = await service.capturePayment(input);

    expect(gateway.transaction.submitForSettlement).toHaveBeenCalledWith('t1', '10.00');

    const data = result.data as unknown as BraintreePaymentSessionData;
    expect(data?.braintreeTransaction?.id).toBe('t1');
  });

  it('refundPayment voids when transaction is authorized', async () => {
    const { service, gateway } = buildService();

    const input = {
      amount: 5, // standard unit, will be converted internally
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't1' },
      },
    } as any;

    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'authorized' });
    gateway.transaction.void.mockResolvedValueOnce({ success: true });
    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'voided' });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.void).toHaveBeenCalledWith('t1');
    expect((result.data as any)?.braintreeRefund?.success).toBe(true);
  });

  it('refundPayment voids when transaction is submitted_for_settlement', async () => {
    const { service, gateway } = buildService();

    const input = {
      amount: 10, // standard unit
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't1' },
      },
    } as any;

    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'submitted_for_settlement' });
    gateway.transaction.void.mockResolvedValueOnce({ success: true });
    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'voided' });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.void).toHaveBeenCalledWith('t1');
    expect((result.data as any)?.braintreeRefund?.success).toBe(true);
  });

  it('refundPayment refunds when transaction is settling', async () => {
    const { service, gateway } = buildService();

    const input = {
      amount: 7.5, // standard unit => 750 smallest => "7.50" decimal
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't2' },
      },
    } as any;

    gateway.transaction.find
      .mockResolvedValueOnce({ id: 't2', status: 'settling' })
      .mockResolvedValueOnce({ id: 't2', status: 'settling' });
    gateway.transaction.refund.mockResolvedValueOnce({ transaction: { id: 'r2' } });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.refund).toHaveBeenCalledWith('t2', '7.50');
    expect((result.data as any)?.braintreeRefund?.id).toBe('r2');
  });

  it('refundPayment throws for non-refundable statuses', async () => {
    const { service, gateway } = buildService();

    const input = {
      amount: 5,
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't3' },
      },
    } as any;

    gateway.transaction.find.mockResolvedValueOnce({ id: 't3', status: 'failed' });

    await expect(service.refundPayment(input)).rejects.toThrow();
    expect(gateway.transaction.void).not.toHaveBeenCalled();
    expect(gateway.transaction.refund).not.toHaveBeenCalled();
  });

  it('refundPayment importRefundedAmount hack skips provider refund and updates refundedTotal', async () => {
    const { service, gateway } = buildService();

    const input = {
      amount: 5, // standard unit => refundAmount = 500 (USD)
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't4' },
        importRefundedAmount: 500,
        refundedTotal: 200,
      },
    } as any;

    gateway.transaction.find.mockResolvedValueOnce({ id: 't4', status: 'settled' });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.void).not.toHaveBeenCalled();
    expect(gateway.transaction.refund).not.toHaveBeenCalled();

    const data = result.data as any;
    expect(data.refundedTotal).toBe(200 + 500);
    expect(data.braintreeTransaction?.id).toBe('t4');
  });

  it('refundPayment refunds with decimal string when transaction is settled', async () => {
    const { service, gateway } = buildService();

    const input = {
      amount: 5, // standard unit => 500 smallest => "5.00" decimal
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't2' },
      },
    } as any;

    gateway.transaction.find
      .mockResolvedValueOnce({ id: 't2', status: 'settled' }) // retrieveTransaction
      .mockResolvedValueOnce({ id: 't2', status: 'settled' }); // updated after refund
    gateway.transaction.refund.mockResolvedValueOnce({ transaction: { id: 'r1' } });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.refund).toHaveBeenCalledWith('t2', '5.00');
    expect((result.data as any)?.braintreeRefund?.id).toBe('r1');
  });

  it('getPaymentStatus maps provider status correctly', async () => {
    const { service, gateway } = buildService();
    const input = { data: { braintreeTransaction: { id: 't3' } } } as any;
    gateway.transaction.find.mockResolvedValueOnce({ id: 't3', status: 'failed' });

    const result = await service.getPaymentStatus(input);
    expect(result.status).toBe('error');
  });

  it('getWebhookActionAndData returns successful for transaction_settled', async () => {
    const { service, gateway } = buildService();
    const payloadStr = 'bt_signature=s&bt_payload=p';
    gateway.webhookNotification.parse.mockResolvedValueOnce({
      kind: 'transaction_settled',
      transaction: { id: 't4' },
    });
    gateway.transaction.find.mockResolvedValueOnce({
      id: 't4',
      amount: '12.34',
      customFields: { medusa_payment_session_id: 'sess_123' },
    });

    const result = await service.getWebhookActionAndData({ data: payloadStr } as any);
    expect(result.action).toBe('captured');
    expect((result as any).data.session_id).toBe('sess_123');
  });
});
