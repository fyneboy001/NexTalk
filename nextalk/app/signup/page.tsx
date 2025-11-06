"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error) return String(error.message);
    if ("error" in error) return String(error.error);
  }
  return "Something went wrong. Please try again.";
}

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // ✅ ADDED: Password confirmation
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error"); // ✅ ADDED: Message type

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear message when user starts typing
    if (message) setMessage("");
  };

  // ✅ Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage("Please enter your full name");
      setMessageType("error");
      return false;
    }

    if (!formData.email.trim()) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return false;
    }

    if (!formData.password) {
      setMessage("Please enter a password");
      setMessageType("error");
      return false;
    }

    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setMessageType("error");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return false;
    }

    return true;
  };

  // ✅ Handle manual signup with auto-login and redirect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Register the user
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Signup failed");
      }

      console.log("✅ Registration successful:", data);
      setMessage("Account created successfully! Logging you in...");
      setMessageType("success");

      // Step 2: Automatically sign in the user
      const loginResult = await signIn("credentials", {
        redirect: false, // Don't auto-redirect, we'll handle it
        email: formData.email,
        password: formData.password,
      });

      if (loginResult?.error) {
        console.error("❌ Auto-login error:", loginResult.error);
        throw new Error(
          "Account created but login failed. Please sign in manually."
        );
      }

      if (loginResult?.ok) {
        console.log("✅ Auto-login successful");
        setMessage("Success! Redirecting to chat...");
        setMessageType("success");

        // Step 3: Redirect to chat page
        setTimeout(() => {
          router.push("/chat");
        }, 500); // Small delay to show success message
      }
    } catch (error: unknown) {
      console.error("❌ Signup error:", error);
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ OAuth handlers with chat redirect
  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/chat" });
  };

  const handleGithubSignup = () => {
    signIn("github", { callbackUrl: "/chat" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SECTION - FORM */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-10">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex justify-center md:justify-start mb-6">
            <Image
              src="/N-logo.png"
              alt="Nextalk Logo"
              width={120}
              height={60}
              className="mx-auto md:mx-0"
            />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">
            Create an Account
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center md:text-left">
            Join NexTalk and start connecting!
          </p>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* ✅ ADDED: Confirm Password Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#FF7A00] text-white font-semibold rounded-lg hover:bg-[#e96c00] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* ✅ IMPROVED: Message with better styling */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm text-center ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center justify-center space-x-2 my-5">
            <div className="w-1/4 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or sign up with</span>
            <div className="w-1/4 h-px bg-gray-300"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle size={22} />
              <span className="font-medium text-gray-700">
                Sign up with Google
              </span>
            </button>

            <button
              type="button"
              onClick={handleGithubSignup}
              disabled={loading}
              className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGithub size={22} className="text-gray-800" />
              <span className="font-medium text-gray-700">
                Sign up with GitHub
              </span>
            </button>
          </div>

          {/* Redirect */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/signin")}
              disabled={loading}
              className="text-[#FF7A00] font-semibold hover:underline disabled:opacity-50"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION - IMAGE */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10 flex items-center justify-center p-6">
          <Image
            src="/image.png"
            alt="Nextalk illustration"
            width={450}
            height={450}
            className="object-contain rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
