import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MedusaError } from '@medusajs/framework/utils';
import type { RefundPaymentInput } from '@medusajs/types';
import BraintreeProviderService from '../../services/braintree-provider';
import { BraintreeConstructorArgs, BraintreePaymentSessionData } from '../braintree-base';
import type { BraintreeOptions } from '../../types';

type RefundHistoryEntry = {
  type?: 'voided' | 'refund';
  transaction?: { id?: string; status?: string };
};

type RefundResultData = {
  braintreeRefund?: RefundHistoryEntry[];
};

const lastRefundEntry = (data: unknown): RefundHistoryEntry | undefined => {
  const history = (data as RefundResultData)?.braintreeRefund;
  return history?.[history.length - 1];
};

const buildService = (overrideOptions?: Partial<BraintreeOptions>) => {
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
    logging: false,
    ...overrideOptions,
  } as BraintreeOptions;

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
    testing: { settle: jest.fn() },
  } as any;

  (service as any).gateway = gateway;

  return { service, gateway, logger, cache };
};

const settledRefundInput = (amount: number, transactionId = 't-settled'): RefundPaymentInput => ({
  amount,
  data: {
    clientToken: 'ct',
    amount: 350000,
    currency_code: 'USD',
    braintreeTransaction: { id: transactionId },
  },
});

describe('BraintreeProviderService core behaviors', () => {
  const originalTestForceSettled = process.env.TEST_FORCE_SETTLED;

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.TEST_FORCE_SETTLED;
  });

  afterEach(() => {
    jest.useRealTimers();
    if (originalTestForceSettled === undefined) {
      delete process.env.TEST_FORCE_SETTLED;
    } else {
      process.env.TEST_FORCE_SETTLED = originalTestForceSettled;
    }
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

  it('authorizePayment creates a sale with decimal string amount (2dp) and returns captured when autoCapture=true', async () => {
    const { service, gateway } = buildService();

    const input = {
      data: {
        clientToken: 'ct',
        amount: 10, // standard unit -> "10.00"
        currency_code: 'USD',
        payment_method_nonce: 'fake-nonce',
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

  it('authorizePayment surfaces validation errors when Braintree returns an unknown error message', async () => {
    const { service, gateway } = buildService();

    const input = {
      data: {
        clientToken: 'ct',
        amount: 10,
        currency_code: 'USD',
        payment_method_nonce: 'fake-nonce',
      },
      context: {
        idempotency_key: 'idem_2',
      },
    } as any;

    gateway.transaction.sale.mockResolvedValueOnce({
      success: false,
      message: '',
      errors: {
        deepErrors: () => [
          {
            attribute: 'postalCode',
            code: '81813',
            message: 'Postal code is invalid.',
          },
        ],
      },
      transaction: {},
    });

    await expect(service.authorizePayment(input)).rejects.toMatchObject({
      type: MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
      message: 'BT: postalCode: Postal code is invalid. (81813)',
    });
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
    expect(data?.transaction?.id).toBe('t1');
  });

  it('refundPayment voids when transaction is authorized', async () => {
    const { service, gateway } = buildService();

    const input: RefundPaymentInput = {
      amount: 5, // standard unit, will be converted internally
      data: {
        client_token: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't1' },
      },
    };

    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'authorized' });
    gateway.transaction.void.mockResolvedValueOnce({ success: true });
    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'voided' });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.void).toHaveBeenCalledWith('t1');
    const entry = lastRefundEntry(result.data);
    expect(entry?.type).toBe('voided');
    expect(entry?.transaction?.id).toBe('t1');
  });

  it('refundPayment appends to existing braintreeRefund history', async () => {
    const { service, gateway } = buildService();
    const priorEntry = {
      type: 'refund' as const,
      transaction: { id: 'r-prior', status: 'submitted_for_settlement' },
    };

    const input: RefundPaymentInput = {
      amount: 3,
      data: {
        client_token: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't1' },
        braintreeRefund: [priorEntry],
      },
    };

    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'settled' });
    gateway.transaction.refund.mockResolvedValueOnce({
      success: true,
      transaction: { id: 'r-new', status: 'submitted_for_settlement' },
    });

    const result = await service.refundPayment(input);
    const history = (result.data as RefundResultData)?.braintreeRefund;

    expect(history).toHaveLength(2);
    expect(history?.[0]).toMatchObject(priorEntry);
    expect(history?.[1]?.type).toBe('refund');
    expect(history?.[1]?.transaction?.id).toBe('r-new');
  });

  it('refundPayment voids when transaction is submitted_for_settlement', async () => {
    const { service, gateway } = buildService();

    const input: RefundPaymentInput = {
      amount: 10, // standard unit
      data: {
        client_token: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't1' },
      },
    };

    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'submitted_for_settlement' });
    gateway.transaction.void.mockResolvedValueOnce({ success: true });
    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'voided' });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.void).toHaveBeenCalledWith('t1');
    const entry = lastRefundEntry(result.data);
    expect(entry?.type).toBe('voided');
    expect(entry?.transaction?.id).toBe('t1');
  });

  it('refundPayment refunds with 2dp when transaction is settling', async () => {
    const { service, gateway } = buildService();

    const input: RefundPaymentInput = {
      amount: 7.5, // -> "7.50"
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't2' },
      },
    };

    gateway.transaction.find
      .mockResolvedValueOnce({ id: 't2', status: 'settling' })
      .mockResolvedValueOnce({ id: 't2', status: 'settling' });
    gateway.transaction.refund.mockResolvedValueOnce({ success: true, transaction: { id: 'r2' } });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.refund).toHaveBeenCalledWith('t2', '7.50');
    const entry = lastRefundEntry(result.data);
    expect(entry?.type).toBe('refund');
    expect(entry?.transaction?.id).toBe('r2');
  });

  it('refundPayment throws for non-refundable statuses', async () => {
    const { service, gateway } = buildService();

    const input: RefundPaymentInput = {
      amount: 5,
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't3' },
      },
    };

    gateway.transaction.find.mockResolvedValueOnce({ id: 't3', status: 'failed' });

    await expect(service.refundPayment(input)).rejects.toThrow();
    expect(gateway.transaction.void).not.toHaveBeenCalled();
    expect(gateway.transaction.refund).not.toHaveBeenCalled();
  });

  it('refundPayment refunds with 2dp decimal string when transaction is settled', async () => {
    const { service, gateway } = buildService();

    const input: RefundPaymentInput = {
      amount: 5.001, // -> "5.00"
      data: {
        clientToken: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't2' },
      },
    };

    gateway.transaction.find
      .mockResolvedValueOnce({ id: 't2', status: 'settled' }) // retrieveTransaction
      .mockResolvedValueOnce({ id: 't2', status: 'settled' }); // updated after refund
    gateway.transaction.refund.mockResolvedValueOnce({ success: true, transaction: { id: 'r1' } });

    const result = await service.refundPayment(input);

    expect(gateway.transaction.refund).toHaveBeenCalledWith('t2', '5.00');
    const entry = lastRefundEntry(result.data);
    expect(entry?.type).toBe('refund');
    expect(entry?.transaction?.id).toBe('r1');
  });

  it('refundPayment throws PAYMENT_AUTHORIZATION_ERROR with processor code 2005 on decline', async () => {
    const { service, gateway } = buildService();

    gateway.transaction.find.mockResolvedValueOnce({ id: 't-settled', status: 'settled' });
    gateway.transaction.refund.mockResolvedValueOnce({
      success: false,
      message: '',
      transaction: {
        status: 'processor_declined',
        processorResponseText: 'Invalid Credit Card Number',
        processorResponseCode: '2005',
      },
    });

    await expect(service.refundPayment(settledRefundInput(2005))).rejects.toMatchObject({
      type: MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
      message: 'Invalid Credit Card Number (2005)',
    });
  });

  it('refundPayment throws PAYMENT_AUTHORIZATION_ERROR on settlement_declined', async () => {
    const { service, gateway } = buildService();

    gateway.transaction.find.mockResolvedValueOnce({ id: 't-settled', status: 'settled' });
    gateway.transaction.refund.mockResolvedValueOnce({
      success: false,
      message: '',
      transaction: {
        status: 'settlement_declined',
        processorSettlementResponseText: 'Settlement Declined',
        processorSettlementResponseCode: '4001',
      },
    });

    await expect(service.refundPayment(settledRefundInput(50))).rejects.toMatchObject({
      type: MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
      message: 'Settlement Declined (4001)',
    });
  });

  it('refundPayment throws INVALID_DATA for validation-only refund failures', async () => {
    const { service, gateway } = buildService();

    gateway.transaction.find.mockResolvedValueOnce({ id: 't-settled', status: 'settled' });
    gateway.transaction.refund.mockResolvedValueOnce({
      success: false,
      message: '',
      errors: {
        deepErrors: () => [
          {
            attribute: 'amount',
            code: '91517',
            message: 'Refund amount is too large.',
          },
        ],
      },
      transaction: {},
    });

    await expect(service.refundPayment(settledRefundInput(9999))).rejects.toMatchObject({
      type: MedusaError.Types.INVALID_DATA,
      message: 'BT: amount: Refund amount is too large. (91517)',
    });
  });

  it('refundPayment does not double-wrap handled decline errors', async () => {
    const { service, gateway } = buildService();

    gateway.transaction.find.mockResolvedValueOnce({ id: 't-settled', status: 'settled' });
    gateway.transaction.refund.mockResolvedValueOnce({
      success: false,
      message: 'Gateway rejected refund',
      transaction: {
        status: 'processor_declined',
        processorResponseText: 'Invalid Credit Card Number',
        processorResponseCode: '2005',
      },
    });

    await expect(service.refundPayment(settledRefundInput(2005))).rejects.not.toThrow(
      /Failed to create Braintree refund/,
    );
  });

  it('refundPayment treats processor_declined status as failure even when success is true', async () => {
    const { service, gateway } = buildService();

    gateway.transaction.find.mockResolvedValueOnce({ id: 't-settled', status: 'settled' });
    gateway.transaction.refund.mockResolvedValueOnce({
      success: true,
      message: '',
      transaction: {
        status: 'processor_declined',
        processorResponseText: 'Expired Card',
        processorResponseCode: '2004',
      },
    });

    await expect(service.refundPayment(settledRefundInput(2004))).rejects.toMatchObject({
      type: MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
      message: 'Expired Card (2004)',
    });
  });

  it('refundPayment void failure surfaces processor decline details', async () => {
    const { service, gateway } = buildService();

    const input: RefundPaymentInput = {
      amount: 10,
      data: {
        client_token: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't-void' },
      },
    };

    gateway.transaction.find.mockResolvedValueOnce({ id: 't-void', status: 'authorized' });
    gateway.transaction.void.mockResolvedValueOnce({
      success: false,
      message: '',
      transaction: {
        status: 'processor_declined',
        processorResponseText: 'Do Not Honor',
        processorResponseCode: '2000',
      },
    });

    await expect(service.refundPayment(input)).rejects.toMatchObject({
      type: MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
      message: 'Do Not Honor (2000)',
    });
  });

  it('refundPayment settles then refunds when TEST_FORCE_SETTLED is enabled in sandbox', async () => {
    process.env.TEST_FORCE_SETTLED = 'true';
    const { service, gateway } = buildService({ environment: 'sandbox' });

    gateway.transaction.find
      .mockResolvedValueOnce({ id: 't-force', status: 'authorized' })
      .mockResolvedValueOnce({ id: 't-force', status: 'settled' });
    gateway.testing.settle.mockResolvedValueOnce({ success: true });
    gateway.transaction.refund.mockResolvedValueOnce({
      success: true,
      transaction: { id: 'r-force', status: 'submitted_for_settlement' },
    });

    const result = await service.refundPayment(settledRefundInput(10, 't-force'));

    expect(gateway.testing.settle).toHaveBeenCalledWith('t-force');
    expect(gateway.transaction.void).not.toHaveBeenCalled();
    expect(gateway.transaction.refund).toHaveBeenCalledWith('t-force', '10.00');
    const forceEntry = lastRefundEntry(result.data);
    expect(forceEntry?.type).toBe('refund');
    expect(forceEntry?.transaction?.id).toBe('r-force');
  });

  it('refundPayment ignores TEST_FORCE_SETTLED outside sandbox and voids authorized transactions', async () => {
    process.env.TEST_FORCE_SETTLED = 'true';
    const { service, gateway, logger } = buildService({ environment: 'production' });

    gateway.transaction.find
      .mockResolvedValueOnce({ id: 't-prod', status: 'authorized' })
      .mockResolvedValueOnce({ id: 't-prod', status: 'voided' });
    gateway.transaction.void.mockResolvedValueOnce({ success: true, transaction: { id: 't-prod', status: 'voided' } });

    const result = await service.refundPayment(settledRefundInput(10, 't-prod'));

    expect(gateway.testing.settle).not.toHaveBeenCalled();
    expect(gateway.transaction.void).toHaveBeenCalledWith('t-prod');
    expect(gateway.transaction.refund).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      '[Braintree refund] TEST_FORCE_SETTLED ignored — only supported when environment is sandbox',
    );
    const prodEntry = lastRefundEntry(result.data);
    expect(prodEntry?.type).toBe('voided');
    expect(prodEntry?.transaction?.id).toBe('t-prod');
  });

  it('refundPayment tolerates legacy non-array braintreeRefund session data', async () => {
    const { service, gateway } = buildService();

    const input: RefundPaymentInput = {
      amount: 5,
      data: {
        client_token: 'ct',
        amount: 1000,
        currency_code: 'USD',
        braintreeTransaction: { id: 't1' },
        braintreeRefund: { success: true, type: 'void' },
      },
    };

    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'authorized' });
    gateway.transaction.void.mockResolvedValueOnce({ success: true });
    gateway.transaction.find.mockResolvedValueOnce({ id: 't1', status: 'voided' });

    const result = await service.refundPayment(input);
    const history = (result.data as RefundResultData)?.braintreeRefund;

    expect(Array.isArray(history)).toBe(true);
    expect(history).toHaveLength(1);
    expect(history?.[0]?.type).toBe('voided');
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

  it('getWebhookActionAndData tolerates transactions without customFields', async () => {
    const { service, gateway } = buildService();
    gateway.webhookNotification.parse.mockResolvedValueOnce({
      kind: 'transaction_settled',
      transaction: { id: 't-foreign' },
    });
    gateway.transaction.find.mockResolvedValueOnce({
      id: 't-foreign',
      amount: '1.00',
    });

    const result = await service.getWebhookActionAndData({
      data: 'bt_signature=s&bt_payload=p',
    } as any);

    expect(result.action).toBe('captured');
    expect((result as any).data.session_id).toBe('');
  });

  it('authorizePayment fails clearly when sale Result omits transaction id', async () => {
    const { service, gateway } = buildService();

    gateway.transaction.sale.mockResolvedValueOnce({ success: true, transaction: undefined });

    await expect(
      service.authorizePayment({
        data: {
          clientToken: 'ct',
          amount: 10,
          currency_code: 'USD',
          payment_method_nonce: 'fake-nonce',
        },
        context: { idempotency_key: 'idem_missing_tx' },
      } as any),
    ).rejects.toMatchObject({
      type: MedusaError.Types.INVALID_DATA,
      message: 'Braintree sale succeeded without a transaction id',
    });
  });

  it('authorizePayment preserves sync error when orphan void rejects', async () => {
    const { service, gateway, logger } = buildService();

    gateway.transaction.sale.mockResolvedValueOnce({ success: true, transaction: { id: 't-orphan' } });
    gateway.transaction.find.mockRejectedValueOnce(new Error('sync failed'));
    gateway.transaction.void.mockRejectedValueOnce(new Error('void network error'));

    await expect(
      service.authorizePayment({
        data: {
          clientToken: 'ct',
          amount: 10,
          currency_code: 'USD',
          payment_method_nonce: 'fake-nonce',
        },
        context: { idempotency_key: 'idem_orphan_reject' },
      } as any),
    ).rejects.toMatchObject({
      type: MedusaError.Types.INVALID_DATA,
      message: expect.stringContaining('sync payment session'),
    });

    expect(gateway.transaction.void).toHaveBeenCalledWith('t-orphan');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to void orphan Braintree transaction t-orphan'),
      expect.any(Error),
    );
  });

  it('authorizePayment preserves sync error when orphan void returns success false', async () => {
    const { service, gateway, logger } = buildService();

    gateway.transaction.sale.mockResolvedValueOnce({ success: true, transaction: { id: 't-orphan2' } });
    gateway.transaction.find.mockRejectedValueOnce(new Error('sync failed'));
    gateway.transaction.void.mockResolvedValueOnce({
      success: false,
      message: 'Cannot void',
      transaction: { status: 'processor_declined', processorResponseText: 'Do Not Honor' },
    });

    await expect(
      service.authorizePayment({
        data: {
          clientToken: 'ct',
          amount: 10,
          currency_code: 'USD',
          payment_method_nonce: 'fake-nonce',
        },
        context: { idempotency_key: 'idem_orphan_false' },
      } as any),
    ).rejects.toMatchObject({
      type: MedusaError.Types.INVALID_DATA,
      message: expect.stringContaining('sync payment session'),
    });

    expect(gateway.transaction.void).toHaveBeenCalledWith('t-orphan2');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to void orphan Braintree transaction t-orphan2 after sync failure'),
    );
  });

  it('getWebhookActionAndData propagates webhook parse failures', async () => {
    const { service, gateway } = buildService();
    gateway.webhookNotification.parse.mockRejectedValueOnce(new Error('invalid signature'));

    await expect(
      service.getWebhookActionAndData({ data: 'bt_signature=bad&bt_payload=x' } as any),
    ).rejects.toMatchObject({
      type: MedusaError.Types.INVALID_DATA,
      message: expect.stringContaining('validate Braintree webhook'),
    });
  });
});
