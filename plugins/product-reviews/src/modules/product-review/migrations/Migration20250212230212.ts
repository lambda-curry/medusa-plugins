import { Migration } from '@mikro-orm/migrations';

export class Migration20250212230212 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_review_response" drop constraint if exists "product_review_response_product_review_id_unique";`);
    this.addSql(`create table if not exists "product_review" ("id" text not null, "name" text null, "email" text null, "rating" integer not null, "content" text null, "order_line_item_id" text null, "product_id" text null, "order_id" text null, "status" text check ("status" in ('pending', 'approved', 'flagged')) not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_deleted_at" ON "product_review" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_product_id" ON "product_review" (product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_order_id" ON "product_review" (order_id) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_review_image" ("id" text not null, "url" text not null, "product_review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_image_product_review_id" ON "product_review_image" (product_review_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_image_deleted_at" ON "product_review_image" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_review_response" ("id" text not null, "content" text not null, "product_review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_response_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_review_response_product_review_id_unique" ON "product_review_response" (product_review_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_response_deleted_at" ON "product_review_response" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_review_stats" ("id" text not null, "product_id" text not null, "average_rating" integer null, "review_count" integer not null default 0, "rating_count_1" integer not null default 0, "rating_count_2" integer not null default 0, "rating_count_3" integer not null default 0, "rating_count_4" integer not null default 0, "rating_count_5" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_stats_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_stats_deleted_at" ON "product_review_stats" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "product_review_image" add constraint "product_review_image_product_review_id_foreign" foreign key ("product_review_id") references "product_review" ("id") on update cascade;`);

    this.addSql(`alter table if exists "product_review_response" add constraint "product_review_response_product_review_id_foreign" foreign key ("product_review_id") references "product_review" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_review_image" drop constraint if exists "product_review_image_product_review_id_foreign";`);

    this.addSql(`alter table if exists "product_review_response" drop constraint if exists "product_review_response_product_review_id_foreign";`);

    this.addSql(`drop table if exists "product_review" cascade;`);

    this.addSql(`drop table if exists "product_review_image" cascade;`);

    this.addSql(`drop table if exists "product_review_response" cascade;`);

    this.addSql(`drop table if exists "product_review_stats" cascade;`);
  }

}
