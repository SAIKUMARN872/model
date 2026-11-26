import { MessageSquare, History, Star } from "lucide-react";

export default function ChatMenu() {
  const items = [
    {
      icon: <MessageSquare size={18} />,
      label: "New Chat",
    },
    {
      icon: <History size={18} />,
      label: "History",
    },
    {
      icon: <Star size={18} />,
      label: "Favorites",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">
        Chat
      </h3>

      {items.map((item) => (
        <button
          key={item.label}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800 transition"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}