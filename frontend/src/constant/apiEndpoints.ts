export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
  EMPLOYEES: {
    LIST: "/employees/",
    CREATE: "/employees/",
    DETAIL: (id: number) => `/employees/${id}/`,
    DELETE: (id: number) => `/employees/${id}/`,
    SUMMARY: "/employees/summary/",
  },
  ATTENDANCE: {
    LIST: "/attendance/",
    CREATE: "/attendance/",
    DETAIL: (id: number) => `/attendance/${id}/`,
    DELETE: (id: number) => `/attendance/${id}/`,
    SUMMARY: "/attendance/summary/",
  },
} as const;
