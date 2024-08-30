import { EventBusService, Logger, OrderService, ProductService, defaultAdminProductRelations } from '@medusajs/medusa';
import { WebhookService } from '../services';

interface ConstructorArgs {
  logger: Logger;
  eventBusService: EventBusService;
  webhookService: WebhookService;
  productService: ProductService;
  orderService: OrderService;
}

export class WebhookSubscriber {
  private logger_: Logger;
  private eventBusService_: EventBusService;
  private webhookService_: WebhookService;
  private productService_: ProductService;
  private orderService_: OrderService;

  constructor(args: ConstructorArgs) {
    this.logger_ = args.logger;
    this.eventBusService_ = args.eventBusService;
    this.webhookService_ = args.webhookService;
    this.productService_ = args.productService;
    this.orderService_ = args.orderService;

    Object.values(OrderService.Events).forEach((event) => {
      this.eventBusService_.subscribe(event, (payload) => this.handleOrderEvent(event, payload));
    });

    Object.values(ProductService.Events).forEach((event) => {
      this.eventBusService_.subscribe(event, (payload) => this.handleProductEvent(event, payload));
    });
  }

  async handleOrderEvent(event: string, payload: any) {
    const order = await this.webhookService_.retrieveWebhooksOrderWithTotals(payload.id);

    const webhooks = await this.webhookService_.list({
      event_type: event,
      active: true,
    });

    await this.webhookService_.sendWebhooksEvents(
      webhooks,
      this.webhookService_.webhookResponse({ event_type: event, payload: order }, 'order'),
    );
  }

  async handleProductEvent(event: string, payload: any) {
    const product =
      payload.id && event !== ProductService.Events.DELETED
        ? await this.productService_.retrieve(payload.id, {
            relations: defaultAdminProductRelations,
          })
        : null;

    const webhooks = await this.webhookService_.list({
      event_type: event,
      active: true,
    });

    await this.webhookService_.sendWebhooksEvents(
      webhooks,
      this.webhookService_.webhookResponse(
        {
          event_type: event,
          payload: product,
        },
        'product',
      ),
    );
  }
}

export default WebhookSubscriber;
