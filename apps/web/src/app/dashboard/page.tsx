"use client";

import AIActivity from "../../components/dashboard/widgets/AIActivity";
import ModelUsage from "../../components/dashboard/widgets/ModelUsage";
import RecentChats from "../../components/dashboard/widgets/RecentChats";
import QuickActions from "../../components/dashboard/widgets/QuickActions";
import CostSavings from "../../components/dashboard/widgets/CostSavings";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          AI Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your AI workspace.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AIActivity />
        <ModelUsage />
        <RecentChats />
        <QuickActions />
      </div>

      <div className="mt-6">
        <CostSavings />
      </div>
    </main>
  );
}