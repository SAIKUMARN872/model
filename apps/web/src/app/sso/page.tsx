"use client";

import SSOSettings from "./configuration/SSOSettings";
import OAuthProvider from "./providers/OAuthProvider";
import SAMLProvider from "./providers/SAMLProvider";

export default function SSOPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Single Sign-On (SSO)
        </h1>

        <p className="mt-2 text-gray-500">
          Configure enterprise authentication providers and
          identity management.
        </p>
      </div>

      <SSOSettings />

      <div className="grid gap-6 md:grid-cols-2">
        <OAuthProvider />
        <SAMLProvider />
      </div>
    </div>
  );
}