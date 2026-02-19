# Project Overview

HRMS Lite frontend — a Next.js application for managing employees and tracking attendance.

## Tech Stack

- **Framework:** Next.js 16 (Pages Router — `src/pages/`)
- **Language:** TypeScript (strict mode)
- **React:** 19
- **UI:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 4
- **Data Fetching:** React Query (@tanstack/react-query) + Axios
- **Package Manager:** bun

## Commands

- `bun dev` — start dev server
- `bun run build` — production build
- `bun run lint` — run ESLint

## Project Structure

```
src/
  api/
    client.ts                    # Axios instance (no auth)
    services/
      employeeService.ts         # Employee CRUD (GET/POST/DELETE)
      attendanceService.ts       # Attendance CRUD + filtering
  constant/
    apiEndpoints.ts              # API_BASE_URL + API_ENDPOINTS
  types/
    employeeTypes.ts             # Employee, CreateEmployeeRequest, EmployeeSummary
    attendanceTypes.ts           # Attendance, CreateAttendanceRequest, AttendanceFilters
  utils/
    queryKeys.ts                 # React Query cache key factories
  hooks/
    useEmployees.ts              # useEmployees, useEmployeeSummary, useCreateEmployee, useDeleteEmployee
    useAttendance.ts             # useAttendance, useAttendanceSummary, useMarkAttendance, useDeleteAttendance
  components/
    app-sidebar.tsx              # Sidebar navigation (Dashboard, Employees, Attendance)
    layout/
      app-layout.tsx             # SidebarProvider + SidebarInset wrapper
    ui/                          # shadcn UI components
  lib/
    utils.ts                     # cn() utility (clsx + tailwind-merge)
  pages/
    _app.tsx                     # QueryClientProvider + ThemeProvider + AppLayout
    _document.tsx
    index.tsx                    # Dashboard (stats + department + attendance summary)
                                 #   Stats (radial ring cards):
                                 #     Attendance Rate  — present / total records
                                 #     Absence Rate     — absent / total records
                                 #     Total Employees  — tracked / total (shows registration count)
                                 #     Tracked Employees — tracked / total (shows tracking coverage %)
    employees.tsx                # Employee list + add dialog + delete
    attendance.tsx               # Attendance records + mark dialog + filters + delete
  styles/
    globals.css
```

## Data Fetching Architecture

Pipeline: `apiEndpoints → types → services → queryKeys → hooks → pages`

Services use proper HTTP methods (GET, POST, DELETE). No auth required.

### Cache invalidation strategy

- **Create:** invalidate entity's `all` key (refetch lists + summaries)
- **Delete employee:** invalidate both `employees.all` and `attendance.all` (cascade)
- **Delete attendance:** invalidate `attendance.all`

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Services are plain objects (not classes), no error handling (React Query handles it)
- Query keys use hierarchical factories with `as const`
- No authentication — open API
- Backend runs on `localhost:8000`, frontend on `localhost:3000`
- `NEXT_PUBLIC_API_BASE_URL` env var points to backend API base
