export default function ArtifactRenderer({ title = "Artifact", children }) {
  return (
    <div className="rounded-lg border bg-white shadow-sm p-5">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>

      <div className="text-sm text-gray-700">
        {children || "No artifact available."}
      </div>
    </div>
  );
}