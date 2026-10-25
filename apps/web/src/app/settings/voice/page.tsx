"use client";

import { useEffect, useState } from "react";
import { AudioLines } from "lucide-react";

export default function VoiceSettingsPage() {
  const [voice, setVoice] = useState("alloy");
  const [autoPlay, setAutoPlay] = useState(false);
  const [mode, setMode] = useState("push-to-talk");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("modelnow-voice-settings");
      if (!raw) return;

      const data = JSON.parse(raw);
      setVoice(data.voice ?? "alloy");
      setAutoPlay(data.autoPlay ?? false);
      setMode(data.mode ?? "push-to-talk");
    } catch {}
  }, []);

  function save() {
    localStorage.setItem(
      "modelnow-voice-settings",
      JSON.stringify({ voice, autoPlay, mode })
    );
    setSaved(true);
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8 text-[#2d2d2d]">
      <header>
        <div className="flex items-center gap-3">
          <AudioLines size={24} />
          <h1 className="text-3xl font-normal tracking-tight">Voice</h1>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Customize your voice interaction preferences.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#e5e5e5]">
        <div className="border-b border-[#eeeeee] p-5">
          <label className="mb-2 block text-sm font-medium">
            Preferred voice
          </label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full max-w-md rounded-xl border border-[#dedede] bg-white px-3 py-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="alloy">Alloy</option>
            <option value="ash">Ash</option>
            <option value="coral">Coral</option>
            <option value="sage">Sage</option>
            <option value="verse">Verse</option>
          </select>
        </div>

        <div className="border-b border-[#eeeeee] p-5">
          <label className="mb-2 block text-sm font-medium">
            Voice input mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full max-w-md rounded-xl border border-[#dedede] bg-white px-3 py-3 text-sm outline-none"
          >
            <option value="push-to-talk">Push to talk</option>
            <option value="hands-free">Hands-free</option>
          </select>
        </div>

        <label className="flex items-center justify-between gap-4 p-5">
          <span>
            <span className="block text-sm font-medium">
              Automatically play voice responses
            </span>
            <span className="mt-1 block text-sm text-gray-500">
              Play generated audio automatically when supported.
            </span>
          </span>
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
            className="h-4 w-4 accent-black"
          />
        </label>
      </section>

      <button
        onClick={save}
        className="rounded-full bg-[#2d2d2d] px-5 py-2.5 text-sm text-white hover:bg-black"
      >
        Save changes
      </button>

      {saved && (
        <p role="status" className="text-sm text-green-700">
          Preferences saved on this browser.
        </p>
      )}

      <p className="text-xs text-gray-500">
        Voice generation requires connection to a supported audio provider.
      </p>
    </main>
  );
}