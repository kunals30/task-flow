import { Router } from "express";
import type { TaskRepository } from "../db/taskRepository.js";
import { HttpError } from "../errors.js";
import { parseFilters, parseId, validateTaskInput } from "../validation.js";

export function tasksRouter(repo: TaskRepository) {
  const r = Router();

  r.get("/", (req, res) => {
    res.json(repo.list(parseFilters(req.query as Record<string, unknown>)));
  });

  r.get("/:id", (req, res) => {
    const task = repo.get(parseId(req.params.id));
    if (!task) throw new HttpError(404, "Task not found");
    res.json(task);
  });

  r.post("/", (req, res) => {
    res.status(201).json(repo.create(validateTaskInput(req.body)));
  });

  r.put("/:id", (req, res) => {
    const id = parseId(req.params.id);
    const task = repo.update(id, validateTaskInput(req.body));
    if (!task) throw new HttpError(404, "Task not found");
    res.json(task);
  });

  r.delete("/:id", (req, res) => {
    if (!repo.delete(parseId(req.params.id))) throw new HttpError(404, "Task not found");
    res.status(204).end();
  });

  return r;
}
