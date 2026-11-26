"use client";

import {
  ShieldCheck,
  Lock,
  AlertTriangle,
} from "lucide-react";

const securityItems = [
  {
    title: "Encryption",
    status: "Enabled",
    color: "text-green-600",
  },
  {
    title: "Two-Factor Authentication",
    status: "Active",
    color: "text-green-600",
  },
  {
    title: "Threat Detection",
    status: "Monitoring",
    color: "text-blue-600",
  },
  {
    title: "Suspicious Login Attempts",
    status: "0 Detected",
    color: "text-red-600",
  },
];

export default function SecurityDashboard() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck
          size={28}
          className="text-green-600"
        />

        <h2 className="text-2xl font-bold">
          Security Dashboard
        </h2>
      </div>

      <div className="space-y-4">

        {securityItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-lg border p-4"
          >

            <div className="flex items-center gap-3">

              {item.title === "Suspicious Login Attempts" ? (
                <AlertTriangle className="text-red-500" />
              ) : (
                <Lock className="text-blue-600" />
              )}

              <span className="font-medium">
                {item.title}
              </span>

            </div>

            <span className={`font-semibold ${item.color}`}>
              {item.status}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}