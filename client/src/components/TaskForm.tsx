import { useState, type FormEvent } from "react";
import { Spinner } from "./Spinner";
import { ApiError } from "../lib/api";
import { PRIORITY_LABEL, STATUS_LABEL, type Task, type TaskInput } from "../lib/types";

interface Props { initial?: Task; onSubmit: (input: TaskInput) => Promise<void>; onCancel: () => void }
type Errors = Partial<Record<keyof TaskInput | "form", string>>;

export function validate(v: TaskInput): Errors {
  const e: Errors = {};
  if (!v.title.trim()) e.title = "Title is required";
  else if (v.title.trim().length > 200) e.title = "Title must be 200 characters or fewer";
  if (v.description.length > 2000) e.description = "Description must be 2000 characters or fewer";
  return e;
}

export function TaskForm({ initial, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<TaskInput>({
    title: initial?.title ?? "", description: initial?.description ?? "",
    priority: initial?.priority ?? "medium", status: initial?.status ?? "todo", dueDate: initial?.dueDate ?? null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) => { setValues((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) setErrors({ ...(err.details ?? {}), form: err.message });
      else setErrors({ form: "Something went wrong" });
      setSaving(false);
    }
  }

  const fieldErr = (k: keyof Errors) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;
  const label = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {errors.form && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</div>}
      <div>
        <label htmlFor="title" className={label}>Title <span className="text-red-500">*</span></label>
        <input id="title" className={`input ${errors.title ? "border-red-400" : ""}`} value={values.title} maxLength={200} autoFocus
          onChange={(e) => set("title", e.target.value)} placeholder="e.g. Prepare quarterly report" />
        {fieldErr("title")}
      </div>
      <div>
        <label htmlFor="description" className={label}>Description</label>
        <textarea id="description" rows={3} className="input resize-y" value={values.description} maxLength={2000}
          onChange={(e) => set("description", e.target.value)} placeholder="Optional details…" />
        {fieldErr("description")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="priority" className={label}>Priority</label>
          <select id="priority" className="input" value={values.priority} onChange={(e) => set("priority", e.target.value as TaskInput["priority"])}>
            {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={label}>Status</label>
          <select id="status" className="input" value={values.status} onChange={(e) => set("status", e.target.value as TaskInput["status"])}>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="dueDate" className={label}>Due date</label>
          <input id="dueDate" type="date" className="input" value={values.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value || null)} />
          {fieldErr("dueDate")}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Spinner />} {initial ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
