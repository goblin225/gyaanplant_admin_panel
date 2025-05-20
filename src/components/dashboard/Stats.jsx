import { 
  ArrowUp, 
  ArrowDown, 
  Users, 
  Calendar, 
  TrendingUp, 
  ShoppingCart,
  Book,
  User2,
} from "lucide-react";
import Card from "@/components/common/Card";
import { cn } from "@/lib/utils";

const StatsCard = ({ title, value, change, icon, className, iconBg }) => {
  const isPositive = change >= 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>

          {/* <div className="flex items-center gap-1 mt-2">
            <div
              className={cn(
                "flex items-center text-xs font-medium rounded-full px-1.5 py-0.5",
                isPositive
                  ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
                  : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
              )}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              )}
              {Math.abs(change)}%
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div> */}
        </div>

        <div className={cn("p-3 rounded-full", iconBg)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const Stats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <StatsCard
        title="Total Users"
        value="500"
        change={12.5}
        icon={<User2 className="h-5 w-5 text-green-500" />}
        iconBg="bg-green-100"
      />
      <StatsCard
        title="Active Users"
        value="100"
        change={8.2}
        icon={<Users className="h-5 w-5 text-blue-500" />}
        iconBg="bg-blue-100"
      />
      <StatsCard
        title="Total Revenue"
        value="₹87,325"
        change={5.6}
        icon={<TrendingUp className="h-5 w-5 text-yellow-500" />}
        iconBg="bg-yellow-100"
      />
      <StatsCard
        title="Total Courses"
        value="64"
        change={-3.8}
        icon={<Book className="h-5 w-5 text-purple-500" />}
        iconBg="bg-purple-100"
      />
    </div>
  );
};

export default Stats;