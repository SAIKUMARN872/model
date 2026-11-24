"use client";

import ApprovalWorkflow from "./components/ApprovalWorkflow";
import PolicyDashboard from "./components/PolicyDashboard";

export default function GovernancePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Governance Center</h1>
        <p className="text-gray-500 mt-1">
          Manage policies, approvals and governance workflows.
        </p>
      </div>

      <PolicyDashboard />

      <ApprovalWorkflow />
    </div>
  );
}