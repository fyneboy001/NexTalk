"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import UserLayout from "@/components/User";

let socket: Socket | null = null;

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeChat, setActiveChat] = useState<any>(null);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Connect to Socket.io
  useEffect(() => {
    if (!socket) {
      socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
        {
          transports: ["websocket"],
        }
      );
    }

    socket.on("connect", () =>
      console.log("✅ Connected to socket:", socket?.id)
    );
    socket.on("chat message", (data) => setMessages((prev) => [...prev, data]));
    socket.on("disconnect", () => console.log("❌ Disconnected from socket"));

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await fetch("http://localhost:5000/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        if (session?.user?.email) {
          const others = data.filter(
            (u: any) => u.email !== session.user.email
          );
          setContacts(others);
        } else {
          setContacts(data);
        }
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      } finally {
        setLoadingContacts(false);
      }
    };

    if (status === "authenticated") fetchContacts();
  }, [session, status]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !session?.user || !activeChat) return;

    const messageData = {
      sender: session.user.name ?? "Unknown",
      receiver: activeChat.email,
      text: inputMessage,
      timestamp: new Date(),
    };

    socket?.emit("chat message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setInputMessage("");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading your chat...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600">You need to sign in to view this page.</p>
      </div>
    );
  }

  if (loadingContacts) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Fetching contacts...</p>
      </div>
    );
  }

  return (
    <UserLayout
      session={session}
      contacts={contacts}
      messages={messages}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      handleSendMessage={handleSendMessage}
    />
  );
}
