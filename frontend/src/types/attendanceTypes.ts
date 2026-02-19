export type AttendanceStatus = "Present" | "Absent";

export interface Attendance {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_display: string;
  date: string;
  status: AttendanceStatus;
  created_at: string;
}

export interface CreateAttendanceRequest {
  employee: number;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceFilters {
  employee?: number;
  date?: string;
  status?: AttendanceStatus;
}

export interface AttendanceSummaryItem {
  employee_id: number;
  employee_id_display: string;
  employee_name: string;
  total_present: number;
  total_absent: number;
}
