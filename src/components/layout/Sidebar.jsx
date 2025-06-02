import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, LayoutDashboard, Users, BookOpen,
  Tags, FileQuestion, Settings, Bell, Briefcase,
  Building2, ClipboardList, ListChecks,
  Trophy, University
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logo from "@/assets/gyaan_logo.png";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../../services/user";

const roleMenuMap = {
  Admin: [
    "Dashboard", "Users", "Courses", "Category", "Questions",
    "Leader Board", "Tasks", "Attendance", "College",
    "Settings", "Company", "Notifications", "Job"
  ],
  Teacher: [
    "Dashboard", "Courses", "Questions", "Tasks", "Attendance", "Settings",
  ],
  College: [
    "Dashboard", "Users", "Courses", "Leader Board", "Settings"
  ],
  Company: [
    "Dashboard", "Users", "Job", "Settings", "Job Application"
  ]
};

const NavItem = ({ to, icon: Icon, label, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <NavLink to={to} className="w-full">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </Button>
        </NavLink>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="bg-background shadow-md border border-border/60">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const NavGroup = ({ title, children, isCollapsed }) => (
  <div className="space-y-1">
    {!isCollapsed && (
      <div className="px-3 py-2">
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

const Sidebar = ({ className, userId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: userById } = useQuery({
    queryKey: ["userById", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId
  });

  const role = userById?.data?.roleId?.name;
  const routePrefix =
    role === "Admin" ? "/admin" :
      role === "Teacher" ? "/teacher" :
        role === "Company" ? "/company" :
          "/college";


  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen overflow-y-auto border-r border-border/60 bg-white backdrop-blur-sm transition-all duration-300 ease-apple",
        isCollapsed ? "w-16" : "w-60",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-3 border-b border-border/60">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
          <div className="flex h-7 w-7 items-center justify-center rounded-md">
            <img src={logo} alt="Logo" className="h-8 w-10 object-cover" />
          </div>
          {!isCollapsed && <span className="font-semibold">Gyaan Plant</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "text-muted-foreground hover:text-foreground transition-all",
            isCollapsed ? "absolute -right-5 top-4 z-50 flex bg-background border rounded-full shadow-md" : ""
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className={cn("flex flex-col gap-4 overflow-y-auto py-4", isCollapsed && "items-center", "h-[calc(100vh-4rem)]")}>
        {role && (
          <>
            <NavGroup title="Overview" isCollapsed={isCollapsed}>
              {roleMenuMap[role]?.includes("Dashboard") && (
                <NavItem to={`${routePrefix}`} icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} />
              )}
            </NavGroup>

            <NavGroup title="Management" isCollapsed={isCollapsed}>
              {roleMenuMap[role]?.includes("Users") && (
                <NavItem to={`${routePrefix}/users`} icon={Users} label="Users" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Courses") && (
                <NavItem to={`${routePrefix}/course`} icon={BookOpen} label="Courses" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Category") && (
                <NavItem to={`${routePrefix}/category`} icon={Tags} label="Category" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Questions") && (
                <NavItem to={`${routePrefix}/questions`} icon={FileQuestion} label="Questions" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Leader Board") && (
                <NavItem to={`${routePrefix}/leaderboard`} icon={Trophy} label="Leader Board" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Tasks") && (
                <NavItem to={`${routePrefix}/task`} icon={ClipboardList} label="Tasks" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Attendance") && (
                <NavItem to={`${routePrefix}/attendance`} icon={ListChecks} label="Attendance" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("College") && (
                <NavItem to={`${routePrefix}/college`} icon={University} label="College" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Job") && (
                <NavItem to={`${routePrefix}/job`} icon={Briefcase} label="Job" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Job Application") && (
                <NavItem to={`${routePrefix}/jobapplication`} icon={ClipboardList} label="Job Application" isCollapsed={isCollapsed} />
              )}
            </NavGroup>

            {!isCollapsed && <Separator className="my-2" />}

            <NavGroup title="System" isCollapsed={isCollapsed}>
              {roleMenuMap[role]?.includes("Settings") && (
                <NavItem to={`${routePrefix}/settings`} icon={Settings} label="Settings" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Company") && (
                <NavItem to={`${routePrefix}/company`} icon={Building2} label="Company" isCollapsed={isCollapsed} />
              )}
              {roleMenuMap[role]?.includes("Notifications") && (
                <NavItem to={`${routePrefix}/notifications`} icon={Bell} label="Notifications" isCollapsed={isCollapsed} />
              )}
            </NavGroup>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;