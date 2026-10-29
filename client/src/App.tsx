import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { SummaryCards } from "./components/SummaryCards";
import { TaskFiltersBar } from "./components/TaskFiltersBar";
import { TaskTable } from "./components/TaskTable";
import { TaskForm } from "./components/TaskForm";
import { Modal } from "./components/Modal";
import { Spinner } from "./components/Spinner";
import { useToast } from "./components/Toast";
import { api, ApiError } from "./lib/api";
import type { Task, TaskFilters, TaskInput, TaskStatus } from "./lib/types";

type Dialog = { kind: "create" } | { kind: "edit"; task: Task } | { kind: "delete"; task: Task } | null;
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong");

export default function App() {
  const toast = useToast();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({ search: "", status: "", priority: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasFilters = Boolean(filters.search || filters.status || filters.priority);

  const load = useCallback(async (f: TaskFilters) => {
    setError(null);
    try {
      const filtered = f.search || f.status || f.priority;
      const [all, list] = await Promise.all([api.list(), filtered ? api.list(f) : null]);
      setAllTasks(all);
      setTasks(list ?? all);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce so typing in search doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => load(filters), filters.search ? 250 : 0);
    return () => clearTimeout(t);
  }, [filters, load]);

  const refresh = () => load(filters);

  async function handleCreate(input: TaskInput) {
    await api.create(input);
    setDialog(null);
    toast("success", "Task created");
    refresh();
  }
  async function handleUpdate(task: Task, input: TaskInput) {
    await api.update(task.id, input);
    setDialog(null);
    toast("success", "Task updated");
    refresh();
  }
  async function handleStatus(task: Task, status: TaskStatus) {
    setBusyId(task.id);
    try {
      await api.update(task.id, { title: task.title, description: task.description, priority: task.priority, dueDate: task.dueDate, status });
      toast("success", "Status updated");
      await refresh();
    } catch (e) {
      toast("error", errMsg(e));
    } finally {
      setBusyId(null);
    }
  }
  async function handleDelete(task: Task) {
    setDeleting(true);
    try {
      await api.remove(task.id);
      toast("success", "Task deleted");
      setDialog(null);
      refresh();
    } catch (e) {
      toast("error", errMsg(e));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-60">
        <TopNav onMenu={() => setMenuOpen(true)} onNewTask={() => setDialog({ kind: "create" })} />
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
          <SummaryCards tasks={allTasks} loading={loading} />

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
              <TaskFiltersBar filters={filters} onChange={setFilters} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><Spinner /> Loading tasks…</div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button className="btn-secondary" onClick={() => { setLoading(true); refresh(); }}>Retry</button>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-sm font-medium text-slate-900">{hasFilters ? "No tasks match your filters" : "No tasks yet"}</p>
                <p className="text-sm text-slate-500">{hasFilters ? "Try adjusting your search or filters." : "Create your first task to get started."}</p>
                {!hasFilters && <button className="btn-primary mt-2" onClick={() => setDialog({ kind: "create" })}>+ New Task</button>}
              </div>
            ) : (
              <TaskTable tasks={tasks} busyId={busyId} onEdit={(task) => setDialog({ kind: "edit", task })}
                onDelete={(task) => setDialog({ kind: "delete", task })} onStatusChange={handleStatus} />
            )}
          </section>
        </main>
      </div>

      {dialog?.kind === "create" && (
        <Modal title="New task" onClose={() => setDialog(null)}>
          <TaskForm onSubmit={handleCreate} onCancel={() => setDialog(null)} />
        </Modal>
      )}
      {dialog?.kind === "edit" && (
        <Modal title="Edit task" onClose={() => setDialog(null)}>
          <TaskForm initial={dialog.task} onSubmit={(i) => handleUpdate(dialog.task, i)} onCancel={() => setDialog(null)} />
        </Modal>
      )}
      {dialog?.kind === "delete" && (
        <Modal title="Delete task" onClose={() => !deleting && setDialog(null)}>
          <p className="text-sm text-slate-600">Delete <span className="font-medium text-slate-900">“{dialog.task.title}”</span>? This cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setDialog(null)} disabled={deleting}>Cancel</button>
            <button className="btn-danger" onClick={() => handleDelete(dialog.task)} disabled={deleting}>{deleting && <Spinner />} Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
