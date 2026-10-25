export default function AuditLogsTable() {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th className="border p-2">Time</th>
          <th className="border p-2">User</th>
          <th className="border p-2">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td className="border p-2">--</td>
          <td className="border p-2">Admin</td>
          <td className="border p-2">No logs</td>
        </tr>
      </tbody>
    </table>
  );
}