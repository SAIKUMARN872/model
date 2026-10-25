"use client";

const projects = [
  "Customer Support Bot",
  "Medical Assistant",
  "Finance Analyzer",
  "Code Generator",
];

export default function Projects() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Projects
      </h1>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project}
            className="rounded-lg border p-4"
          >
            {project}
          </div>
        ))}
      </div>
    </div>
  );
}