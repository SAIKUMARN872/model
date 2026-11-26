import { Bell, Search } from "lucide-react";
import UserMenu from "./UserMenu";
import ModelStatus from "./ModelStatus";

export default function TopNavbar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-white">

      <div className="flex items-center gap-3">

        <Search size={20} />

        <input
          type="text"
          placeholder="Search..."
          className="border rounded-md px-3 py-2 w-72 outline-none"
        />

      </div>

      <div className="flex items-center gap-5">

        <ModelStatus />

        <Bell size={20} className="cursor-pointer" />

        <UserMenu />

      </div>

    </header>
  );
}