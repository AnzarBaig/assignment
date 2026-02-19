import { useMemo, useState } from "react";
import {
  PlusIcon,
  Trash2Icon,
  CalendarCheckIcon,
  CalendarIcon,
  AlertCircleIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { format } from "date-fns";
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

import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  useAttendance,
  useMarkAttendance,
  useDeleteAttendance,
} from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import type { Attendance, AttendanceFilters } from "@/types/attendanceTypes";

interface FormErrors {
  employee?: string;
  date?: string;
  status?: string;
  non_field_errors?: string;
}

export default function AttendancePage() {
  const [filters, setFilters] = useState<AttendanceFilters>({});
  const {
    data: records,
    isLoading,
    error,
    refetch,
  } = useAttendance(filters);
  const { data: employees } = useEmployees();
  const markAttendance = useMarkAttendance();
  const deleteAttendance = useDeleteAttendance();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    employee: "",
    status: "Present" as "Present" | "Absent",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Filter calendar popover state
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  function resetForm() {
    setFormData({ employee: "", status: "Present" });
    setFormDate(new Date());
    setFormErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});

    if (!formData.employee) {
      setFormErrors({ employee: "Please select an employee" });
      return;
    }

    if (!formDate) {
      setFormErrors({ date: "Please select a date" });
      return;
    }

    markAttendance.mutate(
      {
        employee: Number(formData.employee),
        date: format(formDate, "yyyy-MM-dd"),
        status: formData.status,
      },
      {
        onSuccess: () => {
          toast.success("Attendance marked successfully");
          setDialogOpen(false);
          resetForm();
        },
        onError: (err) => {
          if (isAxiosError(err) && err.response?.status === 400) {
            setFormErrors(err.response.data as FormErrors);
          } else {
            toast.error("Failed to mark attendance");
          }
        },
      }
    );
  }

  function handleDelete(id: number) {
    deleteAttendance.mutate(id, {
      onSuccess: () => toast.success("Attendance record deleted"),
      onError: () => toast.error("Failed to delete record"),
    });
  }

  const hasActiveFilters = filters.employee || filters.date;

  const columns = useMemo<ColumnDef<Attendance>[]>(
    () => [
      {
        accessorKey: "employee_name",
        id: "employee_name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback>
                {row.original.employee_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-px">
              <div className="text-foreground font-medium">
                {row.original.employee_name}
              </div>
              <div className="text-muted-foreground font-mono text-xs">
                {row.original.employee_id_display}
              </div>
            </div>
          </div>
        ),
        meta: {
          skeleton: (
            <div className="flex h-10 items-center gap-3">
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
        accessorKey: "date",
        id: "date",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-foreground tabular-nums">
            {row.original.date}
          </div>
        ),
        meta: {
          skeleton: <Skeleton className="h-5 w-20" />,
        },
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          if (row.original.status === "Present") {
            return <Badge variant="success-outline">Present</Badge>;
          }
          return <Badge variant="destructive-outline">Absent</Badge>;
        },
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
                <AlertDialogTitle>Delete this record?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the attendance record for{" "}
                  {row.original.employee_name} on {row.original.date}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => handleDelete(row.original.id)}
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

  const tableData = useMemo(() => records ?? [], [records]);

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
          <p className="font-medium">Failed to load attendance records</p>
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
          <h1 className="text-lg font-semibold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground">
            {records?.length ?? 0} records
            {hasActiveFilters ? " (filtered)" : ""}
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
            <Button size="sm">
              <PlusIcon />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
              <DialogDescription>
                Record attendance for an employee.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Field data-invalid={!!formErrors.employee || undefined}>
                <FieldLabel>Employee</FieldLabel>
                <Select
                  value={formData.employee}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, employee: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.full_name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                      {(!employees || employees.length === 0) && (
                        <SelectItem value="__none" disabled>
                          No employees available
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.employee && (
                  <FieldError>{formErrors.employee}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!formErrors.date || undefined}>
                <FieldLabel>Date</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4" />
                      {formDate
                        ? format(formDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={setFormDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.date && (
                  <FieldError>{formErrors.date}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!formErrors.status || undefined}>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((p) => ({
                      ...p,
                      status: value as "Present" | "Absent",
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.status && (
                  <FieldError>{formErrors.status}</FieldError>
                )}
              </Field>

              {formErrors.non_field_errors && (
                <FieldError>{formErrors.non_field_errors}</FieldError>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={markAttendance.isPending}
                  className="w-full sm:w-auto"
                >
                  {markAttendance.isPending && (
                    <Loader2Icon className="animate-spin" />
                  )}
                  Mark Attendance
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.employee ? String(filters.employee) : "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              employee: value === "all" ? undefined : Number(value),
            }))
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All employees" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectItem value="all">All employees</SelectItem>
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.full_name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-44 justify-start font-normal",
                !filterDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="size-3.5" />
              {filterDate ? format(filterDate, "MMM d, yyyy") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={(date) => {
                setFilterDate(date);
                setFilters((prev) => ({
                  ...prev,
                  date: date ? format(date, "yyyy-MM-dd") : undefined,
                }));
              }}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({});
              setFilterDate(undefined);
            }}
            className="text-muted-foreground"
          >
            <XIcon />
            Clear
          </Button>
        )}
      </div>

      <DataGrid
        table={table}
        recordCount={tableData.length}
        isLoading={isLoading}
        tableLayout={{ headerSticky: true }}
        emptyMessage={
          <div className="flex flex-col items-center gap-2 py-8">
            <CalendarCheckIcon className="size-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              {hasActiveFilters
                ? "No records match your filters"
                : "No attendance records yet"}
            </p>
            <p className="text-muted-foreground/60 text-xs">
              {hasActiveFilters
                ? "Try adjusting or clearing your filters."
                : "Mark attendance for an employee to get started."}
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
