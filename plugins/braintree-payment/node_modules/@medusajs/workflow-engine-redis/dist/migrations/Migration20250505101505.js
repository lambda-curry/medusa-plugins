"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250505101505 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
const ulid_1 = require("ulid");
class Migration20250505101505 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "workflow_execution" drop constraint if exists "workflow_execution_workflow_id_transaction_id_run_id_unique";`);
        this.addSql(`drop index if exists "IDX_workflow_execution_workflow_id_transaction_id_unique";`);
        this.addSql(`alter table if exists "workflow_execution" drop constraint if exists "PK_workflow_execution_workflow_id_transaction_id";`);
        this.addSql(`alter table if exists "workflow_execution" add column if not exists "run_id" text not null default '${(0, ulid_1.ulid)()}';`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique" ON "workflow_execution" (workflow_id, transaction_id, run_id) WHERE deleted_at IS NULL;`);
        this.addSql(`alter table if exists "workflow_execution" add constraint "workflow_execution_pkey" primary key ("workflow_id", "transaction_id", "run_id");`);
    }
    async down() {
        this.addSql(`drop index if exists "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique";`);
        this.addSql(`alter table if exists "workflow_execution" drop constraint if exists "workflow_execution_pkey";`);
        this.addSql(`alter table if exists "workflow_execution" drop column if exists "run_id";`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_workflow_execution_workflow_id_transaction_id_unique" ON "workflow_execution" (workflow_id, transaction_id) WHERE deleted_at IS NULL;`);
        this.addSql(`alter table if exists "workflow_execution" add constraint "workflow_execution_pkey" primary key ("workflow_id", "transaction_id");`);
    }
}
exports.Migration20250505101505 = Migration20250505101505;
//# sourceMappingURL=Migration20250505101505.js.map