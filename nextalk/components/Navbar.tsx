import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "./button";

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between px-18 py-6">
      <div className="flex items-center space-x-2">
        <Image
          className=""
          src="/N-logo.png"
          alt="NexTalk Logo"
          width={200}
          height={100}
          priority
        />
      </div>
      <div className="flex space-x-4">
        <Button
          onClick={() => router.push("/signin")}
          text="Sign In"
          className="bg-gradient-to-r from-orange-500 to-orange-300 text-white hover:opacity-90"
        />
        <Button
          onClick={() => router.push("/signup")}
          text="Sign Up"
          className="bg-none border-2 border-orange-300 text-black hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-300 hover:text-white"
        />
      </div>
    </nav>
  );
};

export default Navbar;
