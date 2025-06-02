import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/common/DataTable';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Make sure you have Input component
import { getAllAttendance } from '../services/attendance';
import { getAllUsers } from '../services/user';

const Attendance = () => {
  const { toast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedUser, setSelectedUser] = useState('all');

  // New Date Range states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch attendance data
  const { data: attendanceResponse, isLoading } = useQuery({
    queryKey: ['attendance', { selectedMonth, selectedYear, selectedUser, fromDate, toDate }],
    queryFn: () =>
      getAllAttendance({
        month: selectedMonth,
        year: selectedYear,
        userId: selectedUser === 'all' ? undefined : selectedUser,
        fromDate,
        toDate,
      }),
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['attendance-users'],
    queryFn: getAllUsers,
  });

  const attendances = useMemo(() => attendanceResponse?.data || [], [attendanceResponse]);
  const users = useMemo(() => usersResponse?.data || [], [usersResponse]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    }));
  }, []);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());
  }, []);

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => <span className="text-sm">{row?.userId?.name || 'N/A'}</span>,
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (row) => <span className="text-sm">{row?.userId?.email || 'N/A'}</span>,
    },
    {
      header: 'Date',
      accessor: 'markedAt',
      cell: (row) => {
        const date = parseISO(row?.markedAt);
        const formattedDate = format(date, 'dd/MM/yyyy hh:mm a');
        return <span className="text-sm">{formattedDate}</span>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const status = row?.status?.toLowerCase();
        const colorClass =
          status === 'present'
            ? 'text-green-600 bg-green-100'
            : status === 'absent'
            ? 'text-red-600 bg-red-100'
            : 'text-gray-600 bg-gray-100';
        return (
          <span className={`text-sm p-2 rounded-md font-medium ${colorClass}`}>
            {row?.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
      </div>

      <Card className="p-4 space-y-4">
  <div className="flex flex-col lg:flex-row flex-wrap gap-4">
    <div className="space-y-2 w-full lg:w-[18%]">
      <Label htmlFor="month">Month</Label>
      <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val)}>
        <SelectTrigger>
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2 w-full lg:w-[18%]">
      <Label htmlFor="year">Year</Label>
      <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val)}>
        <SelectTrigger>
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2 w-full lg:w-[18%]">
      <Label htmlFor="user">User</Label>
      <Select value={selectedUser} onValueChange={setSelectedUser}>
        <SelectTrigger>
          <SelectValue placeholder="All Users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {users.map((user) => (
            <SelectItem key={user._id} value={user._id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2 w-full lg:w-[18%]">
      <Label htmlFor="fromDate">From Date</Label>
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        max={toDate}
      />
    </div>

    <div className="space-y-2 w-full lg:w-[18%]">
      <Label htmlFor="toDate">To Date</Label>
      <Input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        min={fromDate}
      />
    </div>
  </div>

  <DataTable
    data={attendances}
    columns={columns}
    searchable={true}
    searchField="title"
    isLoading={isLoading}
  />
</Card>

    </div>
  );
};

export default Attendance;