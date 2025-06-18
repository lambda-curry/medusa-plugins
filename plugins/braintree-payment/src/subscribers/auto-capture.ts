import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

export default async function orderPlacedCaptureHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve('logger');
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const paymentModuleService = container.resolve(Modules.PAYMENT);

  const { data: orders } = await query.graph({
    entity: 'order',
    fields: [
      'payment_collections.*',
      'payment_collections.payment_sessions.*',
      'payment_collections.payment_sessions.payment.*',
    ],
    filters: {
      id: { $eq: data.id },
    },
  });

  // orders[0].payment_collections
  logger.info(`Order placed with ID: ${data.id}`);

  if (!orders.length) {
    logger.warn(`Order ${data.id} not found - skipping capture`);
    return;
  }

  const paymentSessionsRaw = orders[0].payment_collections?.flatMap((collection) => {
    return collection.payment_sessions;
  });

  const paymentSessionAuthorized = paymentSessionsRaw?.filter(
    (session) => session.provider_id === 'pp_braintree_braintree' && session.status === 'authorized',
  );

  if (paymentSessionAuthorized && paymentSessionAuthorized?.length > 0) {
    await Promise.all(
      paymentSessionAuthorized.map(async (session) => {
        try {
          if (session?.payment) {
            await paymentModuleService.capturePayment({
              payment_id: session.payment.id,
              amount: session.amount,
              captured_by: 'system',
            });
          } else {
            logger.error(`Authrorized Payment not found for order ${data.id}`);
          }

          logger.info(`Payment captured for order ${session.id}`);
        } catch (error) {
          logger.error(`Failed to capture payment for order ${data.id}: ${error.message}`);
        }
      }),
    );
  } else {
    logger.warn(`No payment found for order ${data.id}`);
  }
}
export const config: SubscriberConfig = {
  event: 'none', //'order.placed',
};
