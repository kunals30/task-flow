import { PriorityBadge } from "./Badges";
import { STATUS_LABEL, type Task, type TaskStatus } from "../lib/types";

interface Props {
  tasks: Task[];
  busyId: number | null;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange: (t: Task, s: TaskStatus) => void;
}

const fmtDate = (d: string | null) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
const isOverdue = (t: Task) => t.dueDate && t.status !== "completed" && t.dueDate < new Date().toISOString().slice(0, 10);

const statusSelectCls: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700", in_progress: "bg-amber-50 text-amber-700", completed: "bg-emerald-50 text-emerald-700",
};

function StatusSelect({ task, disabled, onChange }: { task: Task; disabled: boolean; onChange: (s: TaskStatus) => void }) {
  return (
    <select aria-label={`Status of ${task.title}`} disabled={disabled} value={task.status}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-7 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-100 ${statusSelectCls[task.status]}`}>
      {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function Actions({ task, disabled, onEdit, onDelete }: { task: Task; disabled: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <button className="rounded px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50" disabled={disabled} onClick={onEdit} aria-label={`Edit ${task.title}`}>Edit</button>
      <button className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50" disabled={disabled} onClick={onDelete} aria-label={`Delete ${task.title}`}>Delete</button>
    </div>
  );
}

export function TaskTable({ tasks, busyId, onEdit, onDelete, onStatusChange }: Props) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <tr key={t.id} className={`hover:bg-slate-50 ${busyId === t.id ? "opacity-50" : ""}`}>
                <td className="max-w-md px-4 py-3">
                  <div className={`font-medium ${t.status === "completed" ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.title}</div>
                  {t.description && <div className="mt-0.5 truncate text-xs text-slate-500">{t.description}</div>}
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-4 py-3"><StatusSelect task={t} disabled={busyId === t.id} onChange={(s) => onStatusChange(t, s)} /></td>
                <td className={`whitespace-nowrap px-4 py-3 ${isOverdue(t) ? "font-medium text-red-600" : "text-slate-600"}`}>{fmtDate(t.dueDate)}</td>
                <td className="px-4 py-3"><Actions task={t} disabled={busyId === t.id} onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {tasks.map((t) => (
          <li key={t.id} className={`p-4 ${busyId === t.id ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div className={`font-medium ${t.status === "completed" ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.title}</div>
              <PriorityBadge priority={t.priority} />
            </div>
            {t.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.description}</p>}
            <div className="mt-3 flex items-center justify-between gap-2">
              <StatusSelect task={t} disabled={busyId === t.id} onChange={(s) => onStatusChange(t, s)} />
              <span className={`text-xs ${isOverdue(t) ? "font-medium text-red-600" : "text-slate-500"}`}>Due {fmtDate(t.dueDate)}</span>
            </div>
            <div className="mt-2"><Actions task={t} disabled={busyId === t.id} onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} /></div>
          </li>
        ))}
      </ul>
    </>
  );
}
