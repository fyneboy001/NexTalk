"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import UserLayout from "@/components/User";
import type { Message } from "../types/chat";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type BackendMessage = {
  _id: string;
  content: string;
  senderId: string;
  chatId: string;
  createdAt: string;
};

let socket: Socket | null = null;

export default function ChatPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/signin";
    },
  });

  const [contacts, setContacts] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  // Set current user from session
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const normalizedUser: User = {
      id: session.user.id,
      name: session.user.name || null,
      email: session.user.email || null,
      image: session.user.image || null,
    };
    setCurrentUser(normalizedUser);
    console.log("✅ Current user set from session:", normalizedUser);
  }, [session, status]);

  // Initialize socket
  useEffect(() => {
    if (!currentUser || socket) return;

    const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
    socket = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket:", newSocket.id);
      newSocket.emit("join", { userId: currentUser.id });
    });

    newSocket.on("newMessage", (msg: Message) => {
      console.log("📨 New message received:", msg);
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
    });

    return () => {
      console.log("🔌 Disconnecting socket");
      newSocket.disconnect();
      socket = null;
    };
  }, [currentUser, SOCKET_URL]);

  // Fetch contacts
  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
      try {
        console.log("📋 Fetching contacts...");
        const res = await fetch(`${API_BASE}/api/users`);

        if (!res.ok) {
          throw new Error(`Failed to fetch contacts: ${res.statusText}`);
        }

        const users: User[] = await res.json();
        const filteredContacts = users.filter((u) => u.id !== currentUser.id);
        setContacts(filteredContacts);
        console.log("✅ Contacts loaded:", filteredContacts.length);
      } catch (err) {
        console.error("❌ Error fetching contacts:", err);
      }
    };

    fetchContacts();
  }, [currentUser, API_BASE]);

  // Fetch chat messages
  useEffect(() => {
    const fetchConversation = async () => {
      if (!activeChat || !currentUser) return;

      try {
        console.log(`💬 Fetching conversation with ${activeChat.name}...`);
        const res = await fetch(
          `${API_BASE}/api/messages?userAId=${currentUser.id}&userBId=${activeChat.id}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.statusText}`);
        }

        const data: BackendMessage[] = await res.json();
        const mapped: Message[] = data.map((m) => ({
          id: m._id,
          content: m.content,
          senderId: m.senderId,
          receiverId:
            m.senderId === currentUser.id ? activeChat.id : currentUser.id,
          chatId: m.chatId,
          createdAt: m.createdAt,
        }));
        setMessages(mapped);
        console.log("✅ Messages loaded:", mapped.length);
      } catch (err) {
        console.error("❌ Error fetching conversation:", err);
      }
    };

    fetchConversation();
  }, [activeChat, currentUser, API_BASE]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || !activeChat) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: activeChat.id,
      content: inputMessage.trim(),
    };

    try {
      setSending(true);
      console.log("📤 Sending message:", messageData);

      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.statusText}`);
      }

      const saved = await res.json();
      console.log("✅ Message saved:", saved);

      // Emit to socket
      socket?.emit("chat message", saved);

      // Add to local state immediately for better UX
      const newMessage: Message = {
        id: saved._id || saved.id,
        content: saved.content,
        senderId: saved.senderId,
        receiverId: saved.receiverId || activeChat.id,
        chatId: saved.chatId,
        createdAt: saved.createdAt || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");
    } catch (err) {
      console.error("❌ Send message error:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Loading states
  if (status === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F8F6FF] to-[#F3E8FF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7E22CE] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F8F6FF] to-[#F3E8FF]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            You need to sign in to access chat.
          </p>
          <button
            onClick={() => (window.location.href = "/signin")}
            className="px-6 py-2 bg-[#7E22CE] text-white rounded-lg hover:bg-[#6D28D9] transition"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F8F6FF] to-[#F3E8FF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7E22CE] mx-auto mb-4"></div>
          <p className="text-gray-600">Fetching your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <UserLayout
      contacts={contacts}
      messages={messages}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      handleSendMessage={handleSendMessage}
      sending={sending}
      currentUser={currentUser}
    />
  );
}
