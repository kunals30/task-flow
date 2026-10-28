export const STATUSES = ["todo", "in_progress", "completed"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;
export type TaskStatus = (typeof STATUSES)[number];
export type TaskPriority = (typeof PRIORITIES)[number];

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Pick<Task, "title" | "description" | "priority" | "status" | "dueDate">;

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
