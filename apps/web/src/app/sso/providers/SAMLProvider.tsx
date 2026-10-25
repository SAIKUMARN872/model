"use client";

const samlProviders = [
  {
    name: "Okta",
    status: "Configured",
  },
  {
    name: "Azure AD",
    status: "Configured",
  },
  {
    name: "OneLogin",
    status: "Pending",
  },
];

export default function SAMLProvider() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        SAML Providers
      </h2>

      <div className="space-y-3">
        {samlProviders.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center justify-between rounded border p-3"
          >
            <div>
              <h3 className="font-medium">
                {provider.name}
              </h3>

              <p className="text-sm text-gray-500">
                Enterprise Identity Provider
              </p>
            </div>

            <span className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700">
              {provider.status}
            </span>
          </div>
        ))}
      </div>

      <button className="mt-5 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
        Configure SAML
      </button>
    </div>
  );
}