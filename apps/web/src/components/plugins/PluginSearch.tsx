"use client";

import { Search } from "lucide-react";

type PluginSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function PluginSearch({
  value,
  onChange,
}: PluginSearchProps) {
  return (
    <div className="relative w-full">
      <Search
        size={17}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85898f]"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search plugins..."
        className="h-11 w-full rounded-xl border border-[#e1e3e6] bg-white pl-10 pr-4 text-sm text-[#17181a] outline-none transition placeholder:text-[#9a9da2] focus:border-[#b9bcc1]"
      />
    </div>
  );
}