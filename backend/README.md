# HRMS Lite — Backend

Django REST Framework API for employee management and attendance tracking.

## Tech Stack

- Python 3.14, Django 6, Django REST Framework
- PostgreSQL (production) / SQLite (local dev)
- django-filter for query filtering

## Run Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API available at `http://localhost:8000/api/`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Add employee |
| DELETE | `/api/employees/{id}/` | Delete employee |
| GET | `/api/employees/summary/` | Employee & department stats |
| GET | `/api/attendance/` | List attendance (filterable) |
| POST | `/api/attendance/` | Mark attendance |
| DELETE | `/api/attendance/{id}/` | Delete attendance record |
| GET | `/api/attendance/summary/` | Present/absent count per employee |

**Attendance filters:** `?employee={id}`, `?date=YYYY-MM-DD`, `?status=Present|Absent`

## Validations

- All fields required
- Email format validated + must be unique
- Employee ID must be unique
- One attendance record per employee per day
- Deleting an employee cascades to their attendance records
