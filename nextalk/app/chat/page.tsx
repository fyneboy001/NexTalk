"use client";

import React, { useEffect, useState, useRef } from "react";
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
  id?: string;
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
  const [loadingMessages, setLoadingMessages] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  // Use ref to track if we've already added a message
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Debug logging for session and current user
  useEffect(() => {
    console.log("=== USER STATE DEBUG ===");
    console.log("Status:", status);
    console.log("Session exists:", !!session);
    console.log("Session user:", session?.user);
    console.log("Current user state:", currentUser);
    console.log("=======================");
  }, [session, currentUser, status]);

  // Set current user from session
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      console.log("Waiting for authentication...", {
        status,
        hasUser: !!session?.user,
      });
      return;
    }

    const normalizedUser: User = {
      id: session.user.id,
      name: session.user.name || null,
      email: session.user.email || null,
      image: session.user.image || null,
    };

    console.log("👤 Setting current user from session:", {
      id: normalizedUser.id,
      name: normalizedUser.name,
      email: normalizedUser.email,
      hasImage: !!normalizedUser.image,
    });

    // Always update to ensure we have latest session data
    setCurrentUser(normalizedUser);
  }, [session?.user, status]);

  // Initialize socket - ONLY ONCE when currentUser is available
  useEffect(() => {
    if (!currentUser) return;
    if (socket?.connected) return; // Don't recreate if already connected

    console.log("Initializing socket connection...");
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket = newSocket;

    newSocket.on("connect", () => {
      console.log("Connected to socket:", newSocket.id);
      newSocket.emit("join", { userId: currentUser.id });
    });

    newSocket.on("newMessage", (msg: BackendMessage) => {
      console.log("New message received via socket:", msg);

      const messageId = msg._id || msg.id;

      // Skip if no ID or already have this message
      if (!messageId || messageIdsRef.current.has(messageId)) {
        console.log("Skipping duplicate message:", messageId);
        return;
      }

      // Add to tracked messages
      messageIdsRef.current.add(messageId);

      const formattedMsg: Message = {
        id: messageId,
        content: msg.content,
        senderId: msg.senderId,
        receiverId: msg.senderId === currentUser.id ? "" : currentUser.id,
        chatId: msg.chatId,
        createdAt: msg.createdAt,
      };

      // Only add message to state once
      setMessages((prev) => {
        // Final check to prevent duplicates in state
        if (prev.some((m) => m.id === messageId)) {
          console.log("Message already in state:", messageId);
          return prev;
        }
        console.log("Adding new message to state:", messageId);
        return [...prev, formattedMsg];
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("reconnect", () => {
      console.log("Socket reconnected");
      newSocket.emit("join", { userId: currentUser.id });
    });

    // Cleanup only when component unmounts or user changes
    return () => {
      console.log("Cleaning up socket connection");
      if (newSocket) {
        newSocket.disconnect();
        socket = null;
      }
    };
  }, [currentUser?.id, SOCKET_URL]); // Only depend on user ID, not activeChat

  // Fetch contacts
  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
      try {
        console.log("📋 Fetching contacts...");
        const res = await fetch(`${API_BASE}/api/users`); // ✅ Fixed: Added opening parenthesis

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
        setLoadingMessages(true);
        console.log(`💬 Fetching conversation with ${activeChat.name}...`);

        const res = await fetch(
          `${API_BASE}/api/messages?userAId=${currentUser.id}&userBId=${activeChat.id}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.statusText}`);
        }

        const data: BackendMessage[] = await res.json();
        console.log(`✅ Received ${data.length} messages from server`);

        // Clear the message IDs ref for the new chat
        messageIdsRef.current.clear();

        const mapped: Message[] = data.map((m) => {
          const messageId = m._id || m.id || "";
          if (messageId) {
            messageIdsRef.current.add(messageId); // Track this message
          }

          return {
            id: messageId,
            content: m.content,
            senderId: m.senderId,
            receiverId:
              m.senderId === currentUser.id ? activeChat.id : currentUser.id,
            chatId: m.chatId,
            createdAt: m.createdAt,
          };
        });

        setMessages(mapped);
        console.log("Messages loaded and displayed:", mapped.length);
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setMessages([]); // Clear messages on error
      } finally {
        setLoadingMessages(false);
      }
    };

    // Clear messages when switching chats
    setMessages([]);
    messageIdsRef.current.clear();

    fetchConversation();
  }, [activeChat, currentUser, API_BASE]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || !activeChat || sending) return;

    const messageContent = inputMessage.trim();
    const messageData = {
      senderId: currentUser.id,
      receiverId: activeChat.id,
      content: messageContent,
    };

    const tempId = `temp-${Date.now()}-${Math.random()}`;

    try {
      setSending(true);

      // Clear input immediately for better UX
      setInputMessage("");

      console.log("Sending message:", messageData);

      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.statusText}`);
      }

      const saved = await res.json();
      const savedId = saved._id || saved.id;
      console.log("Message saved with ID:", savedId);

      // Track this message ID so we don't add it again from socket
      if (savedId) {
        messageIdsRef.current.add(savedId);
      }

      // Create the message to add to state
      const newMessage: Message = {
        id: savedId,
        content: saved.content,
        senderId: saved.senderId,
        receiverId: activeChat.id,
        chatId: saved.chatId,
        createdAt: saved.createdAt,
      };

      // Add to messages immediately
      setMessages((prev) => {
        // Check if already exists (shouldn't happen, but be safe)
        if (prev.some((m) => m.id === savedId)) {
          console.log("Message already in state, skipping");
          return prev;
        }
        return [...prev, newMessage];
      });
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message. Please try again.");
      setInputMessage(messageContent); // Restore message
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
      loadingMessages={loadingMessages}
    />
  );
}
