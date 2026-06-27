# KabanQ

A full-stack Kanban task board built as a monorepo. It features a React 19 + Vite + Tailwind v4 + shadcn/ui frontend using Feature-Sliced Design, and a Python + SQLite backend.

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS v4, shadcn/ui, Zustand, Bun
- **Backend:** Python 3.13, FastAPI, Uvicorn, SQLite (no ORM)

> **Note:** The backend uses FastAPI + Pydantic v2, which requires Python ≤3.13. For local development on systems with newer Python versions, use Docker.

## Project Structure

```
.
├── apps/
│   ├── frontend/          # React app (FSD)
│   └── backend/           # Python API
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Bun (package manager)
- uv (for Python backend)
- Docker (optional)

### Install dependencies

```bash
bun install
cd apps/backend && uv sync
```

### Run everything (local)

```bash
bun run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

### Run individually

```bash
bun run backend   # uv run uvicorn ...
bun run frontend
```

## Docker (minimal)

Build and run both services with Docker Compose:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

The backend image uses `uv` to create its own environment (`uv sync`) and run the server. No manual venv or pip. The frontend image uses Bun and mounts your local source for hot reload.

### Docker details

- `apps/backend/Dockerfile` — `ghcr.io/astral-sh/uv:python3.13-bookworm-slim` + `uv pip install --system` + `uvicorn`
- `apps/frontend/Dockerfile` — `oven/bun:1-slim` + `bun install`
- `docker-compose.yml` — wires both services; frontend proxies `/api` to the backend container via `VITE_API_URL`.

## Features

- Full CRUD for tasks
- Kanban-style board with four columns (Backlog, To Do, In Progress, Done)
- Drag & drop between columns
- Confetti animation when moving a task to Done
- Live search/filter
- Refresh and count badges per column

## Backend Architecture (CQRS)

- `commands/` — write operations and handlers
- `queries/` — read projections
- `models/` — domain models
- `infrastructure/` — raw SQLite access without ORMs
- `di/` — lightweight dependency injection container

## Frontend Architecture (FSD)

- `app/` — providers, styles, entry point
- `pages/` — page-level screens
- `widgets/` — board, columns, cards, confetti
- `features/todos/` — task API, store, and UI
- `shared/` — reusable UI components and utilities

## License

This project is licensed under the [Apache License 2.0](LICENSE).

> Copyright 2026 Daniel Acosta. See [`LICENSE`](LICENSE) for details.
