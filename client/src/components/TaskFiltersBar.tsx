import { PRIORITY_LABEL, STATUS_LABEL, type TaskFilters } from "../lib/types";

interface Props { filters: TaskFilters; onChange: (f: TaskFilters) => void }

export function TaskFiltersBar({ filters, onChange }: Props) {
  const active = filters.search || filters.status || filters.priority;
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input className="input sm:max-w-xs" type="search" placeholder="Search by title…" aria-label="Search tasks"
        value={filters.search} onChange={(e) => onChange({ ...filters, search: e.target.value })} />
      <select className="input sm:w-40" aria-label="Filter by status" value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as TaskFilters["status"] })}>
        <option value="">All statuses</option>
        {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select className="input sm:w-40" aria-label="Filter by priority" value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskFilters["priority"] })}>
        <option value="">All priorities</option>
        {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {active && <button className="btn-secondary" onClick={() => onChange({ search: "", status: "", priority: "" })}>Clear</button>}
    </div>
  );
}
