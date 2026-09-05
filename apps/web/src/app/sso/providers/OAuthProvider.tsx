"use client";

const providers = [
  "Google",
  "GitHub",
  "Microsoft",
  "LinkedIn",
];

export default function OAuthProvider() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        OAuth Providers
      </h2>

      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider}
            className="flex items-center justify-between rounded border p-3"
          >
            <span>{provider}</span>

            <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-700">
              Connected
            </span>
          </div>
        ))}
      </div>

      <button className="mt-5 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
        Add Provider
      </button>
    </div>
  );
}