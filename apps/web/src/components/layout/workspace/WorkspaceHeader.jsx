import { Sparkles } from "lucide-react";

export default function WorkspaceHeader({
  title = "Dashboard",
  description = "Welcome to your AI workspace.",
}) {
  return (
    <div className="mb-6 flex items-center justify-between">

      <div>

        <h1 className="text-3xl font-bold text-gray-800">
          {title}
        </h1>

        <p className="mt-1 text-gray-500">
          {description}
        </p>

      </div>

      <button
        className="
          flex
          items-center
          gap-2
          rounded-lg
          bg-blue-600
          px-4
          py-2
          text-white
          hover:bg-blue-700
          transition
        "
      >
        <Sparkles size={18} />
        New AI Session
      </button>

    </div>
  );
}