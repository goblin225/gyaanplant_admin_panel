import { useMemo } from 'react';
import Stats from "@/components/dashboard/Stats";
import TopRankUsers from "@/components/dashboard/TopRankUsers";
import Card from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import StatusBadge from '@/components/common/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, RefreshCw, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getAllAttendance } from "../services/attendance";
import { format } from 'date-fns';

const topCourses = [
  {
    id: 1,
    name: 'JavaScript Basics',
    code: 'JS101',
    enrolled: 240,
    revenue: '₹48,000',
    status: 'Trending',
  },
  {
    id: 2,
    name: 'React Masterclass',
    code: 'REACT201',
    enrolled: 180,
    revenue: '₹36,000',
    status: 'Popular',
  },
  {
    id: 3,
    name: 'Python for Beginners',
    code: 'PY001',
    enrolled: 150,
    revenue: '₹30,000',
    status: 'Stable',
  },
  {
    id: 4,
    name: 'Node.js Bootcamp',
    code: 'NODE321',
    enrolled: 90,
    revenue: '₹18,000',
    status: 'New',
  },
];

const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'trending':
      return 'success';
    case 'popular':
      return 'primary';
    case 'stable':
      return 'warning';
    case 'new':
      return 'default';
    default:
      return 'default';
  }
};

// Mock data for charts
// const salesData = [
//   { name: "Jan", total: 4000 },
//   { name: "Feb", total: 3000 },
//   { name: "Mar", total: 5000 },
//   { name: "Apr", total: 4500 },
//   { name: "May", total: 6000 },
//   { name: "Jun", total: 5500 },
//   { name: "Jul", total: 7000 },
// ];

const Dashboard = () => {

  const { data: attendanceResponse } = useQuery({
    queryKey: ['attendance'],
    queryFn: getAllAttendance,
  });

  const attendances = useMemo(() => attendanceResponse?.data || [], [attendanceResponse]);

  const attendanceData = useMemo(() => {
    if (!attendances.length) return [];

    const grouped = attendances?.reduce((acc, curr) => {
      const dateKey = format(new Date(curr.date), 'MMM dd');
      if (!acc[dateKey]) acc[dateKey] = 0;
      acc[dateKey]++;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({
      name: date,
      total: count,
    }));
  }, [attendances]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
      </div>

      <Stats />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
           title="Attendance Overview"
          description="Number of users marked present each day"
          className="lg:col-span-2 xl:col-span-1"
        >
          <Tabs defaultValue="bar">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="line">Line Chart</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
            </div>

            <TabsContent value="bar" className="mt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceData}
                    margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      interval="preserveStartEnd"
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value} users`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} users`, "Attendance"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="line" className="mt-0">
              <div className="h-80 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      interval="preserveStartEnd"
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value} users`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} users`, "Attendance"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <TopRankUsers />

        <Card
          title="Top Purchased Courses"
          description="Courses with highest enrollments and engagement"
          headerAction={
            <Button variant="ghost" size="sm" className="gap-1">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          }
        >
          <div className="space-y-5">
            {topCourses.map((course) => (
              <div key={course.id} className="flex gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {course.code[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {course.name} ({course.code})
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Course</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground">Enrolled: {course.enrolled} students</p>
                  <div className="flex items-center gap-2 pt-1">
                    <StatusBadge status={course.status} variant={getStatusVariant(course.status)} />
                    <span className="text-xs text-muted-foreground">Revenue: {course.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;