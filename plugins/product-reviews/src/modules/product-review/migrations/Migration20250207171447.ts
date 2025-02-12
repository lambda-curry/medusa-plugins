import { Migration } from '@mikro-orm/migrations';

export class Migration20250207171447 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "product_review" 
      DROP COLUMN "order_item_id",
      ADD COLUMN "order_line_item_id" text NULL;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE "product_review" 
      DROP COLUMN "order_line_item_id",
      ADD COLUMN "order_item_id" text NULL;
    `);
  }
}
