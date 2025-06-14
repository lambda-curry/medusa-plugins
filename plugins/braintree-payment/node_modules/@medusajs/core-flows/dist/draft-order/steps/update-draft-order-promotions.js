"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDraftOrderPromotionsStep = exports.updateDraftOrderPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateDraftOrderPromotionsStepId = "update-draft-order-promotions";
/**
 * This step updates the promotions of a draft order.
 *
 * @example
 * const data = updateDraftOrderPromotionsStep({
 *   id: "order_123",
 *   promo_codes: ["PROMO_123", "PROMO_456"],
 *   // Import from "@medusajs/framework/utils"
 *   action: PromotionActions.ADD,
 * })
 */
exports.updateDraftOrderPromotionsStep = (0, workflows_sdk_1.createStep)(exports.updateDraftOrderPromotionsStepId, async function (data, { container }) {
    const { id, promo_codes = [], action = utils_1.PromotionActions.ADD } = data;
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const remoteQuery = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const promotionService = container.resolve(utils_1.Modules.PROMOTION);
    const existingDraftOrderPromotionLinks = await remoteQuery({
        entryPoint: "order_promotion",
        fields: ["order_id", "promotion_id"],
        variables: { order_id: [id] },
    });
    const promotionLinkMap = new Map(existingDraftOrderPromotionLinks.map((link) => [link.promotion_id, link]));
    const linksToCreate = [];
    const linksToDismiss = [];
    if (promo_codes?.length) {
        const promotions = await promotionService.listPromotions({ code: promo_codes }, { select: ["id"] });
        for (const promotion of promotions) {
            const linkObject = {
                [utils_1.Modules.ORDER]: { order_id: id },
                [utils_1.Modules.PROMOTION]: { promotion_id: promotion.id },
            };
            if ([utils_1.PromotionActions.ADD, utils_1.PromotionActions.REPLACE].includes(action)) {
                linksToCreate.push(linkObject);
            }
            if (action === utils_1.PromotionActions.REMOVE) {
                const link = promotionLinkMap.get(promotion.id);
                if (link) {
                    linksToDismiss.push(linkObject);
                }
            }
        }
    }
    if (action === utils_1.PromotionActions.REPLACE) {
        for (const link of existingDraftOrderPromotionLinks) {
            linksToDismiss.push({
                [utils_1.Modules.ORDER]: { order_id: link.order_id },
                [utils_1.Modules.PROMOTION]: { promotion_id: link.promotion_id },
            });
        }
    }
    if (linksToDismiss.length) {
        await remoteLink.dismiss(linksToDismiss);
    }
    const createdLinks = linksToCreate.length
        ? await remoteLink.create(linksToCreate)
        : [];
    return new workflows_sdk_1.StepResponse(null, {
        // @ts-expect-error
        createdLinkIds: createdLinks.map((link) => link.id),
        dismissedLinks: linksToDismiss,
    });
}, async function (revertData, { container }) {
    const { dismissedLinks, createdLinkIds } = revertData ?? {};
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    if (dismissedLinks?.length) {
        await remoteLink.create(dismissedLinks);
    }
    if (createdLinkIds?.length) {
        // @ts-expect-error
        await remoteLink.delete(createdLinkIds);
    }
});
//# sourceMappingURL=update-draft-order-promotions.js.map