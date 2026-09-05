"use client";

export default function VoicePage() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold">
        Voice Assistant
      </h1>

      <p className="mt-3 text-gray-500">
        Talk with AI using voice interactions.
      </p>

      <button className="mt-8 rounded-full bg-red-500 px-8 py-4 text-white hover:bg-red-600">
        🎤 Start Recording
      </button>
    </div>
  );
}