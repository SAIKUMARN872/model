"use client";

export default function GlassCard({
  title = "Glass Card",
  children,
}) {
  return (
    <div
      className="
      rounded-2xl
      border
      border-white/20
      bg-white/10
      p-6
      shadow-xl
      backdrop-blur-lg
      "
    >

      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        {title}
      </h2>

      <div>
        {children}
      </div>

    </div>
  );
}