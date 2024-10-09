import {
  CustomerService,
  FindConfig,
  Logger,
  OrderService,
  ProductService,
  Selector,
  TransactionBaseService,
  buildQuery,
} from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import WebhookRepository from "../repositories/webhook";
import { Webhook } from "../models/webhook";
import { MedusaError } from "medusa-core-utils";
import OrderRepository from "@medusajs/medusa/dist/repositories/order";
import {
  defaultAdminOrdersFields,
  defaultAdminOrdersRelations,
} from "@medusajs/medusa/dist/types/orders";
import fetch from "node-fetch";

type WebhookSendResponse = {
  event_type: string;
  target_url: string;
  result: "success" | "error";
  data?: any;
  message?: string;
  err?: any;
};

type WebhookSendResponseError = {
  message: string;
  cause: {
    code: string;
  };
};

type InjectedDependencies = {
  logger: Logger;
  manager: EntityManager;
  productService: ProductService;
  orderService: OrderService;
  customerService: CustomerService;
  readonly webhookRepository: typeof WebhookRepository;
  orderRepository: typeof OrderRepository;
};

type BaseWebhook = Pick<Webhook, "target_url" | "event_type">;

class WebhookService extends TransactionBaseService {
  private readonly logger_: Logger;

  readonly productService_: ProductService;
  readonly orderService_: OrderService;
  readonly customerService_: CustomerService;

  private readonly webhookRepository_: typeof WebhookRepository;
  private readonly orderRepository_: typeof OrderRepository;

  public readonly customSubscriptions: string[] = [];

  constructor(
    container: InjectedDependencies,
    { customSubscriptions = [] }: { customSubscriptions: string[] }
  ) {
    super(container);
    this.logger_ = container.logger;

    this.productService_ = container.productService;
    this.orderService_ = container.orderService;
    this.customerService_ = container.customerService;
    this.webhookRepository_ = container.webhookRepository;
    this.orderRepository_ = container.orderRepository;
    this.customSubscriptions = customSubscriptions;
  }

  private onSendError(
    err: WebhookSendResponseError,
    subscription: BaseWebhook,
    payload: any
  ): WebhookSendResponse {
    this.logger_.error("Error sending webhook", {
      subscription,
      payload,
      err,
    });

    return {
      event_type: subscription.event_type,
      target_url: subscription.target_url,
      result: "error",
      message: err?.message ?? err?.cause?.code ?? "Unknown error",
      err: err?.cause ?? err,
    };
  }

  async listAndCount(
    selector: Selector<Webhook>,
    config: any
  ): Promise<[Webhook[], number]> {
    const repo = this.activeManager_.withRepository(this.webhookRepository_);

    const query = buildQuery(selector, {
      skip: config.offset,
      take: config.limit,
    });

    return await repo.findAndCount(query);
  }

  public async list(
    selector: Selector<Webhook>,
    config?: FindConfig<Webhook>
  ): Promise<Webhook[]> {
    const repo = this.activeManager_.withRepository(this.webhookRepository_);
    const query = buildQuery(selector, config);

    const subscriptions = await repo.find(query);

    return subscriptions;
  }

  public async send(
    subscription: BaseWebhook,
    payload: any
  ): Promise<WebhookSendResponse> {
    const { event_type, target_url } = subscription;

    try {
      const response = await fetch(target_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("json")
        ? await response.json()
        : await response.text();

      return {
        event_type,
        target_url,
        result: "success",
        data,
      };
    } catch (err) {
      return this.onSendError(err, subscription, payload);
    }
  }

  public async sendWebhooksEvents(webhooks: Webhook[], payload: any) {
    const results = (await Promise.allSettled(
      webhooks.map((webhook) => this.send(webhook, payload))
    )) as PromiseFulfilledResult<WebhookSendResponse>[];

    results.forEach((result) => {
      const resultMessage =
        result.value?.result === "error" ? "failed" : "succeeded";

      this.logger_.info(
        `Webhook ${result.value?.event_type} -> ${result.value?.target_url} ${resultMessage}.`
      );
    });

    return results;
  }

  public async createWebhookSubscription(data: Partial<Webhook>) {
    return await this.atomicPhase_(async (transactionManager) => {
      const webhookRepo = transactionManager.withRepository(
        this.webhookRepository_
      );

      const subscription = webhookRepo.create(data);

      await webhookRepo.save(subscription);

      return subscription;
    });
  }

  public async updateWebhookSubscription(id: string, data: any) {
    return await this.atomicPhase_(async (transactionManager) => {
      const webhookRepo = transactionManager.withRepository(
        this.webhookRepository_
      );

      const existingWebhook = await webhookRepo.findOne({ where: { id } });

      if (!existingWebhook) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Webhook subscription with id: ${id} was not found.`
        );
      }

      const updatedWebhook = webhookRepo.merge(existingWebhook, data);

      return await webhookRepo.save(updatedWebhook);
    });
  }

  public async deleteWebhookSubscription(id: string) {
    return await this.atomicPhase_(async (transactionManager) => {
      const webhookRepo = transactionManager.withRepository(
        this.webhookRepository_
      );

      const subscription = await webhookRepo.findOne({ where: { id } });

      if (!subscription) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Webhook subscription with id: ${id} was not found.`
        );
      }

      await webhookRepo.remove(subscription);

      return subscription;
    });
  }

  public async retrieveWebhooksOrderWithTotals(orderId: string) {
    const blacklistedRelations = [
      "claims",
      "swaps",
      "children",
      "returns",
      "payments",
      "refunds",
      "region",
    ];

    const order = await this.orderService_.retrieveWithTotals(orderId, {
      relations: defaultAdminOrdersRelations,
      select: defaultAdminOrdersFields,
    });

    const removedBlacklistedFields = Object.keys(order).reduce((acc, key) => {
      if (blacklistedRelations.includes(key)) {
        return acc;
      }

      return {
        ...acc,
        [key]: order[key],
      };
    }, {});

    return removedBlacklistedFields;
  }

  public async testWebhookSubscription(testData?: BaseWebhook) {
    const eventType = this.detectTypeOfEvent(testData?.event_type);

    if (!eventType) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Event type ${testData?.event_type} is not supported.`
      );
    }

    const finalTestData = (await eventType.returnFirstEntityObject(
      testData?.event_type
    )) ?? {
      test: true,
    };

    const response = await this.send(testData, finalTestData);

    return response;
  }

  public webhookResponse(
    {
      event_type,
      payload,
    }: {
      event_type: string;
      payload: any;
    },
    type: "product" | "order" | "customer" | "custom"
  ) {
    return {
      event_type,
      payload,
      [`${type}Id`]: payload.id,
    };
  }

  private allEventsForWebhookTests: () => {
    type: "orderService" | "productService" | "customerService" | "custom";
    eventNames: string[];
    returnFirstEntityObject: any;
  }[] = () => [
    {
      type: "orderService",
      eventNames: Object.values(OrderService.Events),
      returnFirstEntityObject: async (eventName) => {
        const order = await this.orderService_.list(
          {},
          {
            order: { created_at: "DESC" },
            take: 1,
          }
        );

        if (!order?.length) {
          return null;
        }

        const orderWithTotals = await this.retrieveWebhooksOrderWithTotals(
          order[0].id
        );

        return this.webhookResponse(
          {
            event_type: eventName,
            payload: orderWithTotals,
          },
          "order"
        );
      },
    },
    {
      type: "productService",
      eventNames: Object.values(ProductService.Events),
      returnFirstEntityObject: async () => {
        const product = await this.productService_.list({}, { take: 1 });

        return this.webhookResponse(
          {
            event_type: ProductService.Events.CREATED,
            payload: product?.length ? product[0] : null,
          },
          "product"
        );
      },
    },
    {
      type: "customerService",
      eventNames: Object.values(CustomerService.Events),
      returnFirstEntityObject: async () => {
        const customer = await this.customerService_.list({}, { take: 1 });

        return this.webhookResponse(
          {
            event_type: CustomerService.Events.CREATED,
            payload: customer?.length ? customer[0] : null,
          },
          "customer"
        );
      },
    },
    {
      type: "custom",
      eventNames: this.customSubscriptions,
      returnFirstEntityObject: async (eventName) => {
        return this.webhookResponse(
          {
            event_type: eventName,
            payload: {
              test: true,
              eventName,
              description: "This is a test payload for the webhook",
            },
          },
          "custom"
        );
      },
    },
  ];

  private detectTypeOfEvent = (event: string) => {
    const foundEvent = this.allEventsForWebhookTests().find((e) =>
      e.eventNames.includes(event)
    );

    if (!foundEvent) {
      return false;
    }

    return foundEvent;
  };
}

export default WebhookService;
