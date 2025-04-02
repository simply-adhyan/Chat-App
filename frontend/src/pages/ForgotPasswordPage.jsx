import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import AuthImagePattern from "../Components/AuthImagePattern";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/forgotPassword", { email });
      toast.success(response.data.message || "Password reset email sent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-base-content/60">Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
              Remembered your password?{" "}
              <Link to="/login" className="link link-primary">
                Sign in.
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Right Side - Pattern/Image */}
      <AuthImagePattern
        title="Reset Your Password"
        subtitle="Enter your email to receive a link to reset your password."
      />
    </div>
  );
};

export default ForgotPasswordPage;
