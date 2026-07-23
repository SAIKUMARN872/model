export default function SidebarItem({
  icon,
  title,
}) {
  return (
    <button
      className="
        w-full
        flex
        items-center
        gap-3
        px-4
        py-3
        rounded-lg
        hover:bg-slate-700
        transition
      "
    >
      {icon}

      <span>{title}</span>
    </button>
  );
}