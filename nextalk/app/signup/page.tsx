"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle manual signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setMessage("✅ Account created successfully! Logging you in...");

      const loginResult = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginResult?.error) throw new Error(loginResult.error);

      router.push("/chat");
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ OAuth
  const handleGoogleSignup = () => signIn("google", { callbackUrl: "/chat" });
  const handleGithubSignup = () => signIn("github", { callbackUrl: "/chat" });

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
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none"
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
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#FF7A00] text-white font-semibold rounded-lg hover:bg-[#e96c00] transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p
              className={`text-center text-sm mt-3 ${
                message.includes("✅") || message.includes("success")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
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
              className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
            >
              <FcGoogle size={22} />
              <span className="font-medium text-gray-700">
                Sign up with Google
              </span>
            </button>

            <button
              type="button"
              onClick={handleGithubSignup}
              className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
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
              className="text-[#FF7A00] font-semibold hover:underline"
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
