import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { MessageSquare, User, Mail, EyeOff, Eye, Loader2, Lock } from 'lucide-react';
import { Link } from "react-router-dom";
import AuthImagePattern from '../Components/AuthImagePattern';
import toast from 'react-hot-toast';
import { axiosInstance } from "../lib/axios";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState(null);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0); 
  const [isLoadingNextScreen, setIsLoadingNextScreen] = useState(false); 
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { signup } = useAuthStore();

  // Refs for OTP inputs to handle auto-focus
  const otpRefs = useRef([]);

  // Countdown timer for the resend OTP cooldown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Validate form data
  const validateData = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // Send OTP to provided email using axiosInstance
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateData()) return;
    setLoadingSendOtp(true);
    try {
      const { data } = await axiosInstance.post("/auth/send-otp", {
        email: formData.email
      });
      toast.success("OTP sent to your email!");
      setIsOtpSent(true);
      setOtpToken(data.otpToken);
      setResendTimer(60);
      // Reset OTP fields and focus on the first input
      setOtp(new Array(6).fill(''));
      otpRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoadingSendOtp(false);
    }
  };

  // Resend OTP if timer has expired
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    // Create a dummy event to mimic form submission
    await handleSendOtp({ preventDefault: () => {} });
  };

  // Handle changes in OTP input fields
  const handleOtpChange = (element, index) => {
    const value = element.value;
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
    // If the user clears the input, move focus to previous input if available
    if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify the OTP entered by the user using axiosInstance
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    if (!otpToken) {
      return toast.error("OTP token is missing. Please request a new OTP.");
    }
    setLoadingVerifyOtp(true);
    try {
      const { data } = await axiosInstance.post("/auth/verify-otp", {
        email: formData.email,
        otp: enteredOtp,
        otpToken
      });
      toast.success("OTP verified successfully!");
      setIsLoadingNextScreen(true);
      // After a short delay, call the signup function with OTP details
      setTimeout(() => {
        signup({
          ...formData,
          otp: enteredOtp,       // include the 6-digit OTP
          otpToken: otpToken,    // include the otpToken
        });
      }, 2500);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  if (isLoadingNextScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium">Preparing your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Signup form / OTP verification */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get Started with your free account</p>
            </div>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="John Doe"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    placeholder="your@example.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full pl-10"
                    placeholder="●●●●●●●●●"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-base-content/40" />
                    ) : (
                      <Eye className="w-5 h-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full hover:translate-y-2" disabled={loadingSendOtp}>
                {loadingSendOtp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
              <div className="text-center">
                <p className="text-base-content/60">
                  Already have an account?{" "}
                  <Link to="/login" className="link link-primary">
                    Sign in.
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Enter OTP</h2>
                <p className="text-base-content/60">
                  A 6‑digit OTP has been sent to {formData.email}
                </p>
              </div>
              <div className="flex justify-center space-x-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    className="input input-bordered w-12 h-12 text-center transition duration-200 ease-in-out"
                    maxLength={1}
                    value={data}
                    ref={el => otpRefs.current[index] = el}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center">
                <button type="submit" className="btn btn-primary mt-4 hover:translate-y-2" disabled={loadingVerifyOtp}>
                  {loadingVerifyOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Verifying OTP...
                    </>
                  ) : (
                    "Verify OTP & Signup"
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary mt-4 ml-4"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignupPage;
