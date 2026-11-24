"use client";

const conversations = [
  "Dashboard Analytics",
  "AI Models",
  "Next.js Project",
  "React Hooks",
  "Frontend Development",
];

export default function ConversationList() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">

      <h2 className="mb-4 text-lg font-semibold">
        Conversations
      </h2>

      <ul className="space-y-2">

        {conversations.map((item, index) => (
          <li
            key={index}
            className="cursor-pointer rounded-lg border p-3 hover:bg-gray-100"
          >
            {item}
          </li>
        ))}

      </ul>

    </div>
  );
}