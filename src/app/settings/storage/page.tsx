
"use client";

import { useState } from "react";

type StorageCategory = "Files" | "Images";

const STORAGE = {
  total: 512,
  used: 512,
  files: { size: 378, count: 86 },
  images: { size: 134, count: 576 },
};

export default function StorageSettingsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<StorageCategory | null>(null);

  const full = STORAGE.used >= STORAGE.total;

  return (
    <section className="space-y-14 pb-12">
      <header>
        <h1 className="text-[30px] font-normal tracking-tight">
          Storage
        </h1>
      </header>

      <section className="space-y-4">
        <p className="text-base font-semibold">
          {STORAGE.used} MB of {STORAGE.total} MB used
        </p>

        <p className="text-sm text-gray-500">
          {full ? "Your storage is full. " : "Storage available. "}
          <a
            href="/plans"
            className="text-blue-600 hover:underline"
          >
            Upgrade for more
          </a>
        </p>

        <div
          className="h-4 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label="Storage used"
          aria-valuemin={0}
          aria-valuemax={STORAGE.total}
          aria-valuenow={STORAGE.used}
        >
          <div
            className="h-full rounded-full bg-[#111111]"
            style={{
              width: `${Math.min(
                100,
                (STORAGE.used / STORAGE.total) * 100
              )}%`,
            }}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-[22px] font-medium tracking-tight">
            Manage storage
          </h2>
          <p className="mt-1 text-base text-gray-500">
            Manage your storage to free up space
          </p>
        </div>

        <div className="rounded-[22px] border border-gray-200 bg-transparent px-5">
          <button
            type="button"
            onClick={() => setSelectedCategory(
              selectedCategory === "Files" ? null : "Files"
            )}
            aria-expanded={selectedCategory === "Files"}
            className="flex w-full items-center justify-between gap-4 border-b border-gray-200 py-4 text-left"
          >
            <span>
              <span className="block text-base font-medium">Files</span>
              <span className="mt-1 block text-sm text-gray-500">
                {STORAGE.files.size} MB · {STORAGE.files.count} files
              </span>
            </span>
            <span className="text-3xl font-light text-gray-600">
              {selectedCategory === "Files" ? "⌄" : "›"}
            </span>
          </button>

          {selectedCategory === "Files" && (
            <div className="border-b border-gray-200 py-4 text-sm text-gray-500">
              File storage details will appear here when ModelNow’s file
              storage backend is connected.
            </div>
          )}

          <button
            type="button"
            onClick={() => setSelectedCategory(
              selectedCategory === "Images" ? null : "Images"
            )}
            aria-expanded={selectedCategory === "Images"}
            className="flex w-full items-center justify-between gap-4 py-4 text-left"
          >
            <span>
              <span className="block text-base font-medium">Images</span>
              <span className="mt-1 block text-sm text-gray-500">
                {STORAGE.images.size} MB · {STORAGE.images.count} images
              </span>
            </span>
            <span className="text-3xl font-light text-gray-600">
              {selectedCategory === "Images" ? "⌄" : "›"}
            </span>
          </button>

          {selectedCategory === "Images" && (
            <div className="border-t border-gray-200 py-4 text-sm text-gray-500">
              Image storage details will appear here when ModelNow’s
              image storage backend is connected.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
