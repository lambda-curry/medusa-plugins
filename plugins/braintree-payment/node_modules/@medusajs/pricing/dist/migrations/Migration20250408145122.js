"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250408145122 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250408145122 extends migrations_1.Migration {
    async up() {
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_list_rule_attribute" ON "price_list_rule" (attribute) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_rule_attribute_value" ON "price_rule" (attribute, value) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_rule_operator_value" ON "price_rule" (operator, value) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop index if exists "IDX_price_list_rule_attribute";`);
        this.addSql(`drop index if exists "IDX_price_rule_attribute_value";`);
        this.addSql(`drop index if exists "IDX_price_rule_operator_value";`);
    }
}
exports.Migration20250408145122 = Migration20250408145122;
//# sourceMappingURL=Migration20250408145122.js.map