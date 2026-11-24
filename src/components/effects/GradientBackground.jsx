"use client";

export default function GradientBackground({
  children,
}) {
  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-blue-100
        via-white
        to-purple-100
      "
    >
      {children}
    </div>
  );
}