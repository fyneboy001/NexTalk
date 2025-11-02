"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to sign in");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/chat");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 md:px-8 py-8">
      {/* Logo Section */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image
          src="/N-logo.png" // <-- replace with your actual logo path in /public
          alt="Nextalk Logo"
          width={100}
          height={100}
          className="rounded-md"
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-[#f9f9f9] border border-gray-200 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden transition-all duration-300">
        {/* LEFT SECTION - FORM */}
        <div className="flex-1 p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900 text-center md:text-left">
            Login to Your Account
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-8 text-center md:text-left">
            Connect with thousands of users and chat seamlessly in real time.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <p className="text-center text-sm text-red-500 font-medium">
                {error}
              </p>
            )}

            {/* Email Field */}
            <div>
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>

            {/* Password Field */}
            <div>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-[#FF7A00] to-[#FFD580] hover:opacity-90 ${
                loading && "cursor-not-allowed opacity-70"
              }`}
            >
              {loading ? "Signing In..." : "Login to Your Account"}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <a
              href="#"
              className="text-sm text-[#FF7A00] hover:underline transition"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        {/* RIGHT SECTION - OAUTH OPTIONS */}
        <div className="flex-1 bg-white border-t md:border-t-0 md:border-l border-gray-200 p-8 sm:p-10 flex flex-col justify-center space-y-4 sm:space-y-5">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
            className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-100 transition"
          >
            <FcGoogle size={22} />
            <span className="font-medium text-gray-700">
              Sign in with Google
            </span>
          </button>

          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/chat" })}
            className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-100 transition"
          >
            <FaGithub size={22} className="text-gray-900" />
            <span className="font-medium text-gray-700">
              Sign in with GitHub
            </span>
          </button>

          <p className="text-center text-gray-600 text-sm pt-6">
            Don’t have an account?{" "}
            <a href="/signup" className="text-[#FF7A00] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} NexTalk. All rights reserved.
      </footer>
    </div>
  );
};

export default SignIn;
