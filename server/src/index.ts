import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { createDatabase } from "./db/database.js";
import { createApp } from "./app.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const db = createDatabase(config.databasePath);
const app = createApp(db, { staticDir: config.isProduction ? path.resolve(here, "../client") : undefined });

const server = app.listen(config.port, () => {
  console.log(`TaskFlow API listening on http://localhost:${config.port} (db: ${config.databasePath})`);
});

const shutdown = () => server.close(() => { db.close(); process.exit(0); });
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
