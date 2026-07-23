"use client";

import { Bell, Search, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-gray-500" />

        <input
          type="text"
          placeholder="Search..."
          className="w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell className="h-5 w-5 text-gray-600" />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-2">
          <UserCircle className="h-8 w-8 text-gray-600" />

          <div className="hidden md:block">
            <p className="text-sm font-semibold">Harshini</p>
            <p className="text-xs text-gray-500">Frontend Developer</p>
          </div>
        </div>
      </div>
    </header>
  );
}