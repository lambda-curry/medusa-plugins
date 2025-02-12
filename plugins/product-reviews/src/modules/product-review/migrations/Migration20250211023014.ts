import { Migration } from '@mikro-orm/migrations';

export class Migration20250211023014 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_review" add column if not exists "status" text check ("status" in ('pending', 'approved', 'flagged')) not null default 'pending';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_review" drop column if exists "status";`);
  }

}
