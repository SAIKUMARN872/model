"use client";

export default function Files() {
  const files = [
    "report.pdf",
    "dataset.csv",
    "presentation.pptx",
    "design.fig",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Files
      </h1>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">File Name</th>
          </tr>
        </thead>

        <tbody>
          {files.map((file) => (
            <tr
              key={file}
              className="border-b"
            >
              <td className="py-3">{file}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}