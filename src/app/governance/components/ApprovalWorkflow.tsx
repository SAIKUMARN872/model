"use client";

const approvals = [
  {
    id: 1,
    request: "Create AI Agent",
    owner: "John",
    status: "Pending",
  },
  {
    id: 2,
    request: "Deploy Model",
    owner: "Sarah",
    status: "Approved",
  },
  {
    id: 3,
    request: "Delete Dataset",
    owner: "David",
    status: "Rejected",
  },
];

export default function ApprovalWorkflow() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Approval Workflow
      </h2>

      <div className="space-y-3">
        {approvals.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-md border p-4"
          >
            <div>
              <h3 className="font-medium">{item.request}</h3>
              <p className="text-sm text-gray-500">
                Owner: {item.owner}
              </p>
            </div>

            <span className="rounded bg-blue-100 px-3 py-1 text-sm">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}