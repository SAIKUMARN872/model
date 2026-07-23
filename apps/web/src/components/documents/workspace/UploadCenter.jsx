"use client";

import { UploadCloud } from "lucide-react";

export default function UploadCenter() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-10">

      <div className="flex flex-col items-center justify-center">

        <UploadCloud
          size={60}
          className="mb-4 text-blue-600"
        />

        <h2 className="text-2xl font-semibold">
          Upload Center
        </h2>

        <p className="mt-2 text-center text-gray-600">
          Drag & Drop your PDF or DOCX files here
        </p>

        <button
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Browse Files
        </button>

      </div>

    </div>
  );
}