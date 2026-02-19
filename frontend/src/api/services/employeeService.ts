import apiClient from "@/api/client";
import { API_ENDPOINTS } from "@/constant/apiEndpoints";
import type {
  Employee,
  CreateEmployeeRequest,
  EmployeeSummary,
} from "@/types/employeeTypes";

const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.LIST);
    return response.data;
  },

  create: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.post(API_ENDPOINTS.EMPLOYEES.CREATE, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.EMPLOYEES.DELETE(id));
  },

  getSummary: async (): Promise<EmployeeSummary> => {
    const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.SUMMARY);
    return response.data;
  },
};

export default employeeService;
