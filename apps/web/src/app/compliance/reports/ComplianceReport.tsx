"use client";

export default function ComplianceReport() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Compliance Report
      </h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Category</th>
            <th className="py-2 text-left">Status</th>
            <th className="py-2 text-left">Score</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <td className="py-2">Security</td>
            <td>Passed</td>
            <td>96%</td>
          </tr>

          <tr className="border-b">
            <td className="py-2">Privacy</td>
            <td>Passed</td>
            <td>91%</td>
          </tr>

          <tr>
            <td className="py-2">Governance</td>
            <td>Review</td>
            <td>84%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}