"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  Code2,
  FileText,
  Filter,
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

type LibraryItem = {
  id: string;
  name: string;
  type: "code" | "text" | "image";
  category: "Suggested" | "Favorites" | "Folders" | "Images" | "All";
  fileData?: string;
  size?: number;
  createdAt: number;
};

const STORAGE_KEY = "modelnow-library-items-v2";
const TABS = ["Suggested", "Favorites", "Folders", "Images", "All"] as const;

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Suggested");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore uploaded library items
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load library items:", e);
    }
    setLoaded(true);
  }, []);

  // Save items
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save library items:", e);
    }
  }, [items, loaded]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      let itemType: LibraryItem["type"] = "text";
      let category: LibraryItem["category"] = "Suggested";

      if (["tsx", "ts", "jsx", "js", "html", "css", "json", "py"].includes(extension)) {
        itemType = "code";
        category = "Suggested";
      } else if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(extension)) {
        itemType = "image";
        category = "Images";
      } else {
        itemType = "text";
        category = "Suggested";
      }

      if (itemType === "image") {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const newItem: LibraryItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: "image",
            category: "Images",
            fileData: uploadEvent.target?.result as string,
            size: file.size,
            createdAt: Date.now(),
          };
          setItems((prev) => [newItem, ...prev]);
        };
        reader.readAsDataURL(file);
      } else {
        const newItem: LibraryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          type: itemType,
          category,
          size: file.size,
          createdAt: Date.now(),
        };
        setItems((prev) => [newItem, ...prev]);
      }
    });

    event.target.value = "";
    setDropdownOpen(false);
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTab =
        activeTab === "All"
          ? true
          : activeTab === "Images"
          ? item.type === "image"
          : item.category === activeTab || item.category === "Suggested";

      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-white px-8 py-6 text-slate-900">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            title="Filter"
          >
            <Filter size={18} />
          </button>

          <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition ${
                viewMode === "grid"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition ${
                viewMode === "list"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library"
              className="h-10 w-64 rounded-full border border-slate-200 bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex h-10 items-center gap-1.5 rounded-full bg-black px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              <span>New</span>
              <ChevronDown size={15} />
            </button>

            {dropdownOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-12 z-40 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Upload size={16} /> Upload File
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            title="Options"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-transparent pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ITEMS CONTAINER */}
      <div className="mt-6">
        {filteredItems.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Upload size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No files in {activeTab}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Click the "New" button above to upload your code, documents, or images.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
            >
              <Plus size={15} /> Upload Files
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {item.type === "code" && (
                      <Code2 size={16} className="shrink-0 text-slate-700" />
                    )}
                    {item.type === "text" && (
                      <FileText size={16} className="shrink-0 text-blue-500" />
                    )}
                    {item.type === "image" && (
                      <ImageIcon size={16} className="shrink-0 text-emerald-500" />
                    )}
                    <span className="truncate text-xs font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    title="Delete item"
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="my-14 flex items-center justify-center overflow-hidden">
                  {item.type === "code" && (
                    <span className="text-4xl font-light text-slate-900">&lt;/&gt;</span>
                  )}
                  {item.type === "text" && (
                    <div className="flex h-16 w-16 items-center justify-center">
                      <FileText size={44} className="stroke-[1.6] text-blue-500" />
                    </div>
                  )}
                  {item.type === "image" && item.fileData && (
                    <img
                      src={item.fileData}
                      alt={item.name}
                      className="max-h-24 w-auto rounded-lg object-contain shadow-sm"
                    />
                  )}
                </div>

                <div className="h-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  {item.type === "code" && (
                    <Code2 size={18} className="text-slate-700" />
                  )}
                  {item.type === "text" && (
                    <FileText size={18} className="text-blue-500" />
                  )}
                  {item.type === "image" && (
                    <ImageIcon size={18} className="text-emerald-500" />
                  )}
                  <span className="text-sm font-medium text-slate-800">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 capitalize">
                    {item.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}