import { useMemo, useState } from "react";
import {
  PlusIcon,
  Trash2Icon,
  UsersIcon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/reui/badge";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination";
import {
  useEmployees,
  useCreateEmployee,
  useDeleteEmployee,
} from "@/hooks/useEmployees";
import type { Employee } from "@/types/employeeTypes";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "Support",
  "Design",
] as const;

interface FormErrors {
  employee_id?: string;
  full_name?: string;
  email?: string;
  department?: string;
  non_field_errors?: string;
}

export default function EmployeesPage() {
  const { data: employees, isLoading, error, refetch } = useEmployees();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  function resetForm() {
    setFormData({ employee_id: "", full_name: "", email: "", department: "" });
    setFormErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});

    createEmployee.mutate(formData, {
      onSuccess: () => {
        toast.success("Employee added successfully");
        setDialogOpen(false);
        resetForm();
      },
      onError: (err) => {
        if (isAxiosError(err) && err.response?.status === 400) {
          setFormErrors(err.response.data as FormErrors);
        } else {
          toast.error("Failed to add employee");
        }
      },
    });
  }

  function handleDelete(id: number, name: string) {
    deleteEmployee.mutate(id, {
      onSuccess: () => toast.success(`${name} has been removed`),
      onError: () => toast.error("Failed to delete employee"),
    });
  }

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "full_name",
        id: "full_name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback>
                {row.original.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-px">
              <div className="text-foreground font-medium">
                {row.original.full_name}
              </div>
              <div className="text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
        meta: {
          skeleton: (
            <div className="flex h-10.25 items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ),
        },
        size: 250,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "department",
        id: "department",
        header: "Role",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="text-foreground font-medium">
              {row.original.department}
            </div>
            <div className="text-muted-foreground font-mono text-xs">
              {row.original.employee_id}
            </div>
          </div>
        ),
        meta: {
          skeleton: (
            <div className="space-y-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
          ),
        },
        size: 150,
        enableSorting: true,
      },
      {
        accessorKey: "employee_id",
        id: "status",
        header: "Status",
        cell: () => (
          <Badge variant="success-outline">Active</Badge>
        ),
        meta: {
          skeleton: <Skeleton className="h-7 w-16" />,
        },
        size: 100,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {row.original.full_name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the employee and all their
                  attendance records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() =>
                    handleDelete(row.original.id, row.original.full_name)
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
        size: 48,
        enableSorting: false,
      },
    ],
    []
  );

  const tableData = useMemo(() => employees ?? [], [employees]);

  const table = useReactTable({
    columns,
    data: tableData,
    pageCount: Math.ceil((tableData.length || 0) / pagination.pageSize),
    getRowId: (row) => String(row.id),
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircleIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">Failed to load employees</p>
          <p className="text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">
            {employees?.length ?? 0} total employees
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="lg">
              <PlusIcon />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new employee.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Field data-invalid={!!formErrors.employee_id || undefined}>
                <FieldLabel htmlFor="employee_id">Employee ID</FieldLabel>
                <Input
                  id="employee_id"
                  placeholder="e.g. EMP001"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      employee_id: e.target.value,
                    }))
                  }
                  aria-invalid={!!formErrors.employee_id}
                />
                {formErrors.employee_id && (
                  <FieldError>{formErrors.employee_id}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!formErrors.full_name || undefined}>
                <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, full_name: e.target.value }))
                  }
                  aria-invalid={!!formErrors.full_name}
                />
                {formErrors.full_name && (
                  <FieldError>{formErrors.full_name}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!formErrors.email || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <FieldError>{formErrors.email}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!formErrors.department || undefined}>
                <FieldLabel>Department</FieldLabel>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, department: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.department && (
                  <FieldError>{formErrors.department}</FieldError>
                )}
              </Field>

              {formErrors.non_field_errors && (
                <FieldError>{formErrors.non_field_errors}</FieldError>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createEmployee.isPending}
                  className="w-full sm:w-auto"
                >
                  {createEmployee.isPending && (
                    <Loader2Icon className="animate-spin" />
                  )}
                  Add Employee
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataGrid
        table={table}
        recordCount={tableData.length}
        isLoading={isLoading}
        tableLayout={{ headerSticky: true }}
        emptyMessage={
          <div className="flex flex-col items-center gap-2 py-8">
            <UsersIcon className="size-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No employees yet</p>
            <p className="text-muted-foreground/60 text-xs">
              Add your first employee to get started.
            </p>
          </div>
        }
      >
        <div className="w-full space-y-2.5">
          <DataGridContainer>
            <ScrollArea className="h-96">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
          {tableData.length > 0 && <DataGridPagination />}
        </div>
      </DataGrid>
    </div>
  );
}
