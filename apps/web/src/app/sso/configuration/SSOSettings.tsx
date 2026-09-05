"use client";

export default function SSOSettings() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        SSO Configuration
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">
            Organization Name
          </label>

          <input
            className="w-full rounded border p-2"
            defaultValue="OpenAI Enterprise"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Domain
          </label>

          <input
            className="w-full rounded border p-2"
            defaultValue="company.com"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Default Login Method
          </label>

          <select className="w-full rounded border p-2">
            <option>OAuth 2.0</option>
            <option>SAML 2.0</option>
            <option>OpenID Connect</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Auto Provision Users
          </label>

          <select className="w-full rounded border p-2">
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </div>
      </div>

      <button className="mt-6 rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
        Save Settings
      </button>
    </div>
  );
}