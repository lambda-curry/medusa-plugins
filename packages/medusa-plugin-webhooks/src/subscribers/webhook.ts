import {
  CustomerService,
  EventBusService,
  Logger,
  OrderService,
  ProductService,
  defaultAdminCustomersRelations,
  defaultAdminProductRelations,
} from "@medusajs/medusa";
import WebhookService from "../services/webhook";

interface ConstructorArgs {
  logger: Logger;
  eventBusService: EventBusService;
  webhookService: WebhookService;
  productService: ProductService;
  customerService: CustomerService;
}

export class WebhookSubscriber {
  private logger_: Logger;
  private eventBusService_: EventBusService;
  private webhookService_: WebhookService;
  private productService_: ProductService;
  private customerService_: CustomerService;

  constructor(args: ConstructorArgs) {
    this.logger_ = args.logger;
    this.eventBusService_ = args.eventBusService;
    this.webhookService_ = args.webhookService;
    this.productService_ = args.productService;
    this.customerService_ = args.customerService;

    Object.values(OrderService.Events).forEach((event) => {
      this.eventBusService_.subscribe(event, (payload) =>
        this.handleOrderEvent(event, payload)
      );
    });

    Object.values(ProductService.Events).forEach((event) => {
      this.eventBusService_.subscribe(event, (payload) =>
        this.handleProductEvent(event, payload)
      );
    });

    Object.values(CustomerService.Events).forEach((event) => {
      this.eventBusService_.subscribe(event, (payload) =>
        this.handleCustomerEvent(event, payload)
      );
    });
  }

  async handleOrderEvent(event: string, payload: any) {
    const order = await this.webhookService_.retrieveWebhooksOrderWithTotals(
      payload.id
    );

    const webhooks = await this.webhookService_.list({
      event_type: event,
      active: true,
    });

    await this.webhookService_.sendWebhooksEvents(
      webhooks,
      this.webhookService_.webhookResponse(
        { event_type: event, payload: order },
        "order"
      )
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
        "product"
      )
    );
  }

  async handleCustomerEvent(event: string, payload: any) {
    const customer = await this.customerService_.retrieve(payload.id, {
      relations: defaultAdminCustomersRelations,
    });

    const webhooks = await this.webhookService_.list({
      event_type: event,
      active: true,
    });

    await this.webhookService_.sendWebhooksEvents(
      webhooks,
      this.webhookService_.webhookResponse(
        { event_type: event, payload: customer },
        "customer"
      )
    );
  }
}

export default WebhookSubscriber;
