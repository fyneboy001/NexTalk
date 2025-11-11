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
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
    </div>
  );
}

const Hero: React.FC = () => {
  const router = useRouter();
  return (
    <section className="flex flex-col-reverse lg:flex-row items-center mt-20 justify-between px-6 sm:px-10 lg:px-20 py-16 lg:py-24 gap-10 lg:gap-20 max-w-7xl mx-auto">
      {/* Text Section */}
      <div className="text-center lg:text-left max-w-lg">
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug">
          Start chatting with <br className="hidden sm:block" /> family and
          friends, <br /> anytime, anywhere <br /> with{" "}
          <span className="text-orange-500">NexTalk</span>
        </h3>

        <p className="text-gray-600 pt-6 text-base sm:text-lg leading-relaxed">
          Great software that allows you to chat from any place{" "}
          <br className="hidden sm:block" /> at any time without any
          interruption.
        </p>

        <div className="mt-10 flex justify-center lg:justify-start">
          <Button
            onClick={() => router.push("/signup")}
            text="Get Started"
            className="bg-gradient-to-r from-orange-500 to-orange-300 text-white hover:opacity-90 px-8 py-3 rounded-lg shadow-md text-lg"
          />
        </div>
      </div>

      {/* Image Section */}
      <div className="flex justify-center lg:justify-end">
        <Image
          src="/chat-image.png"
          alt="Chat Illustration"
          width={400}
          height={400}
          priority
          className="w-72 sm:w-96 lg:w-[400px] h-auto object-contain"
        />
      </div>
    </section>
  );
};

const Features: React.FC = () => {
  return (
    <section className="py-20 px-6 sm:px-10 lg:px-20 bg-gradient-to-b from-[#faf9ff] to-[#f6f3ff]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-gray-800">
          Features for a Better Experience
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FaVideo className="text-pink-400 text-4xl mb-4" />}
            subtitle="Video Messaging"
            para={`This software is very easy for you to \n manage. You can use it as you wish.`}
          />
          <FeatureCard
            icon={<FaClock className="text-green-600 text-4xl mb-4" />}
            subtitle="Save your time"
            para={`This software is very easy for you to \n manage. You can use it as you wish.`}
          />
          <FeatureCard
            icon={<MdWifiLock className="text-orange-500 text-4xl mb-4" />}
            subtitle="Keep safe & private"
            para={`This software is very easy for you to \n manage. You can use it as you wish.`}
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  subtitle: string;
  para: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, subtitle, para }) => {
  return (
    <div className="flex items-start bg-white shadow-lg hover:shadow-xl rounded-2xl p-6 sm:p-8 transition-all duration-300 border border-gray-100 text-left max-w-sm sm:max-w-none mx-auto">
      <div className="flex-shrink-0 mr-4">{icon}</div>
      <div>
        <h3 className="font-semibold text-xl mb-2 text-gray-800">{subtitle}</h3>
        <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base leading-relaxed">
          {para}
        </p>
      </div>
    </div>
  );
};
