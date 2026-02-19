import { AlertCircleIcon } from "lucide-react";
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
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeSummary } from "@/hooks/useEmployees";
import { useAttendanceSummary } from "@/hooks/useAttendance";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

const chartConfig = {
  "chart-1": {
    label: "Attendance Rate",
    color: "var(--chart-1)",
  },
  "chart-2": {
    label: "Dept Coverage",
    color: "var(--chart-2)",
  },
  "chart-3": {
    label: "Total Employees",
    color: "var(--chart-3)",
  },
  "chart-4": {
    label: "Absence Rate",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <CardContent className="p-0 flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
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
  const totalRecords = totalPresent + totalAbsent;
  const activeDepts = empSummary?.departments.length ?? 0;
  const totalEmployees = empSummary?.total_employees ?? 0;
  const employeeCapacity = 50;

  const stats = [
    {
      name: "Attendance Rate",
      capacity: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
      subtitle: `${totalPresent} of ${totalRecords} records`,
      fill: "var(--chart-1)",
    },
    {
      name: "Dept Coverage",
      capacity: Math.round((activeDepts / 8) * 100),
      subtitle: `${activeDepts} of 8 departments`,
      fill: "var(--chart-2)",
    },
    {
      name: "Total Employees",
      capacity: Math.min(Math.round((totalEmployees / employeeCapacity) * 100), 100),
      subtitle: `${totalEmployees} employees registered`,
      fill: "var(--chart-3)",
    },
    {
      name: "Absence Rate",
      capacity: totalRecords > 0 ? Math.round((totalAbsent / totalRecords) * 100) : 0,
      subtitle: `${totalAbsent} absent records`,
      fill: "var(--chart-4)",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.name} className="p-4">
            <CardContent className="p-0 flex items-center space-x-4">
              <div className="relative flex items-center justify-center shrink-0">
                <ChartContainer
                  config={chartConfig}
                  className="h-20 w-20"
                >
                  <RadialBarChart
                    data={[item]}
                    innerRadius={30}
                    outerRadius={60}
                    barSize={6}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                      axisLine={false}
                    />
                    <RadialBar
                      dataKey="capacity"
                      background
                      cornerRadius={10}
                      angleAxisId={0}
                    />
                  </RadialBarChart>
                </ChartContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-medium text-foreground tabular-nums">
                    {item.capacity}%
                  </span>
                </div>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground">
                  {item.name}
                </dt>
                <dd className="text-sm text-muted-foreground">
                  {item.subtitle}
                </dd>
              </div>
            </CardContent>
          </Card>
        ))}
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
                      <TableCell className="text-right font-mono tabular-nums">
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
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">
                            {item.employee_name}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {item.employee_id_display}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="success-light"
                          size="sm"
                          className="tabular-nums"
                        >
                          {item.total_present}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="destructive-light"
                          size="sm"
                          className="tabular-nums"
                        >
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
