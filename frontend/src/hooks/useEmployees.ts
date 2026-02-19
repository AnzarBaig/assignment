import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import employeeService from "@/api/services/employeeService";
import type { CreateEmployeeRequest } from "@/types/employeeTypes";

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees.list(),
    queryFn: employeeService.getAll,
  });
}

export function useEmployeeSummary() {
  return useQuery({
    queryKey: queryKeys.employees.summary(),
    queryFn: employeeService.getSummary,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}
