import { MedusaError } from "@medusajs/framework/utils";
import { transform } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import type { OrderLineItemDTO, OrderWorkflowDTO } from "@medusajs/types";
import {
  type WorkflowData,
  WorkflowResponse,
  createWorkflow,
  when,
} from "@medusajs/workflows-sdk";
import type { ProductReview } from "../modules/product-review/types/common";
import { createProductReviewsWorkflow } from "./create-product-reviews";
import { updateProductReviewsWorkflow } from "./update-product-reviews";

export type UpsertProductReviewsWorkflowInput = {
  reviews: {
    order_id: string;
    order_line_item_id: string;
    rating: number;
    content: string;
    images: { url: string }[];
  }[];
};

export const upsertProductReviewsWorkflow = createWorkflow(
  "upsert-product-reviews-workflow",
  (input: WorkflowData<UpsertProductReviewsWorkflowInput>) => {
    const orderIds = transform({ input }, ({ input }) => {
      return [...new Set(input.reviews.map((review) => review.order_id))];
    });

    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["*", "shipping_address.*", "customer.*", "items.*"],
      filters: {
        id: orderIds,
      },
    }) as { data: OrderWorkflowDTO[] };

    const inputs = transform({ orders, reviews: input.reviews }, (values) => {
      const ordersMap = new Map(
        values.orders.map((order) => [order.id, order])
      );

      const matchedReviews = values.reviews.map((review) => {
        const { items, ...order } =
          ordersMap.get(review.order_id) || ({} as OrderWorkflowDTO);

        const lineItem = items?.find(
          (item) => item?.id === review.order_line_item_id
        );

        if (!lineItem) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Order line item ${review.order_line_item_id} not found in order ${review.order_id}`
          );
        }

        return {
          review,
          lineItem: lineItem as OrderLineItemDTO & {
            product_review: ProductReview;
          },
          order,
        };
      });

      const getNameFromOrder = (order: Omit<OrderWorkflowDTO, "items">) => {
        return order.customer?.first_name
          ? `${order.customer.first_name} ${order.customer.last_name}`
          : order.shipping_address?.first_name
            ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
            : undefined;
      };

      const create = matchedReviews
        .filter((review) => !review.lineItem.product_review)
        .map(({ review, lineItem, order }) => {
          return {
            email: order.email,
            name: getNameFromOrder(order),
            product_id: lineItem.product_id,
            order_id: review.order_id,
            order_line_item_id: review.order_line_item_id,
            rating: review.rating,
            content: review.content,
            images: review.images,
          };
        });

      const update = matchedReviews
        .filter((review) => review.lineItem.product_review?.id)
        .map(({ review, lineItem }) => {
          return {
            id: lineItem.product_review.id,
            rating: review.rating,
            content: review.content,
            images: review.images,
          };
        });

      return { create, update };
    });

    const createResult = when(inputs, ({ create }) => create.length > 0).then(
      () =>
        createProductReviewsWorkflow.runAsStep({
          input: { productReviews: inputs.create },
        })
    );

    const updateResult = when(inputs, ({ update }) => update.length > 0).then(
      () =>
        updateProductReviewsWorkflow.runAsStep({
          input: { productReviews: inputs.update },
        })
    );

    const results = transform(
      { createResult, updateResult },
      ({ createResult, updateResult }) => ({
        creates: createResult || [],
        updates: updateResult || [],
      })
    );

    return new WorkflowResponse(
      results as WorkflowData<{
        creates: ProductReview[];
        updates: ProductReview[];
      }>
    );
  }
);
