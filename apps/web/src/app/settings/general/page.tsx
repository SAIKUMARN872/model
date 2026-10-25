"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const languages = [
  "Auto detect",
  "English",
  "Telugu",
  "Hindi",
];

export default function GeneralSettingsPage() {
  const [language, setLanguage] = useState("Auto detect");

  useEffect(() => {
    const saved = localStorage.getItem("modelnow-general-language");
    if (saved && languages.includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  function updateLanguage(value: string) {
    setLanguage(value);
    localStorage.setItem("modelnow-general-language", value);
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-8 text-[#171717] sm:px-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <h1 className="text-3xl font-normal tracking-tight">
          General
        </h1>

        <section className="flex min-h-20 flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e2e2e2] bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">
              Language
            </h2>
            <p className="mt-1 text-sm text-[#737373]">
              Language for the app UI
            </p>
          </div>

          <div className="relative">
            <select
              value={language}
              onChange={(event) => updateLanguage(event.target.value)}
              aria-label="App language"
              className="min-w-[148px] cursor-pointer appearance-none rounded-full border border-[#dedede] bg-[#f7f7f7] py-2.5 pl-4 pr-10 text-sm outline-none transition hover:bg-[#f0f0f0] focus:border-[#999]"
            >
              {languages.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373]"
            />
          </div>
        </section>
      </div>
    </main>
  );
}