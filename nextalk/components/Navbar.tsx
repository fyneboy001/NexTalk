"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "./button";

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="w-full shadow-sm bg-white fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-10 py-4">
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Image
            src="/N-logo.png"
            alt="NexTalk Logo"
            width={160}
            height={80}
            priority
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-8">
          <NavLink text="Home" onClick={() => router.push("/")} />
          <NavLink text="About" onClick={() => router.push("/about")} />
          <NavLink text="FAQ" onClick={() => router.push("/faq")} />
          <NavLink text="Contact" onClick={() => router.push("/contact")} />

          <div className="flex space-x-4">
            <Button
              onClick={() => router.push("/signin")}
              text="Sign In"
              className="bg-gradient-to-r from-orange-500 to-orange-300 text-white hover:opacity-90"
            />
            <Button
              onClick={() => router.push("/signup")}
              text="Sign Up"
              className="border-2 border-orange-300 text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-300 hover:text-white"
            />
          </div>
        </div>

        {/* Hamburger Icon (Mobile) */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-3xl text-gray-800 focus:outline-none"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white shadow-md border-t border-gray-100 animate-slideDown">
          <div className="flex flex-col items-center space-y-6 py-6">
            <NavLink text="Home" onClick={() => router.push("/")} />
            <NavLink text="About" onClick={() => router.push("/about")} />
            <NavLink text="FAQ" onClick={() => router.push("/faq")} />
            <NavLink text="Contact" onClick={() => router.push("/contact")} />

            <div className="flex flex-col space-y-3 w-4/5">
              <Button
                onClick={() => router.push("/signin")}
                text="Sign In"
                className="bg-gradient-to-r from-orange-500 to-orange-300 text-white hover:opacity-90 w-full"
              />
              <Button
                onClick={() => router.push("/signup")}
                text="Sign Up"
                className="border-2 border-orange-300 text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-300 hover:text-white w-full"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="text-gray-700 hover:text-orange-500 transition font-medium"
  >
    {text}
  </button>
);

export default Navbar;
