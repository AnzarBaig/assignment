import type { AttendanceFilters } from "@/types/attendanceTypes";

export const queryKeys = {
  employees: {
    all: ["employees"] as const,
    list: () => ["employees", "list"] as const,
    detail: (id: number) => ["employees", "detail", id] as const,
    summary: () => ["employees", "summary"] as const,
  },
  attendance: {
    all: ["attendance"] as const,
    list: (filters?: AttendanceFilters) =>
      ["attendance", "list", filters] as const,
    summary: () => ["attendance", "summary"] as const,
  },
};
