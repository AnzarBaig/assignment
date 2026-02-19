import { useState } from "react";
import {
  PlusIcon,
  Trash2Icon,
  CalendarCheckIcon,
  AlertCircleIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttendance,
  useMarkAttendance,
  useDeleteAttendance,
} from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import type { AttendanceFilters } from "@/types/attendanceTypes";

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
  const [formData, setFormData] = useState({
    employee: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "Present" as "Present" | "Absent",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function resetForm() {
    setFormData({
      employee: "",
      date: format(new Date(), "yyyy-MM-dd"),
      status: "Present",
    });
    setFormErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});

    if (!formData.employee) {
      setFormErrors({ employee: "Please select an employee" });
      return;
    }

    markAttendance.mutate(
      {
        employee: Number(formData.employee),
        date: formData.date,
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold">Attendance</h1>
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
              <div className="grid gap-1.5">
                <Label>Employee</Label>
                <Select
                  value={formData.employee}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, employee: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
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
                  </SelectContent>
                </Select>
                {formErrors.employee && (
                  <p className="text-xs text-destructive">
                    {formErrors.employee}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="att-date">Date</Label>
                <Input
                  id="att-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, date: e.target.value }))
                  }
                  aria-invalid={!!formErrors.date}
                />
                {formErrors.date && (
                  <p className="text-xs text-destructive">{formErrors.date}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label>Status</Label>
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
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.status && (
                  <p className="text-xs text-destructive">
                    {formErrors.status}
                  </p>
                )}
              </div>

              {formErrors.non_field_errors && (
                <p className="text-xs text-destructive">
                  {formErrors.non_field_errors}
                </p>
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
          <SelectContent>
            <SelectItem value="all">All employees</SelectItem>
            {employees?.map((emp) => (
              <SelectItem key={emp.id} value={String(emp.id)}>
                {emp.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-40"
          value={filters.date ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              date: e.target.value || undefined,
            }))
          }
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
            className="text-muted-foreground"
          >
            <XIcon />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {!records || records.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <CalendarCheckIcon className="size-10 text-muted-foreground/50" />
              <div>
                <p className="font-medium">
                  {hasActiveFilters
                    ? "No records match your filters"
                    : "No attendance records yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "Try adjusting or clearing your filters."
                    : "Mark attendance for an employee to get started."}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">
                      {record.employee_id_display}
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.employee_name}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {record.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "Present"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2Icon />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete this record?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the attendance record
                              for {record.employee_name} on {record.date}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(record.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
