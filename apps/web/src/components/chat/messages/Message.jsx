"use client";

export default function Message({
  sender,
  text,
}) {
  const isUser = sender === "You";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-xl rounded-xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <p className="mb-1 text-xs font-semibold">
          {sender}
        </p>

        <p>{text}</p>
      </div>
    </div>
  );
}