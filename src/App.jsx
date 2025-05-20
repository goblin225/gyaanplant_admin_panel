import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from './context/AuthProvider'

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          <AppRoutes />
        </AnimatePresence>
      </TooltipProvider>
    </AuthProvider >
  </QueryClientProvider>
);

export default App;