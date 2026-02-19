import apiClient from "@/api/client";
import { API_ENDPOINTS } from "@/constant/apiEndpoints";
import type {
  Attendance,
  CreateAttendanceRequest,
  AttendanceFilters,
  AttendanceSummaryItem,
} from "@/types/attendanceTypes";

const attendanceService = {
  getAll: async (filters?: AttendanceFilters): Promise<Attendance[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.LIST, {
      params: filters,
    });
    return response.data;
  },

  create: async (data: CreateAttendanceRequest): Promise<Attendance> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ATTENDANCE.CREATE,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ATTENDANCE.DELETE(id));
  },

  getSummary: async (): Promise<AttendanceSummaryItem[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.SUMMARY);
    return response.data;
  },
};

export default attendanceService;
