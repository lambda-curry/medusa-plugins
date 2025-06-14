"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250409122219 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250409122219 extends migrations_1.Migration {
    async up() {
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_rule_attribute" ON "price_rule" (attribute) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop index if exists "IDX_price_rule_attribute";`);
    }
}
exports.Migration20250409122219 = Migration20250409122219;
//# sourceMappingURL=Migration20250409122219.js.map