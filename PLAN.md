# HRMS Lite — Implementation Plan

## Context

Build a lightweight Human Resource Management System for a job assignment. The app lets a single admin manage employee records and track daily attendance. The existing repo has a bare Django skeleton (no apps/models) and a Next.js frontend template with a "project" entity example that needs replacing.

**Strategy: Backend first, then Frontend, then Deployment.**

---

## Phase 1: Backend (Django + DRF)

### 1.1 Install dependencies
- `pip install django-cors-headers dj-database-url gunicorn whitenoise`

### 1.2 Create Django apps
- `python manage.py startapp employees`
- `python manage.py startapp attendance`

### 1.3 Models

**`employees/models.py`** — `Employee`
| Field | Type | Notes |
|-------|------|-------|
| `employee_id` | `CharField(max_length=20, unique=True)` | User-provided ID like "EMP001" |
| `full_name` | `CharField(max_length=150)` | Required |
| `email` | `EmailField(unique=True)` | Validated + unique |
| `department` | `CharField(max_length=100)` | Fixed choices: Engineering, HR, Finance, Marketing, Operations, Sales, Support, Design |
| `created_at` | `DateTimeField(auto_now_add=True)` | |
| `updated_at` | `DateTimeField(auto_now=True)` | |

**`attendance/models.py`** — `Attendance`
| Field | Type | Notes |
|-------|------|-------|
| `employee` | `ForeignKey(Employee, CASCADE)` | Deleting employee cascades |
| `date` | `DateField` | |
| `status` | `CharField(choices: Present/Absent)` | TextChoices enum |
| `created_at` | `DateTimeField(auto_now_add=True)` | |

Constraint: `unique_together = ['employee', 'date']` — one record per employee per day.

### 1.4 Serializers
- `employees/serializers.py` — `EmployeeSerializer` (ModelSerializer, validates uniqueness, normalizes email)
- `attendance/serializers.py` — `AttendanceSerializer` (includes read-only `employee_name` and `employee_id_display` fields) + `AttendanceSummarySerializer` (for aggregated stats)

### 1.5 Views (ViewSets)

**`EmployeeViewSet`** (ModelViewSet, methods: GET/POST/DELETE only)
- `GET /api/employees/` — list all
- `POST /api/employees/` — create (201 or 400)
- `GET /api/employees/{pk}/` — detail (200 or 404)
- `DELETE /api/employees/{pk}/` — delete (204 or 404)
- `GET /api/employees/summary/` — dashboard stats (total count + department breakdown)

**`AttendanceViewSet`** (ModelViewSet, methods: GET/POST/DELETE only)
- `GET /api/attendance/` — list all (filterable via query params: `?employee=`, `?date=`, `?status=`)
- `POST /api/attendance/` — mark attendance (201 or 400)
- `DELETE /api/attendance/{pk}/` — delete (204 or 404)
- `GET /api/attendance/summary/` — present/absent count per employee

Filtering powered by `django-filter`'s `DjangoFilterBackend`.

### 1.6 URL routing
- `employees/urls.py` — DRF `DefaultRouter` registering `EmployeeViewSet`
- `attendance/urls.py` — DRF `DefaultRouter` registering `AttendanceViewSet`
- `config/urls.py` — include both under `api/` prefix

### 1.7 Update `config/settings.py`
- Add to `INSTALLED_APPS`: `rest_framework`, `django_filters`, `corsheaders`, `employees`, `attendance`
- Add `CorsMiddleware` at top of middleware + `WhiteNoiseMiddleware` after SecurityMiddleware
- Add CORS config via env var (default `http://localhost:3000`)
- Database: `dj-database-url` with SQLite fallback for local dev
- DRF config: `AllowAny` permissions, no auth classes, `DjangoFilterBackend`
- `STATIC_ROOT`, `DEFAULT_AUTO_FIELD`, env-driven `SECRET_KEY`/`DEBUG`/`ALLOWED_HOSTS`

### 1.8 Admin registration
- Register both models with list_display, search, and filters

### 1.9 Migrations
- `makemigrations employees attendance && migrate`

---

## Phase 2: Frontend (Next.js + shadcn/ui)

### 2.1 Clean up template code
**Delete:** `projectService.ts`, `projectTypes.ts`, `useProject.ts`, `component-example.tsx`, `example.tsx`, `pages/api/hello.ts`

### 2.2 Simplify Axios client
- Remove JWT auth interceptors and 401/403 redirect logic from `src/api/client.ts`

### 2.3 API layer (following existing pipeline pattern)

**`constant/apiEndpoints.ts`** — RESTful endpoints for employees and attendance (with dynamic ID functions)

**`types/employeeTypes.ts`** — `Employee`, `CreateEmployeeRequest`, `EmployeeSummary`

**`types/attendanceTypes.ts`** — `Attendance`, `CreateAttendanceRequest`, `AttendanceFilters`, `AttendanceSummaryItem`

**`api/services/employeeService.ts`** — `getAll` (GET), `create` (POST), `delete` (DELETE), `getSummary` (GET)

**`api/services/attendanceService.ts`** — `getAll` (GET with filter params), `create` (POST), `delete` (DELETE), `getSummary` (GET)

**`utils/queryKeys.ts`** — key factories for employees and attendance

**`hooks/useEmployees.ts`** — `useEmployees`, `useEmployeeSummary`, `useCreateEmployee`, `useDeleteEmployee`

**`hooks/useAttendance.ts`** — `useAttendance(filters)`, `useAttendanceSummary`, `useMarkAttendance`, `useDeleteAttendance`

### 2.4 Layout & shared components

**`components/layout/AppLayout.tsx`** — Top nav bar with "HRMS Lite" branding + nav links (Dashboard, Employees, Attendance) using lucide icons. Active link highlighting via `useRouter`.

**Shared components** (in `components/shared/`):
- `PageHeader` — title + description + action slot
- `EmptyState` — icon + message for empty lists
- `LoadingState` — spinner with message
- `ErrorState` — error message with retry button
- `StatCard` — icon + title + value for dashboard stats
- `DataTable` — generic typed table component with column definitions

### 2.5 Pages

**`pages/index.tsx` — Dashboard**
- Stat cards: total employees, total departments, attendance overview
- Department breakdown table
- Attendance summary table (present/absent per employee)
- Uses `useEmployeeSummary()` + `useAttendanceSummary()`

**`pages/employees.tsx` — Employee Management**
- "Add Employee" form (Card with inputs: Employee ID, Full Name, Email, Department as Select dropdown with fixed options)
- Employee list table with delete action (AlertDialog confirmation)
- Loading/empty/error states
- Server-side validation errors displayed on form fields

**`pages/attendance.tsx` — Attendance Management**
- "Mark Attendance" form (employee select dropdown, date picker, status select)
- Filter bar (by employee + date) above the records table
- Attendance records table with Badge (green=Present, red=Absent) + delete action
- Loading/empty/error states

### 2.6 Update `_app.tsx`
- Wrap `<Component>` with `<AppLayout>`

---

## Phase 3: Bonus Features (built into the plan above)

All three bonus features are already covered:
1. **Filter attendance by date** — django-filter on backend + filter bar on frontend
2. **Total present days per employee** — `/api/attendance/summary/` endpoint + dashboard display
3. **Dashboard summary** — dedicated Dashboard page with stat cards and summary tables

---

## Phase 4: Deployment

### Backend → Render
- Create `requirements.txt` (Django, DRF, django-filter, cors-headers, psycopg2-binary, dj-database-url, gunicorn, whitenoise)
- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start command: `gunicorn config.wsgi:application`
- Env vars: `DATABASE_URL`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`

### Frontend → Vercel
- Set `NEXT_PUBLIC_API_BASE_URL` to Render backend URL
- Auto-detected as Next.js project

### Post-deploy
- Update backend `CORS_ALLOWED_ORIGINS` with the Vercel URL

---

## Phase 5: README.md

Create a `README.md` in the project root with:
- Project overview (HRMS Lite — what it does)
- Tech stack table (Next.js, Django, PostgreSQL, etc.)
- Steps to run locally (backend venv + migrate + runserver, frontend bun dev)
- Assumptions/limitations (single admin, no auth, no edit employee, SQLite for local dev)
- Live URLs (filled in after deployment)

---

## Verification

1. **Backend**: Start Django dev server, test all endpoints via DRF browsable API at `localhost:8000/api/`
2. **Frontend**: Start Next.js dev server, verify all CRUD operations, filters, and dashboard
3. **Integration**: Create employees → mark attendance → filter → delete → verify cascade
4. **Deployment**: Verify live URLs work end-to-end
