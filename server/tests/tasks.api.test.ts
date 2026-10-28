import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createApp } from "../src/app.js";
import { createDatabase, type DB } from "../src/db/database.js";

let db: DB;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  db = createDatabase(":memory:");
  app = createApp(db);
});

const create = (body: object) => request(app).post("/api/tasks").send(body);

describe("Tasks API", () => {
  it("GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("creates and retrieves a task", async () => {
    const res = await create({ title: "First", priority: "high", dueDate: "2026-11-01" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: "First", priority: "high", status: "todo", dueDate: "2026-11-01" });
    const got = await request(app).get(`/api/tasks/${res.body.id}`);
    expect(got.status).toBe(200);
    expect(got.body.title).toBe("First");
  });

  it("returns 400 with field details for invalid payloads", async () => {
    const res = await create({ title: "", status: "bogus" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.details)).toEqual(expect.arrayContaining(["title", "status"]));
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app).post("/api/tasks").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
  });

  it("updates a task", async () => {
    const { body } = await create({ title: "Draft" });
    const res = await request(app).put(`/api/tasks/${body.id}`).send({ ...body, title: "Final", status: "completed" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: "Final", status: "completed" });
  });

  it("deletes a task", async () => {
    const { body } = await create({ title: "Temp" });
    expect((await request(app).delete(`/api/tasks/${body.id}`)).status).toBe(204);
    expect((await request(app).get(`/api/tasks/${body.id}`)).status).toBe(404);
  });

  it("returns 404 for nonexistent ids and 400 for invalid ids", async () => {
    expect((await request(app).get("/api/tasks/999")).status).toBe(404);
    expect((await request(app).put("/api/tasks/999").send({ title: "x" })).status).toBe(404);
    expect((await request(app).delete("/api/tasks/999")).status).toBe(404);
    expect((await request(app).get("/api/tasks/abc")).status).toBe(400);
  });

  it("searches and filters", async () => {
    await create({ title: "Buy milk", priority: "low" });
    await create({ title: "Fix login bug", priority: "high", status: "in_progress" });
    await create({ title: "Fix 100% CPU", priority: "high", status: "completed" });

    const search = await request(app).get("/api/tasks?search=fix");
    expect(search.body).toHaveLength(2);
    const pct = await request(app).get("/api/tasks?search=100%25");
    expect(pct.body).toHaveLength(1);
    const status = await request(app).get("/api/tasks?status=in_progress");
    expect(status.body.map((t: { title: string }) => t.title)).toEqual(["Fix login bug"]);
    const combo = await request(app).get("/api/tasks?priority=high&status=completed");
    expect(combo.body).toHaveLength(1);
    expect((await request(app).get("/api/tasks?status=nope")).status).toBe(400);
  });

  it("persists tasks across database restarts", async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "taskflow-")), "test.db");
    const db1 = createDatabase(file);
    await request(createApp(db1)).post("/api/tasks").send({ title: "Persist me" });
    db1.close();
    const db2 = createDatabase(file);
    const res = await request(createApp(db2)).get("/api/tasks");
    expect(res.body[0].title).toBe("Persist me");
    db2.close();
  });

  it("returns 404 JSON for unknown API routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
