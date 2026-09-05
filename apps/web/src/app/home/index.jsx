"use client";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-5xl font-bold">
        Welcome to AI Platform
      </h1>

      <p className="mt-4 text-lg text-gray-500">
        Build, deploy and manage AI applications from one
        unified workspace.
      </p>

      <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
        Get Started
      </button>
    </div>
  );
}