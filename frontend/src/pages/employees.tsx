import { useState } from "react";
import {
  PlusIcon,
  Trash2Icon,
  UsersIcon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmployees,
  useCreateEmployee,
  useDeleteEmployee,
} from "@/hooks/useEmployees";

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

  function resetForm() {
    setFormData({ employee_id: "", full_name: "", email: "", department: "" });
    setFormErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
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
          <h1 className="text-lg font-semibold">Employees</h1>
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
            <Button size="sm">
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
              <div className="grid gap-1.5">
                <Label htmlFor="employee_id">Employee ID</Label>
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
                  <p className="text-xs text-destructive">
                    {formErrors.employee_id}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="full_name">Full Name</Label>
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
                  <p className="text-xs text-destructive">
                    {formErrors.full_name}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
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
                  <p className="text-xs text-destructive">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, department: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.department && (
                  <p className="text-xs text-destructive">
                    {formErrors.department}
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

      <Card>
        <CardContent className="p-0">
          {!employees || employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <UsersIcon className="size-10 text-muted-foreground/50" />
              <div>
                <p className="font-medium">No employees yet</p>
                <p className="text-sm text-muted-foreground">
                  Add your first employee to get started.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-mono text-xs">
                      {emp.employee_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {emp.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.email}
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
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
                              Delete {emp.full_name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the employee and all
                              their attendance records. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(emp.id, emp.full_name)}
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
