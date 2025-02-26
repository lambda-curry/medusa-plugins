import { MedusaError, MedusaService } from "@medusajs/framework/utils";
import { Webhook } from "./models/webhooks";
import { LoaderOptions, Logger } from "@medusajs/framework/types";
import { WebhookModel } from "../../common";

export type WebhookSendResponse = {
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

type ConstructorParams = {
  logger: Logger;
};

class WebhooksService extends MedusaService({
  Webhook,
}) {
  public subscriptions: string[] = [];
  private logger: Logger;

  constructor(
    container: ConstructorParams,
    options: LoaderOptions & { subscriptions: string[] }
  ) {
    super(container, options);
    this.subscriptions = options.subscriptions;
    this.logger = container.logger;
  }

  public async send(
    subscription: WebhookModel,
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

  public async sendWebhooksEvents(webhooks: WebhookModel[], payload: any) {
    console.log("webhooks", webhooks);
    const results = (await Promise.allSettled(
      webhooks?.map((webhook) => this.send(webhook, payload))
    )) as PromiseFulfilledResult<WebhookSendResponse>[];

    results.forEach((result) => {
      const resultMessage =
        result.value?.result === "error" ? "failed" : "succeeded";

      this.logger.info(
        `Webhook ${result.value?.event_type} -> ${result.value?.target_url} ${resultMessage}.`
      );
    });

    return results;
  }

  public async testWebhookSubscription(testData?: WebhookModel) {
    if (!testData) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Test data is required."
      );
    }

    const eventType = this.detectTypeOfEvent(testData.event_type);

    if (!eventType) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Event type ${testData?.event_type} is not supported.`
      );
    }

    const response = await this.send(testData, {
      test: true,
    });

    return response;
  }

  private detectTypeOfEvent = (event: string) => {
    const foundEvent = this.subscriptions.find((e) => e === event);

    if (!foundEvent) {
      return false;
    }

    return foundEvent;
  };

  private onSendError(
    err: WebhookSendResponseError,
    subscription: WebhookModel,
    payload: any
  ): WebhookSendResponse {
    this.logger.error(
      "Error sending webhook",
      new Error(
        `Error sending webhook: ${subscription.event_type} -> ${
          subscription.target_url
        }, payload: ${JSON.stringify(payload)}, error: ${err.message}`
      )
    );

    return {
      event_type: subscription.event_type,
      target_url: subscription.target_url,
      result: "error",
      message: err?.message ?? err?.cause?.code ?? "Unknown error",
      err: err?.cause ?? err,
    };
  }
}

export default WebhooksService;
