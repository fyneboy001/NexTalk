"use client";

import Image from "next/image";
import Button from "@/components/button";
import { FaVideo, FaClock } from "react-icons/fa";
import { MdWifiLock } from "react-icons/md";
import React from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Home(): React.ReactElement {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
    </div>
  );
}

const Hero: React.FC = () => {
  const router = useRouter();
  return (
    <div className="lg:flex px-12 justify-center items-center space-x-20 py-16">
      <div>
        <h3 className="text-3xl font-bold leading-snug">
          Start chatting with <br /> family and friends, <br /> anytime,
          anywhere <br /> with NexTalk
        </h3>
        <p className="text-gray-500 pt-6">
          Great software that allows you to chat from any <br /> place at any
          time without any interruption.
        </p>

        <Button
          onClick={() => router.push("/signup")}
          text="Get Started"
          className="bg-gradient-to-r from-orange-500 to-orange-300 text-white hover:opacity-90 mt-10"
        />
      </div>

      <div>
        <Image
          src="/chat-image.png"
          alt="Chat Illustration"
          width={400}
          height={400}
          priority
        />
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-8">
        Features for a Better Experience
      </h2>

      <div className="flex lg:justify-center space-x-7 flex-col lg:flex-row items-center">
        <FeatureCard
          icon={<FaVideo className="text-pink-200 text-3xl mb-4" />}
          subtitle="Video Messaging"
          para={`This software is very easy for you to \n manage. You can use it as you wish.`}
        />
        <FeatureCard
          icon={<FaClock className="text-green-600 text-3xl mb-4" />}
          subtitle="Save your time"
          para={`This software is very easy for you to \n manage. You can use it as you wish.`}
        />
        <FeatureCard
          icon={<MdWifiLock className="text-orange-500 text-3xl mb-4" />}
          subtitle="Keep safe & private"
          para={`This software is very easy for you to \n manage. You can use it as you wish.`}
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  subtitle: string;
  para: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, subtitle, para }) => {
  return (
    <div className="flex lg:w-[32%] shadow-2xl py-10 lg:px-2 w-full justify-center space-x-4">
      <div className="">{icon}</div>
      <div>
        <h3 className="font-bold text-xl mb-3">{subtitle}</h3>
        <p className=" whitespace-pre-line">{para}</p>
      </div>
    </div>
  );
};
