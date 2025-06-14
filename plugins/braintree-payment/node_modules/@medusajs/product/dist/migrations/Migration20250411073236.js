"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250411073236 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250411073236 extends migrations_1.Migration {
    async up() {
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_image_product_id" ON "image" (product_id) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop index if exists "IDX_image_product_id";`);
    }
}
exports.Migration20250411073236 = Migration20250411073236;
//# sourceMappingURL=Migration20250411073236.js.map