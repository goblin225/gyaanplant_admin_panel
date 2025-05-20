import { Button } from '@/components/ui/button';
import Card from '@/components/common/Card';
import StatusBadge from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock top performers in LMS
const topUsers = [
  {
    id: 1,
    name: 'Rahul Sharma',
    initials: 'RS',
    course: 'JavaScript Basics',
    score: 95,
    rank: 1,
    status: 'Top Performer',
  },
  {
    id: 2,
    name: 'Priya Mehra',
    initials: 'PM',
    course: 'React Advanced',
    score: 92,
    rank: 2,
    status: 'Excellent',
  },
  {
    id: 3,
    name: 'Aarav Singh',
    initials: 'AS',
    course: 'Python Essentials',
    score: 89,
    rank: 3,
    status: 'Good',
  },
  {
    id: 4,
    name: 'Simran Kaur',
    initials: 'SK',
    course: 'Java Pro',
    score: 85,
    rank: 4,
    status: 'Needs Improvement',
  },
];

const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'top performer':
      return 'success';
    case 'excellent':
      return 'primary';
    case 'good':
      return 'warning';
    case 'needs improvement':
      return 'destructive';
    default:
      return 'default';
  }
};

const TopRankUsers = () => {
  return (
    <Card 
      title="Top Ranking Learners" 
      description="Leaderboard based on course scores"
      headerAction={
        <Button variant="ghost" size="sm" className="gap-1">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      }
    >
      <div className="space-y-5">
        {topUsers.map((user) => (
          <div key={user.id} className="flex gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  #{user.rank} - {user.name}
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">Course: {user.course}</p>
              <div className="flex items-center gap-2 pt-1">
                <StatusBadge status={user.status} variant={getStatusVariant(user.status)} />
                <span className="text-xs text-muted-foreground">Score: {user.score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopRankUsers;
