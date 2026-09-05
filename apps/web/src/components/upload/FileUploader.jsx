import { useState } from "react";

export default function FileUploader() {
  const [fileName, setFileName] = useState("");

  function handleChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="font-semibold mb-3">
        File Uploader
      </h2>

      <input
        type="file"
        onChange={handleChange}
      />

      {fileName && (
        <p className="mt-3 text-sm text-gray-600">
          Selected: {fileName}
        </p>
      )}
    </div>
  );
}