"use client";

const history = [
  {
    id: 1,
    title: "React Interview Questions",
    date: "Today",
  },
  {
    id: 2,
    title: "Python Project Ideas",
    date: "Yesterday",
  },
  {
    id: 3,
    title: "Machine Learning Notes",
    date: "2 Days Ago",
  },
];

export default function ChatHistory() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Chat History
      </h2>

      <div className="space-y-3">
        {history.map((chat) => (
          <div
            key={chat.id}
            className="cursor-pointer rounded-lg border p-3 transition hover:bg-gray-100"
          >
            <h3 className="font-medium">{chat.title}</h3>

            <p className="text-sm text-gray-500">
              {chat.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}