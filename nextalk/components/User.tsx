"use client";

import Image from "next/image";
import { FaPaperPlane, FaPhoneAlt, FaVideo } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import React, { useState, useEffect, useRef } from "react";
import type { Message } from "../app/types/chat";
import Signout from "./Signout";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type UserLayoutProps = {
  contacts: User[];
  messages: Message[];
  activeChat: User | null;
  setActiveChat: React.Dispatch<React.SetStateAction<User | null>>;
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  sending: boolean;
  currentUser: User | null;
  loadingMessages?: boolean;
};

export default function UserLayout({
  contacts,
  messages,
  activeChat,
  setActiveChat,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  sending,
  currentUser,
  loadingMessages = false,
}: UserLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query)
    );
  });

  if (!currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F8F6FF] to-[#F3E8FF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7E22CE] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-[#F8F6FF] to-[#F3E8FF] overflow-hidden">
      {/* ===== Sidebar ===== */}
      <aside
        className={`
          bg-gradient-to-b from-[#6D28D9] to-[#9333EA] text-white flex flex-col shadow-lg
          transition-all duration-300
          w-full sm:w-1/3 md:w-1/4
          ${showChatOnMobile ? "hidden sm:flex" : "flex"}
        `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          <h1 className="text-xl font-bold tracking-wide">NexTalk</h1>
          <Signout />
        </div>

        {/* Signed-in User */}
        <div className="flex items-center p-4 border-b border-white/10 bg-white/10 backdrop-blur-md">
          <Image
            src={currentUser.image || "/default-avatar.png"}
            alt={currentUser.name || "User"}
            width={45}
            height={45}
            className="rounded-full border-2 border-white/30"
            unoptimized
          />
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {currentUser.name || "You"}
            </h3>
            <p className="text-xs text-purple-100 truncate">
              {currentUser.email || "Online"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            <FiSearch className="text-white opacity-80" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="bg-transparent outline-none text-white ml-2 w-full placeholder-white/70 text-sm"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  setActiveChat(contact);
                  setShowChatOnMobile(true);
                }}
                className={`flex items-center p-3 cursor-pointer hover:bg-white/10 transition ${
                  activeChat?.id === contact.id ? "bg-white/15" : ""
                }`}
              >
                <Image
                  src={contact.image || "/default-avatar.png"}
                  alt={contact.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full border border-white/20"
                  unoptimized
                />
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {contact.name || "Unknown User"}
                  </h3>
                  <p className="text-xs text-purple-100 truncate">
                    {contact.email || ""}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-purple-100 text-center mt-6 px-4 text-sm">
              {searchQuery ? "No contacts found" : "No contacts available"}
            </p>
          )}
        </div>
      </aside>

      {/* ===== Chat Section ===== */}
      <section
        className={`
          flex flex-col border-x border-gray-200/40 transition-all duration-300 flex-1
          ${showChatOnMobile ? "flex" : "hidden sm:flex"}
        `}
      >
        <header className="flex items-center justify-between p-4 border-b bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Back Button (Mobile) */}
            <button
              onClick={() => setShowChatOnMobile(false)}
              className="sm:hidden text-[#7E22CE] text-sm font-semibold"
            >
              ←
            </button>

            {activeChat ? (
              <>
                <Image
                  src={activeChat.image || "/default-avatar.png"}
                  alt={activeChat.name || "Chat user"}
                  width={45}
                  height={45}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {activeChat.name || "Unknown User"}
                  </h2>
                  <p className="text-xs text-[#7E22CE]">Online</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a user to start chatting</p>
            )}
          </div>

          <div className="flex gap-3 text-[#7E22CE]">
            <FaPhoneAlt className="cursor-pointer hover:text-[#9333EA] transition" />
            <FaVideo className="cursor-pointer hover:text-[#9333EA] transition" />
          </div>
        </header>

        {/* ===== Messages ===== */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-[#F8F6FF] to-[#EDE9FE] space-y-3">
          {activeChat ? (
            loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7E22CE] mb-3"></div>
                <p className="text-gray-400 text-sm">Loading messages...</p>
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((msg) => {
                  const isSentByMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isSentByMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-2xl shadow-sm ${
                          isSentByMe
                            ? "bg-gradient-to-r from-[#a071c9] to-[#9333EA] text-white"
                            : "bg-white text-gray-800 border border-gray-100"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isSentByMe ? "text-purple-200" : "text-gray-400"
                          }`}
                        >
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">👋</div>
                <p className="text-gray-400">No messages yet.</p>
                <p className="text-gray-400 text-sm mt-1">
                  Say hi to start the conversation!
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-400 text-lg font-medium">
                Select a user to start chatting
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Choose a contact from the sidebar to begin
              </p>
            </div>
          )}
        </div>

        {/* ===== Message Input ===== */}
        {activeChat && (
          <footer className="p-4 bg-white border-t flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
              disabled={sending || loadingMessages}
              className="flex-1 text-purple-900 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-[#8244b7] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !inputMessage.trim() || loadingMessages}
              className="bg-gradient-to-r from-[#caa7e9] to-[#71449b] text-white rounded-full p-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FaPaperPlane size={18} />
              )}
            </button>
          </footer>
        )}
      </section>

      {/* ===== Profile Section ===== */}
      <aside className="w-1/4 bg-white border-l border-gray-200 hidden lg:flex flex-col items-center p-6">
        {activeChat ? (
          <>
            <Image
              src={activeChat.image || "/default-avatar.png"}
              alt={activeChat.name || "Chat user"}
              width={100}
              height={100}
              className="rounded-full border-4 border-[#E9D5FF]"
              unoptimized
            />
            <h3 className="mt-3 text-lg font-semibold text-gray-800">
              {activeChat.name || "Unknown User"}
            </h3>
            <p className="text-sm text-gray-500 break-all text-center">
              {activeChat.email || "No email"}
            </p>
            <div className="mt-6 w-full border-t pt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                User Info
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 text-green-600 font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-gray-500">Select a user to view profile</p>
          </div>
        )}
      </aside>
    </div>
  );
}
