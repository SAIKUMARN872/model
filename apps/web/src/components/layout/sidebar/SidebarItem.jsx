
"use client";

export default function SidebarItem({ icon, title }) {
  return (
    <button
      type="button"
      className="
        group
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        px-3
        py-2.5
        text-left
        text-[13px]
        font-medium
        text-slate-400
        transition-all
        duration-200
        hover:bg-slate-800
        hover:text-white
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-slate-500
      "
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 transition-colors group-hover:text-white">
        {icon}
      </span>

      <span>{title}</span>
    </button>
  );
}
