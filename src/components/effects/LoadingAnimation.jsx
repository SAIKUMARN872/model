"use client";

export default function LoadingAnimation({
  text = "Loading...",
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border bg-white p-8 shadow">

      <div className="flex gap-3">

        <span className="h-4 w-4 animate-bounce rounded-full bg-blue-600"></span>

        <span
          className="h-4 w-4 animate-bounce rounded-full bg-purple-600"
          style={{ animationDelay: "0.2s" }}
        ></span>

        <span
          className="h-4 w-4 animate-bounce rounded-full bg-pink-600"
          style={{ animationDelay: "0.4s" }}
        ></span>

      </div>

      <p className="text-lg font-medium text-gray-700">
        {text}
      </p>

    </div>
  );
}