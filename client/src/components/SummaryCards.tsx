import type { Task } from "../lib/types";

export function SummaryCards({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  const count = (s?: Task["status"]) => (s ? tasks.filter((t) => t.status === s).length : tasks.length);
  const cards = [
    { label: "Total tasks", value: count(), accent: "bg-brand-600" },
    { label: "Pending", value: count("todo"), accent: "bg-slate-400" },
    { label: "In progress", value: count("in_progress"), accent: "bg-amber-500" },
    { label: "Completed", value: count("completed"), accent: "bg-emerald-500" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span className={`h-2 w-2 rounded-full ${c.accent}`} />{c.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-100" /> : c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
