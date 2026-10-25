"use client";

const reports = [
  {
    month: "January",
    uptime: "99.97%",
    incidents: 2,
  },
  {
    month: "February",
    uptime: "99.99%",
    incidents: 1,
  },
  {
    month: "March",
    uptime: "100%",
    incidents: 0,
  },
];

export default function SLAReport() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        Monthly SLA Report
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-3 text-left">
              Month
            </th>

            <th className="text-left">
              Uptime
            </th>

            <th className="text-left">
              Incidents
            </th>
          </tr>
        </thead>

        <tbody>
          {reports.map((item) => (
            <tr
              key={item.month}
              className="border-b"
            >
              <td className="py-3">
                {item.month}
              </td>

              <td>{item.uptime}</td>

              <td>{item.incidents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}