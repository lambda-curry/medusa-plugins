"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250326151554 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250326151554 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "order_line_item" add column if not exists "is_giftcard" boolean not null default false;`);
    }
    async down() {
        this.addSql(`alter table if exists "order_line_item" drop column if exists "is_giftcard";`);
    }
}
exports.Migration20250326151554 = Migration20250326151554;
//# sourceMappingURL=Migration20250326151554.js.map