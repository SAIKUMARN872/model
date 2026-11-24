"use client";

import { Share2 } from "lucide-react";

export default function ShareChat() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Chat",
          text: "Check out this AI conversation!",
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100 transition"
    >
      <Share2 size={16} />
      Share
    </button>
  );
}