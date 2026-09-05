const conversations = [
  "New Chat",
  "Frontend Setup",
  "AI Research",
  "Code Review"
];

export default function ConversationSidebar() {
  return (
    <aside className="w-64 border-r h-full bg-white">
      <div className="p-4 border-b font-semibold">
        Conversations
      </div>

      <ul>
        {conversations.map((item) => (
          <li
            key={item}
            className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}