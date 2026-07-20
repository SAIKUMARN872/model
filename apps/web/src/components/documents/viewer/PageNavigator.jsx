"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function PageNavigator({
  totalPages = 10,
}) {
  const [page, setPage] = useState(1);

  const previous = () => {
    if (page > 1) setPage(page - 1);
  };

  const next = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="flex items-center justify-center gap-4 rounded-xl border bg-white p-4 shadow">

      <button
        onClick={previous}
        className="rounded-lg border p-2 hover:bg-gray-100"
      >
        <ChevronLeft />
      </button>

      <span className="font-medium">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={next}
        className="rounded-lg border p-2 hover:bg-gray-100"
      >
        <ChevronRight />
      </button>

    </div>
  );
}