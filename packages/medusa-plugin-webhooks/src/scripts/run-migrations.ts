import { runMigrations } from "../migrations/run-migration";

console.log("Running migrations");
console.log("Running migrations");
console.log("Running migrations");
console.log("Running migrations");
console.log("Running migrations");

async function run() {
  try {
    await runMigrations({
      options: {
        database: {
          type: process.env.TYPEORM_CONNECTION,
          url: process.env.DATABASE_URL,
          database: process.env.TYPEORM_DATABASE,
        },
      },
    });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

run();
