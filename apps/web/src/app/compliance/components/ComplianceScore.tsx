"use client";

interface ComplianceScoreProps {
  score?: number;
}

export default function ComplianceScore({
  score = 92,
}: ComplianceScoreProps) {
  const color =
    score >= 90
      ? "text-green-600"
      : score >= 70
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">
        Compliance Score
      </h2>

      <div className={`text-5xl font-bold ${color}`}>
        {score}%
      </div>

      <p className="mt-3 text-gray-500">
        Current organizational compliance status.
      </p>
    </div>
  );
}