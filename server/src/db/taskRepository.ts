import type { DB } from "./database.js";
import type { Task, TaskFilters, TaskInput } from "../types.js";

interface Row {
  id: number; title: string; description: string; priority: Task["priority"]; status: Task["status"];
  due_date: string | null; created_at: string; updated_at: string;
}

const toTask = (r: Row): Task => ({
  id: r.id, title: r.title, description: r.description, priority: r.priority, status: r.status,
  dueDate: r.due_date, createdAt: r.created_at, updatedAt: r.updated_at,
});

export function createTaskRepository(db: DB) {
  return {
    list(filters: TaskFilters = {}): Task[] {
      const where: string[] = [];
      const params: Record<string, string> = {};
      if (filters.search) { where.push("title LIKE @search ESCAPE '\\'"); params.search = `%${filters.search.replace(/[\\%_]/g, "\\$&")}%`; }
      if (filters.status) { where.push("status = @status"); params.status = filters.status; }
      if (filters.priority) { where.push("priority = @priority"); params.priority = filters.priority; }
      const sql = `SELECT * FROM tasks ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC, id DESC`;
      return (db.prepare(sql).all(params) as Row[]).map(toTask);
    },
    get(id: number): Task | undefined {
      const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Row | undefined;
      return row && toTask(row);
    },
    create(input: TaskInput): Task {
      const info = db
        .prepare("INSERT INTO tasks (title, description, priority, status, due_date) VALUES (@title, @description, @priority, @status, @dueDate)")
        .run(input);
      return this.get(Number(info.lastInsertRowid))!;
    },
    update(id: number, input: TaskInput): Task | undefined {
      const info = db
        .prepare(`UPDATE tasks SET title=@title, description=@description, priority=@priority, status=@status,
                  due_date=@dueDate, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=@id`)
        .run({ ...input, id });
      return info.changes ? this.get(id) : undefined;
    },
    delete(id: number): boolean {
      return db.prepare("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
    },
  };
}
export type TaskRepository = ReturnType<typeof createTaskRepository>;
