import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import attendanceService from "@/api/services/attendanceService";
import type {
  CreateAttendanceRequest,
  AttendanceFilters,
} from "@/types/attendanceTypes";

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: () => attendanceService.getAll(filters),
  });
}

export function useAttendanceSummary() {
  return useQuery({
    queryKey: queryKeys.attendance.summary(),
    queryFn: attendanceService.getSummary,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceRequest) =>
      attendanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => attendanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}
