"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PricingRepository_instances, _PricingRepository_availableAttributes, _PricingRepository_cacheAvailableAttributes, _PricingRepository_cacheAvailableAttributesIfNecessary;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingRepository = void 0;
const utils_1 = require("@medusajs/framework/utils");
class PricingRepository extends utils_1.MikroOrmBase {
    constructor() {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        super(...arguments);
        _PricingRepository_instances.add(this);
        _PricingRepository_availableAttributes.set(this, new Set());
    }
    clearAvailableAttributes() {
        __classPrivateFieldGet(this, _PricingRepository_availableAttributes, "f").clear();
    }
    async calculatePrices(pricingFilters, pricingContext = { context: {} }, sharedContext = {}) {
        const manager = this.getActiveManager(sharedContext);
        const knex = manager.getKnex();
        const context = pricingContext.context || {};
        // Extract quantity and currency from context
        const quantity = context.quantity;
        delete context.quantity;
        // Currency code is required
        const currencyCode = context.currency_code;
        delete context.currency_code;
        if (!currencyCode) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Method calculatePrices requires currency_code in the pricing context`);
        }
        // Generate flatten key-value pairs for rule matching
        const flattenedKeyValuePairs = (0, utils_1.flattenObjectToKeyValuePairs)(context);
        // First filter by value presence
        let flattenedContext = Object.entries(flattenedKeyValuePairs).filter(([, value]) => {
            const isValuePresent = !Array.isArray(value) && (0, utils_1.isPresent)(value);
            const isArrayPresent = Array.isArray(value) && value.flat(1).length;
            return isValuePresent || isArrayPresent;
        });
        if (flattenedContext.length > 10) {
            await __classPrivateFieldGet(this, _PricingRepository_instances, "m", _PricingRepository_cacheAvailableAttributesIfNecessary).call(this);
            flattenedContext = flattenedContext.filter(([key]) => __classPrivateFieldGet(this, _PricingRepository_availableAttributes, "f").has(key));
        }
        const hasComplexContext = flattenedContext.length > 0;
        const query = knex
            .select({
            id: "price.id",
            price_set_id: "price.price_set_id",
            amount: "price.amount",
            raw_amount: "price.raw_amount",
            min_quantity: "price.min_quantity",
            max_quantity: "price.max_quantity",
            currency_code: "price.currency_code",
            price_list_id: "price.price_list_id",
            price_list_type: "pl.type",
            rules_count: "price.rules_count",
            price_list_rules_count: "pl.rules_count",
        })
            .from("price")
            .whereIn("price.price_set_id", pricingFilters.id)
            .andWhere("price.currency_code", currencyCode)
            .whereNull("price.deleted_at");
        if (quantity !== undefined) {
            query.andWhere(function () {
                this.where(function () {
                    this.where("price.min_quantity", "<=", quantity).andWhere("price.max_quantity", ">=", quantity);
                }).orWhere(function () {
                    this.whereNull("price.min_quantity").whereNull("price.max_quantity");
                });
            });
        }
        else {
            query.andWhere(function () {
                this.where("price.min_quantity", "<=", 1).orWhereNull("price.min_quantity");
            });
        }
        query.leftJoin("price_list as pl", function () {
            this.on("pl.id", "=", "price.price_list_id")
                .andOn("pl.status", "=", knex.raw("?", [utils_1.PriceListStatus.ACTIVE]))
                .andOn(function () {
                this.onNull("pl.deleted_at");
            })
                .andOn(function () {
                this.onNull("pl.starts_at").orOn("pl.starts_at", "<=", knex.fn.now());
            })
                .andOn(function () {
                this.onNull("pl.ends_at").orOn("pl.ends_at", ">=", knex.fn.now());
            });
        });
        if (hasComplexContext) {
            const priceRuleConditions = knex.raw(`
        (
          price.rules_count = 0 OR
          (
            /* Count all matching rules and compare to total rule count */
            SELECT COUNT(*) 
            FROM price_rule pr
            WHERE pr.price_id = price.id 
            AND pr.deleted_at IS NULL
            AND (
              ${flattenedContext
                .map(([key, value]) => {
                if (typeof value === "number") {
                    return `
                    (pr.attribute = ? AND (
                      (pr.operator = 'eq' AND pr.value = ?) OR
                      (pr.operator = 'gt' AND ? > pr.value::numeric) OR
                      (pr.operator = 'gte' AND ? >= pr.value::numeric) OR
                      (pr.operator = 'lt' AND ? < pr.value::numeric) OR
                      (pr.operator = 'lte' AND ? <= pr.value::numeric)
                    ))
                    `;
                }
                else {
                    const normalizeValue = Array.isArray(value)
                        ? value
                        : [value];
                    const placeholders = normalizeValue.map(() => "?").join(",");
                    return `(pr.attribute = ? AND pr.value IN (${placeholders}))`;
                }
            })
                .join(" OR ")}
            )
          ) = (
            /* Get total rule count */
            SELECT COUNT(*) 
            FROM price_rule pr
            WHERE pr.price_id = price.id 
            AND pr.deleted_at IS NULL
          )
        )
        `, flattenedContext.flatMap(([key, value]) => {
                if (typeof value === "number") {
                    return [key, value.toString(), value, value, value, value];
                }
                else {
                    const normalizeValue = Array.isArray(value) ? value : [value];
                    return [key, ...normalizeValue];
                }
            }));
            const priceListRuleConditions = knex.raw(`
        (
          pl.rules_count = 0 OR
          (
            /* Count all matching rules and compare to total rule count */
            SELECT COUNT(*) 
            FROM price_list_rule plr
            WHERE plr.price_list_id = pl.id
              AND plr.deleted_at IS NULL
              AND (
                ${flattenedContext
                .map(([key, value]) => {
                return `(plr.attribute = ? AND plr.value @> ?)`;
            })
                .join(" OR ")}
              )
          ) = (
            /* Get total rule count */
            SELECT COUNT(*) 
            FROM price_list_rule plr
            WHERE plr.price_list_id = pl.id
              AND plr.deleted_at IS NULL
          )
        )
        `, flattenedContext.flatMap(([key, value]) => {
                return [key, JSON.stringify(Array.isArray(value) ? value : [value])];
            }));
            query.where((qb) => {
                qb.whereNull("price.price_list_id")
                    .andWhereRaw(priceRuleConditions)
                    .orWhere((qb2) => {
                    qb2
                        .whereNotNull("price.price_list_id")
                        .whereRaw(priceListRuleConditions)
                        .andWhereRaw(priceRuleConditions);
                });
            });
        }
        else {
            query.where(function () {
                this.where("price.rules_count", 0).orWhere(function () {
                    this.whereNotNull("price.price_list_id").where("pl.rules_count", 0);
                });
            });
        }
        query
            .orderByRaw("price.price_list_id IS NOT NULL DESC")
            .orderByRaw("price.rules_count + COALESCE(pl.rules_count, 0) DESC")
            .orderBy("pl.id", "asc")
            .orderBy("price.amount", "asc");
        return await query;
    }
}
exports.PricingRepository = PricingRepository;
_PricingRepository_availableAttributes = new WeakMap(), _PricingRepository_instances = new WeakSet(), _PricingRepository_cacheAvailableAttributes = async function _PricingRepository_cacheAvailableAttributes() {
    const manager = this.getActiveManager();
    const knex = manager.getKnex();
    const { rows } = await knex.raw(`
      SELECT DISTINCT attribute 
      FROM (
        SELECT attribute 
        FROM price_rule 
        UNION ALL
        SELECT attribute 
        FROM price_list_rule
      ) as combined_rules_attributes
    `);
    __classPrivateFieldGet(this, _PricingRepository_availableAttributes, "f").clear();
    rows.forEach(({ attribute }) => {
        __classPrivateFieldGet(this, _PricingRepository_availableAttributes, "f").add(attribute);
    });
}, _PricingRepository_cacheAvailableAttributesIfNecessary = async function _PricingRepository_cacheAvailableAttributesIfNecessary() {
    if (__classPrivateFieldGet(this, _PricingRepository_availableAttributes, "f").size === 0) {
        await __classPrivateFieldGet(this, _PricingRepository_instances, "m", _PricingRepository_cacheAvailableAttributes).call(this);
    }
};
//# sourceMappingURL=pricing.js.map