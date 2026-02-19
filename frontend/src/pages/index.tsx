import {
  UsersIcon,
  BuildingIcon,
  CalendarCheckIcon,
  CalendarXIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeSummary } from "@/hooks/useEmployees";
import { useAttendanceSummary } from "@/hooks/useAttendance";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    data: empSummary,
    isLoading: empLoading,
    error: empError,
    refetch: refetchEmp,
  } = useEmployeeSummary();
  const {
    data: attSummary,
    isLoading: attLoading,
    error: attError,
    refetch: refetchAtt,
  } = useAttendanceSummary();

  const isLoading = empLoading || attLoading;
  const error = empError || attError;

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircleIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchEmp();
            refetchAtt();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const totalPresent =
    attSummary?.reduce((sum, item) => sum + item.total_present, 0) ?? 0;
  const totalAbsent =
    attSummary?.reduce((sum, item) => sum + item.total_absent, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={empSummary?.total_employees ?? 0}
          icon={UsersIcon}
        />
        <StatCard
          title="Departments"
          value={empSummary?.departments.length ?? 0}
          icon={BuildingIcon}
        />
        <StatCard
          title="Total Present"
          value={totalPresent}
          icon={CalendarCheckIcon}
          description="All-time attendance records"
        />
        <StatCard
          title="Total Absent"
          value={totalAbsent}
          icon={CalendarXIcon}
          description="All-time absence records"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
            <CardDescription>Employees per department</CardDescription>
          </CardHeader>
          <CardContent>
            {empSummary?.departments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No employees yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empSummary?.departments.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">
                        {dept.department}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {dept.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>
              Present & absent days per employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!attSummary || attSummary.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No attendance records yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attSummary.map((item) => (
                    <TableRow key={item.employee_id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {item.employee_name}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.employee_id_display}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="tabular-nums">
                          {item.total_present}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive" className="tabular-nums">
                          {item.total_absent}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
