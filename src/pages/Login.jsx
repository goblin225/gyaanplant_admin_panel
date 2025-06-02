import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailIcon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { useLoginStore } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const EmailPasswordLogin = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { mutate: userLogin, isLoading } = useLoginStore();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      return toast.error("Enter a valid email");
    }

    userLogin(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Login successful. Redirecting...");
          navigate("/");
        },
        onError: (err) => {
          toast.error(`Login failed: ${err.response?.data?.message || "An error occurred"}`);
        },
      }
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-white">
      <div className="flex flex-col justify-center items-center px-6 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-black mb-2">Welcome back!</h2>
          <p className="text-muted-foreground mb-6">
            Login using your email and password.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </motion.div>
      </div>

      <div className="hidden md:flex w-full h-screen">
        <div className="relative w-full h-full">
          <img
            src="https://img.freepik.com/free-vector/hand-drawn-essay-illustration_23-2150316932.jpg"
            alt="Illustration"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailPasswordLogin;