export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface EmployeeSummary {
  total_employees: number;
  departments: DepartmentCount[];
}
