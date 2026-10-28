import express from "express";
import fs from "node:fs";
import path from "node:path";
import type { DB } from "./db/database.js";
import { createTaskRepository } from "./db/taskRepository.js";
import { tasksRouter } from "./routes/tasks.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp(db: DB, opts: { staticDir?: string } = {}) {
  const app = express();
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => {
    db.prepare("SELECT 1").get();
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  app.use("/api/tasks", tasksRouter(createTaskRepository(db)));
  app.use("/api", notFound);

  // Production: serve the built React app from the same origin.
  if (opts.staticDir && fs.existsSync(opts.staticDir)) {
    app.use(express.static(opts.staticDir));
    app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(opts.staticDir!, "index.html")));
  }

  app.use(errorHandler);
  return app;
}
