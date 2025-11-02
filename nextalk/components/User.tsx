"use client";

import Image from "next/image";
import { FaPaperPlane, FaPlus, FaPhoneAlt, FaVideo } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

export default function UserLayout({
  session,
  contacts,
  messages,
  activeChat,
  setActiveChat,
  inputMessage,
  setInputMessage,
  handleSendMessage,
}: any) {
  const user = session?.user;

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-[#F8F6FF] to-[#F3E8FF]">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gradient-to-b from-[#6D28D9] to-[#9333EA] text-white flex flex-col shadow-lg">
        {/* Top Section with User Info */}
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          <h1 className="text-xl font-bold tracking-wide">NexTalk</h1>
          <button className="bg-white text-[#7E22CE] rounded-full p-2 hover:bg-purple-100 transition">
            <FaPlus />
          </button>
        </div>

        {/* Signed-in User */}
        <div className="flex items-center p-4 border-b border-white/10 bg-white/10 backdrop-blur-md">
          <Image
            src={user?.image || "/default-avatar.png"}
            alt={user?.name || "User"}
            width={45}
            height={45}
            className="rounded-full border-2 border-white/30"
          />
          <div className="ml-3">
            <h3 className="font-semibold text-sm">{user?.name}</h3>
            <p className="text-xs text-purple-100">Online</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            <FiSearch className="text-white opacity-80" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-white ml-2 w-full placeholder-white/70"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.length > 0 ? (
            contacts.map((user: any) => (
              <div
                key={user.id}
                onClick={() => setActiveChat(user)}
                className={`flex items-center p-3 cursor-pointer hover:bg-white/10 transition ${
                  activeChat?.id === user.id ? "bg-white/15" : ""
                }`}
              >
                <Image
                  src={user.image || "/default-avatar.png"}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full border border-white/20"
                />
                <div className="ml-3">
                  <h3 className="font-semibold text-sm">{user.name}</h3>
                  <p className="text-xs text-purple-100">{user.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-purple-100 text-center mt-6">
              No contacts found
            </p>
          )}
        </div>
      </aside>

      {/* Chat Section */}
      <section className="flex-1 flex flex-col border-x border-gray-200/40">
        {/* Chat Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white/90 backdrop-blur-sm">
          {activeChat ? (
            <div className="flex items-center gap-3">
              <Image
                src={activeChat.image || "/default-avatar.png"}
                alt={activeChat.name}
                width={45}
                height={45}
                className="rounded-full"
              />
              <div>
                <h2 className="font-semibold text-gray-800">
                  {activeChat.name}
                </h2>
                <p className="text-xs text-[#7E22CE]">Online</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a user to start chatting</p>
          )}
          <div className="flex gap-3 text-[#7E22CE]">
            <FaPhoneAlt className="cursor-pointer hover:text-[#9333EA]" />
            <FaVideo className="cursor-pointer hover:text-[#9333EA]" />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-[#F8F6FF] to-[#EDE9FE] space-y-3">
          {activeChat &&
            messages
              .filter(
                (msg: any) =>
                  (msg.sender === session?.user?.name &&
                    msg.receiver === activeChat.email) ||
                  (msg.receiver === session?.user?.email &&
                    msg.sender === activeChat.name)
              )
              .map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`max-w-xs p-3 rounded-2xl shadow-sm ${
                    msg.sender === session?.user?.name
                      ? "bg-gradient-to-r from-[#a071c9] to-[#9333EA] text-white ml-auto"
                      : "bg-white text-gray-800 border border-gray-100"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] text-gray-300 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
        </div>

        {/* Message Input */}
        {activeChat && (
          <footer className="p-4 bg-white border-t flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-[#7E22CE] outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-[#caa7e9] to-[#71449b] text-white rounded-full p-3 hover:opacity-90 transition"
            >
              <FaPaperPlane size={18} />
            </button>
          </footer>
        )}
      </section>

      {/* Profile Section */}
      <aside className="w-1/4 bg-white border-l border-gray-200 flex flex-col items-center p-6">
        {activeChat ? (
          <>
            <Image
              src={activeChat.image || "/default-avatar.png"}
              alt={activeChat.name}
              width={100}
              height={100}
              className="rounded-full border-4 border-[#E9D5FF]"
            />
            <h3 className="mt-3 text-lg font-semibold text-gray-800">
              {activeChat.name}
            </h3>
            <p className="text-sm text-gray-500">{activeChat.email}</p>
            <div className="mt-6 w-full">
              <h4 className="font-semibold text-gray-700 mb-2">Media</h4>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-md bg-[#F3E8FF] flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-10">Select a user to view profile</p>
        )}
      </aside>
    </div>
  );
}
