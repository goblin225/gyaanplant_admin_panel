import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageTransition from "./PageTransition";
import { cn } from "@/lib/utils";
import { useAuth } from '../../context/AuthProvider';

const Layout = ({ children }) => {

  const { user } = useAuth();
  const userId = user?._id;
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(false);

  console.log("userById", userId);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar userId={userId} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={cn("flex flex-col flex-1 overflow-hidden", isCollapsed ? "ml-16" : "ml-60")}>
        <Header title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6 mt-14">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children || <Outlet />}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function getPageTitle(pathname) {
  switch (pathname) {
    case "/":
    case "/admin":
    case "/teacher":
      return "Dashboard";
    case "/role":
      return "Role Management";
    case "/users":
    case "/admin/users":
    case "/teacher/users":
      return "User Management";
    case "/course":
    case "/admin/course":
    case "/teacher/course":
      return "Course Management";
    case "/category":
      return "Category";
    case "/questions":
      return "Assessment Management";
    default:
      return "Dashboard";
  }
}

export default Layout;