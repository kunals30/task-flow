import { PRIORITY_LABEL, STATUS_LABEL, type TaskPriority, type TaskStatus } from "../lib/types";

const statusCls: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
const priorityCls: Record<TaskPriority, string> = {
  low: "bg-sky-50 text-sky-700 ring-sky-200",
  medium: "bg-violet-50 text-violet-700 ring-violet-200",
  high: "bg-rose-50 text-rose-700 ring-rose-200",
};
const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

export const StatusBadge = ({ status }: { status: TaskStatus }) => <span className={`${base} ${statusCls[status]}`}>{STATUS_LABEL[status]}</span>;
export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => <span className={`${base} ${priorityCls[priority]}`}>{PRIORITY_LABEL[priority]}</span>;
