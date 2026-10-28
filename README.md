# TaskFlow — Task Management System

A lightweight full-stack task manager: **React + TypeScript + Vite + Tailwind CSS** frontend, **Express + TypeScript** REST API, and **SQLite** storage (via `better-sqlite3`).

## Requirements
- Node.js 20 or newer, npm 10+

## Setup
```bash
npm install
cp .env.example .env      # optional — defaults work out of the box
```

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Starts the API (http://localhost:3001) and Vite (http://localhost:5173) together. Vite proxies `/api` to Express. |
| `npm run build` | Builds the frontend to `dist/client` and compiles the server to `dist/server`. |
| `npm start` | Runs the production server; serves the API **and** the built frontend from one origin (http://localhost:3001). |
| `npm test` | Runs unit and API integration tests (Vitest + Supertest, in-memory SQLite). |
| `npm run typecheck` | Type-checks frontend and backend. |

## Configuration (`.env`)
| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Express port (also used by the Vite proxy) |
| `DATABASE_PATH` | `./data/taskflow.db` | SQLite file; created automatically, persists across restarts |
| `NODE_ENV` | `development` | `production` enables serving `dist/client` |

## REST API
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | Query: `search` (title contains), `status` (`todo`/`in_progress`/`completed`), `priority` (`low`/`medium`/`high`) |
| GET | `/api/tasks/:id` | 404 if not found |
| POST | `/api/tasks` | Body: `{ title, description?, priority?, status?, dueDate? (YYYY-MM-DD) }` → 201 |
| PUT | `/api/tasks/:id` | Full task body → 200, 404 if not found |
| DELETE | `/api/tasks/:id` | 204, 404 if not found |

Errors return JSON `{ "error": string, "details"?: { field: message } }` with 400 / 404 / 500 status codes.

## Project structure
```
client/            React app (Vite root)
  src/components/  UI components (Sidebar, TopNav, SummaryCards, TaskTable, TaskForm, Modal, Toast…)
  src/lib/         API client and shared types
server/
  src/db/          SQLite connection, schema and task repository (parameterized queries)
  src/routes/      Express routers
  src/middleware/  Centralized error handling
  tests/           Vitest + Supertest tests
```
