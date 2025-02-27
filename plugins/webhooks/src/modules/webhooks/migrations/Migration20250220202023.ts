import { Migration } from '@mikro-orm/migrations';

export class Migration20250220202023 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "webhook" ("id" text not null, "event_type" text not null, "active" boolean not null default true, "target_url" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "webhook_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_webhook_deleted_at" ON "webhook" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "webhook" cascade;`);
  }

}
