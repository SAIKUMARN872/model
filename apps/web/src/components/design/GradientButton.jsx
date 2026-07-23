"use client";

export default function GradientButton({
  children = "Click Me",
  onClick,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="
        rounded-xl
        bg-gradient-to-r
        from-blue-600
        via-purple-600
        to-pink-600
        px-6
        py-3
        font-medium
        text-white
        shadow-lg
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-xl
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {children}
    </button>
  );
}