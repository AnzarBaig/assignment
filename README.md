<p align="center">
  <h1 align="center">HRMS Lite</h1>
  <p align="center">
    A lightweight Human Resource Management System for managing employee records and tracking daily attendance.
    <br />
    <a href="https://assignment.anzar.wtf"><strong>Live Demo →</strong></a>
    <br />
    <br />
    <a href="https://assignment.anzar.wtf">Frontend</a>
    ·
    <a href="https://backend.anzar.wtf/api">API</a>
  </p>
</p>

---

## About

**HRMS Lite** is a full-stack web application built as part of the Quess Corp assignment. It provides a clean, modern interface for a single administrator to:

- **Manage Employees** — Add and remove employee records with validated fields (ID, name, email, department).
- **Track Attendance** — Mark daily attendance (Present / Absent) for any employee, with one-record-per-day enforcement.
- **View Dashboard** — See at-a-glance stats: total employees, department breakdown, and per-employee attendance summaries.
- **Filter Records** — Filter attendance by employee, date, or status.

> No authentication is required — this is a single-admin demo application.

---

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Query, Axios |
| **Backend**  | Django 6, Django REST Framework, django-filter, Gunicorn, WhiteNoise       |
| **Database** | PostgreSQL 16 (SQLite fallback for local dev)                              |
| **Infra**    | Docker, Docker Compose, Nginx (reverse proxy), Certbot (SSL)               |
| **Package Managers** | bun (frontend), pip + venv (backend)                               |

---

## Project Structure

```
QuessCorpAssignment/
├── backend/                  # Django REST API
│   ├── config/               # Django project settings & WSGI
│   ├── employees/            # Employee app (models, views, serializers)
│   ├── attendance/           # Attendance app (models, views, serializers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── api/              # Axios client & service layers
│   │   ├── components/       # UI components (shadcn/ui + custom)
│   │   ├── hooks/            # React Query hooks
│   │   ├── pages/            # Next.js pages (Dashboard, Employees, Attendance)
│   │   └── types/            # TypeScript type definitions
│   ├── package.json
│   └── next.config.ts
├── nginx/                    # Nginx reverse-proxy config
│   └── quess.conf
├── docker-compose.yml        # Orchestrates all 3 services
├── Dockerfile.backend        # Python 3.12-slim + Gunicorn
├── Dockerfile.frontend       # Node 20 Alpine + Next.js standalone
└── .env                      # Environment variables (not committed)
```

---

## API Endpoints

| Method   | Endpoint                    | Description                          |
| -------- | --------------------------- | ------------------------------------ |
| `GET`    | `/api/employees/`           | List all employees                   |
| `POST`   | `/api/employees/`           | Create a new employee                |
| `GET`    | `/api/employees/{id}/`      | Get employee details                 |
| `DELETE` | `/api/employees/{id}/`      | Delete an employee                   |
| `GET`    | `/api/employees/summary/`   | Dashboard stats & department breakdown |
| `GET`    | `/api/attendance/`          | List attendance (filterable: `?employee=`, `?date=`, `?status=`) |
| `POST`   | `/api/attendance/`          | Mark attendance                      |
| `DELETE` | `/api/attendance/{id}/`     | Delete attendance record             |
| `GET`    | `/api/attendance/summary/`  | Present/absent count per employee    |

---

## Getting Started

### Prerequisites

- **Python** 3.12+
- **Node.js** 20+ (or [Bun](https://bun.sh))
- **PostgreSQL** 16 (optional — SQLite works for local dev)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/QuessCorpAssignment.git
cd QuessCorpAssignment
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the dev server
python manage.py runserver
```

The API will be available at **http://localhost:8000/api/**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install          # or: npm install

# Start the dev server
bun dev              # or: npm run dev
```

The app will be available at **http://localhost:3000**.

---

## Environment Variables

Create a `.env` file in the project root (required for Docker deployment):

```env
# ── PostgreSQL ──────────────────────────────────────
POSTGRES_DB=quessdb
POSTGRES_USER=quess
POSTGRES_PASSWORD=<your-strong-password>

# ── Django ──────────────────────────────────────────
DJANGO_SECRET_KEY=<generate-a-random-secret-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=backend.yourdomain.com,localhost
DATABASE_URL=postgresql://quess:<your-strong-password>@db:5432/quessdb

# ── CORS ────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=https://frontend.yourdomain.com

# ── Frontend ────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=https://backend.yourdomain.com/api
```

> **Note:** For local development without Docker, the defaults (SQLite, `localhost:3000` CORS, `DEBUG=True`) work out of the box — no `.env` is needed.

---

## Docker Deployment

The project ships with production-ready Docker configuration.

### Quick Start

```bash
# Build and start all services (PostgreSQL, Django, Next.js)
docker compose up -d --build

# Run database migrations
docker compose exec backend python manage.py migrate

# Verify all containers are running
docker compose ps
```

### Architecture

```
Client  →  Nginx (host)  →  Next.js   (container :3000)
                          →  Django    (container :8000)
                             PostgreSQL (container :5432) ← persistent volume
```

### Services

| Service      | Image               | Port  | Description            |
| ------------ | ------------------- | ----- | ---------------------- |
| `db`         | `postgres:16-alpine`| 5432  | PostgreSQL with named volume for data persistence |
| `backend`    | Custom (Python 3.12-slim) | 8000 | Django + Gunicorn (2 workers) |
| `frontend`   | Custom (Node 20 Alpine)  | 3000 | Next.js standalone build |

### Data Persistence

PostgreSQL data is stored in a Docker **named volume** (`pgdata`). Your data survives container restarts, rebuilds, and redeployments. Only `docker volume rm pgdata` destroys it.

```bash
# Backup database
docker compose exec db pg_dump -U quess quessdb > backup.sql

# Restore database
cat backup.sql | docker compose exec -T db psql -U quess quessdb
```

---

## Features

- ✅ **Employee CRUD** — Create, view, and delete employee records
- ✅ **Attendance Tracking** — Mark and manage daily attendance per employee
- ✅ **Dashboard** — Summary stats with department breakdown and attendance overview
- ✅ **Filtering** — Filter attendance records by employee, date, and status
- ✅ **Per-Employee Stats** — Total present/absent days aggregation
- ✅ **Responsive UI** — Modern interface built with shadcn/ui and Tailwind CSS
- ✅ **Dockerized** — One-command deployment with Docker Compose
- ✅ **PostgreSQL Persistence** — Named volumes ensure data survives restarts

---

## Assumptions & Limitations

- Single admin user — **no authentication** is implemented.
- Employees can be created and deleted but **not edited** (by design for the assignment scope).
- SQLite is used for local development; PostgreSQL is required for production / Docker.
- One attendance record per employee per day (enforced at the database level).

---

## License

This project was built as part of a Quess Corp assignment.
