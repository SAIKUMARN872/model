"use client";

export default function Settings() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">
        Settings
      </h1>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block font-medium">
            Workspace Name
          </label>

          <input
            className="w-full rounded border p-3"
            defaultValue="AI Workspace"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Email Notifications
          </label>

          <select className="w-full rounded border p-3">
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </div>

        <button className="rounded bg-blue-600 px-5 py-2 text-white">
          Save Settings
        </button>
      </div>
    </div>
  );
}