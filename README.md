# KabanQ

A full-stack Kanban task board built as a monorepo. It features a React 19 + Vite + Tailwind v4 + shadcn/ui frontend using Feature-Sliced Design, and a Python + SQLite backend.

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS v4, shadcn/ui, Zustand, Bun
- **Backend:** Python 3.13, FastAPI, Uvicorn, PostgreSQL (psycopg, no ORM)

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

- `apps/backend/Dockerfile` — `ghcr.io/astral-sh/uv:python3.13-bookworm-slim` + `uv sync` + `uvicorn` (production image, no `--reload`)
- `apps/frontend/Dockerfile` — `oven/bun:1-slim` + `bun install`
- `docker-compose.yml` — wires `postgres`, `backend` and `frontend`; frontend proxies `/api` to the backend container via `VITE_API_URL`.

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
- `database/` — raw PostgreSQL access without ORMs
- `di/` — lightweight dependency injection container

## Infrastructure (AWS CDK + UV)

The `infra/` directory contains a Python CDK app managed with `uv`:

```bash
cd infra
uv sync --python 3.13
uv run python app.py          # synthesize templates into cdk.out
uv run cdk deploy --all       # deploy all stacks (requires AWS CDK CLI)
```

Stacks:

- `VpcStack` — VPC with public and private subnets.
- `DatabaseStack` — Aurora PostgreSQL serverless v2, security group and Secrets Manager credential.
- `BackendStack` — ECR repository, ECS Fargate service with ALB; `DATABASE_URL` is injected from the RDS secret.
- `FrontendStack` — S3 bucket and CloudFront distribution.

> The AWS CDK CLI (`cdk`) is a Node.js tool; install it globally with `npm install -g aws-cdk` or `bun add -g aws-cdk`.

## Frontend Architecture (FSD)

- `app/` — providers, styles, entry point
- `pages/` — page-level screens
- `widgets/` — board, columns, cards, confetti
- `features/todos/` — task API, store, and UI
- `shared/` — reusable UI components and utilities

## License

This project is licensed under the [Apache License 2.0](LICENSE).

> Copyright 2026 Daniel Acosta. See [`LICENSE`](LICENSE) for details.
