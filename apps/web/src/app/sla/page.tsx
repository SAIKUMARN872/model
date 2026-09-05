"use client";

import SLAOverview from "./metrics/SLAOverview";
import LatencyMetrics from "./metrics/LatencyMetrics";
import SLAReport from "./reports/SLAReport";

export default function SLAPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          SLA Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor uptime, latency, availability and service
          performance.
        </p>
      </div>

      <SLAOverview />

      <LatencyMetrics />

      <SLAReport />
    </div>
  );
}