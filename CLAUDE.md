# QuessCorpAssignment

Full-stack web application — Next.js frontend + Django REST Framework backend.

## Project Structure

```
QuessCorpAssignment/
├── frontend/          # Next.js 16 (TypeScript, Tailwind, shadcn/ui)
├── backend/           # Django + DRF (PostgreSQL)
└── CLAUDE.md          # This file
```

See `frontend/CLAUDE.md` and `backend/CLAUDE.md` for service-specific details.

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | Next.js 16, TypeScript, React 19, Tailwind CSS 4, React Query, Axios |
| Backend  | Django, Django REST Framework, django-filter |
| Database | PostgreSQL (psycopg2-binary)              |
| Package  | bun (frontend), pip + venv (backend)      |

## Backend Apps

- **users** — user management
- **posts** — post CRUD
- **comments** — comment CRUD

## Running Locally

```bash
# Frontend
cd frontend && bun dev

# Backend
cd backend && source venv/bin/activate && python manage.py runserver
```

## Conventions

- Frontend runs on `localhost:3000`, backend on `localhost:8000`
- Frontend uses Axios with base URL pointing to backend API
- All API endpoints are prefixed with `/api/`
- No authentication (for now)
