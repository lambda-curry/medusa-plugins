import { Modules } from "@medusajs/framework/utils";
import { transform } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import {
	type WorkflowData,
	WorkflowResponse,
	createWorkflow,
} from "@medusajs/workflows-sdk";
import { createMissingProductReviewStatsStep } from "./steps/create-missing-product-review-stats";
import { recalculateProductReviewStatsStep } from "./steps/recalculate-product-review-stats";
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review";

export const refreshProductReviewStatsWorkflow = createWorkflow(
	"refresh-product-review-stats-workflow",
	(input: WorkflowData<{ productIds: string[] }>) => {
		const newStats = createMissingProductReviewStatsStep(input.productIds);

		const linkData = transform({ newStats }, ({ newStats }) => {
			const productLinks = newStats
				.filter((stat) => stat.product_id)
				.map((stat) => {
					return {
						[PRODUCT_REVIEW_MODULE]: {
							product_review_stats_id: stat.id,
						},
						[Modules.PRODUCT]: {
							product_id: stat.product_id,
						},
					};
				});

			return productLinks;
		});

		createRemoteLinkStep(linkData);

		recalculateProductReviewStatsStep(input.productIds);

		return new WorkflowResponse({});
	},
);
