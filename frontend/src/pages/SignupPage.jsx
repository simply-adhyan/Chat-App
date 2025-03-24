import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { MessageSquare, User, Mail, EyeOff, Eye, Loader2, Lock } from 'lucide-react';
import { Link } from "react-router-dom";
import AuthImagePattern from '../Components/AuthImagePattern';
import toast from 'react-hot-toast';

// Get API base from env variables or fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/auth';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { signup, isSigningUp } = useAuthStore();

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

  // Send OTP to backend using the correct API base URL
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateData()) return;
    try {
      const response = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (response.ok) {
        toast.success("OTP sent to your email!");
        setIsOtpSent(true);
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Error sending OTP. Please try again.");
    }
  };

  // Handle OTP input changes
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    // Automatically focus the next input if available
    if (element.value !== "" && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Verify OTP and complete signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    try {
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: enteredOtp })
      });
      if (response.ok) {
        toast.success("OTP verified successfully!");
        // Proceed with signup after OTP verification
        signupUser();
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Error verifying OTP. Please try again.");
    }
  };

  // Calls the signup function from the auth store
  const signupUser = async () => {
    signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Signup form or OTP verification */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get Started with your free account</p>
            </div>
          </div>

          {/* Render signup form if OTP is not sent, else render OTP verification */}
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="John Doe"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
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
                    <Mail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    placeholder="your@example.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={!showPassword ? 'password' : 'text'}
                    className="input input-bordered w-full pl-10"
                    placeholder="●●●●●●●●●"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full hover:translate-y-2" disabled={isSigningUp}>
                {isSigningUp ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Loading..
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
            // OTP Verification Form
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
                    className="input input-bordered w-12 text-center"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>
              <button type="submit" className="btn btn-primary w-full hover:translate-y-2">
                Verify OTP &amp; Signup
              </button>
            </form>
          )}
        </div>
      </div>
      {/* Right Side: Decorative Pattern/Image */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignupPage;
