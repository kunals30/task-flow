import { HttpError } from "./errors.js";
import { PRIORITIES, STATUSES, type TaskFilters, type TaskInput } from "./types.js";

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function isValidDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

/** Validates a full task payload (used for create and update). Throws HttpError(400). */
export function validateTaskInput(body: unknown): TaskInput {
  const errors: Record<string, string> = {};
  if (!isObj(body)) throw new HttpError(400, "Request body must be a JSON object");

  const { title, description = "", priority = "medium", status = "todo", dueDate = null } = body;

  if (typeof title !== "string" || title.trim().length === 0) errors.title = "Title is required";
  else if (title.trim().length > 200) errors.title = "Title must be 200 characters or fewer";

  if (typeof description !== "string") errors.description = "Description must be text";
  else if (description.length > 2000) errors.description = "Description must be 2000 characters or fewer";

  if (!PRIORITIES.includes(priority as never)) errors.priority = `Priority must be one of: ${PRIORITIES.join(", ")}`;
  if (!STATUSES.includes(status as never)) errors.status = `Status must be one of: ${STATUSES.join(", ")}`;

  if (dueDate !== null && dueDate !== "" && (typeof dueDate !== "string" || !isValidDate(dueDate)))
    errors.dueDate = "Due date must be a valid date (YYYY-MM-DD)";

  if (Object.keys(errors).length) throw new HttpError(400, "Validation failed", errors);

  return {
    title: (title as string).trim(),
    description: (description as string).trim(),
    priority: priority as TaskInput["priority"],
    status: status as TaskInput["status"],
    dueDate: dueDate ? (dueDate as string) : null,
  };
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Task id must be a positive integer");
  return id;
}

export function parseFilters(q: Record<string, unknown>): TaskFilters {
  const filters: TaskFilters = {};
  if (typeof q.search === "string" && q.search.trim()) filters.search = q.search.trim();
  if (q.status !== undefined && q.status !== "") {
    if (!STATUSES.includes(q.status as never)) throw new HttpError(400, `Invalid status filter`);
    filters.status = q.status as TaskFilters["status"];
  }
  if (q.priority !== undefined && q.priority !== "") {
    if (!PRIORITIES.includes(q.priority as never)) throw new HttpError(400, `Invalid priority filter`);
    filters.priority = q.priority as TaskFilters["priority"];
  }
  return filters;
}
