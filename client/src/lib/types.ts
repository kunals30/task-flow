export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

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
export interface TaskFilters { search: string; status: "" | TaskStatus; priority: "" | TaskPriority }

export const STATUS_LABEL: Record<TaskStatus, string> = { todo: "Todo", in_progress: "In Progress", completed: "Completed" };
export const PRIORITY_LABEL: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };
