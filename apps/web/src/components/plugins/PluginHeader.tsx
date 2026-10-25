"use client";

import { Plug } from "lucide-react";

export default function PluginHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
          <Plug size={19} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-[#17181a]">
            Plugins
          </h1>

          <p className="mt-1 text-sm text-[#73777d]">
            Connect ModelNow with external tools and services
          </p>
        </div>
      </div>
    </div>
  );
}