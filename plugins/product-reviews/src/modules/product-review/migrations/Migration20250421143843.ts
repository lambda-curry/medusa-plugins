import { Migration } from '@mikro-orm/migrations';

export class Migration20250421143843 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_order_line_item_id" ON "product_review" (order_line_item_id) WHERE deleted_at IS NULL;`);

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_stats_product_id" ON "product_review_stats" (product_id) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_product_review_order_line_item_id";`);

    this.addSql(`drop index if exists "IDX_product_review_stats_product_id";`);
  }

}
