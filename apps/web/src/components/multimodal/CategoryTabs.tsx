"use client";

import type { ElementType } from "react";

export type MediaCategory =
  | "Input"
  | "Image"
  | "Audio"
  | "Voice"
  | "Video"
  | "Cross-modal"
  | "Processing"
  | "Output";

export type CategoryConfig = {
  id: MediaCategory;
  description: string;
  icon: ElementType;
};

type CategoryTabsProps = {
  categories: CategoryConfig[];
  activeCategory: MediaCategory;
  onCategoryChange: (category: MediaCategory) => void;
};

export default function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const active = activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon size={15} />
              {category.id}
            </button>
          );
        })}
      </div>
    </section>
  );
}