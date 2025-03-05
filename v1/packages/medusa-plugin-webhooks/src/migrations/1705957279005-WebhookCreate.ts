import { MigrationInterface, QueryRunner } from "typeorm"

export class WebhookCreate1705957279005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a the webhook table
    await queryRunner.query(`
            CREATE TABLE "webhook" (
                "id" varchar PRIMARY KEY NOT NULL,
                "target_url" varchar NOT NULL,
                "event_type" varchar NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE )`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the webhook table
    await queryRunner.query(`DROP TABLE "webhook"`)
  }
}
