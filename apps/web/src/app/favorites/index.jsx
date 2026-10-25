"use client";

export default function Favorites() {
  const favorites = [
    "Chat Assistant",
    "Research Agent",
    "Analytics Dashboard",
    "AI Playground",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Favorites
      </h1>

      <ul className="space-y-3">
        {favorites.map((item) => (
          <li
            key={item}
            className="border rounded-lg p-4"
          >
            ⭐ {item}
          </li>
        ))}
      </ul>
    </div>
  );
}