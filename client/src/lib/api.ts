import type { Task, TaskFilters, TaskInput } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string>) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the API running?");
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`, body.details);
  return body as T;
}

export const api = {
  list(filters: Partial<TaskFilters> = {}) {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
    return request<Task[]>(`/api/tasks${qs.size ? `?${qs}` : ""}`);
  },
  create: (input: TaskInput) => request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: TaskInput) => request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
