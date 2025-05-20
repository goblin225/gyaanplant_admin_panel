import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneIcon, ShieldCheckIcon, SendHorizonalIcon } from "lucide-react";
import { toast } from "sonner";
import { useLoginStore } from "../hooks/useAuth";
import { sendOTP } from "../services/auth";
import { useNavigate } from "react-router-dom";

const OtpLogin = () => {

  const [step, setStep] = useState("mobile");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();
  const { mutate: userVerifyOTP, isLoading } = useLoginStore();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      return toast.error("Enter a valid phone number");
    }

    try {
      setSending(true);
      console.log("Sending OTP to:", phoneNumber);
      await sendOTP({ phoneNumber });
      toast.success("OTP sent to your phone");
      setStep("otp");
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      return toast.error("Enter a valid OTP");
    }

    userVerifyOTP(
      { phoneNumber, otp },
      {
        onSuccess: () => {
          toast.success("OTP verified. Redirecting...");
          navigate("/");
        },
        onError: () => {
          toast.error("Invalid OTP");
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
            Login using your mobile number with OTP.
          </p>

          {step === "mobile" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-black text-white"
                disabled={sending}
              >
                <SendHorizonalIcon className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="relative">
                  <ShieldCheckIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center text-sm mt-2">
                Didn’t receive?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-blue-600"
                  onClick={() => {
                    setOtp("");
                    handleSendOtp(new Event("submit"));
                  }}
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}
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

export default OtpLogin;