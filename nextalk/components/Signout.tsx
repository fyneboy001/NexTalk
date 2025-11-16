"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

const Signout = () => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/signin" });
  };
  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-purple-900 bg-white px-2 py-1 rounded-md font-bold"
    >
      {loading ? "Signing Out...." : "SignOut"}
    </button>
  );
};

export default Signout;
