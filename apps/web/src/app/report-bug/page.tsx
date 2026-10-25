
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Bug,
  ThumbsDown,
  ThumbsUp,
  ShieldAlert,
  Search,
  MessageSquare,
  ImagePlus,
  Send,
  CheckCircle2,
} from "lucide-react";

const categories = [
  { name: "Bug", icon: Bug },
  { name: "Bad result", icon: ThumbsDown },
  { name: "Good result", icon: ThumbsUp },
  { name: "Safety check", icon: ShieldAlert },
  { name: "Research failure", icon: Search },
  { name: "Other", icon: MessageSquare },
];

export default function ReportBugPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleCategory(category: string) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );

    setScreenshots((current) => [...current, ...files]);
    event.target.value = "";
  }

  function removeScreenshot(index: number) {
    setScreenshots((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const report = {
      categories: selected,
      details: details.trim(),
      screenshots,
      createdAt: new Date().toISOString(),
    };

    // Demo only: connect your backend API to save this report.
    console.log("ModelNow feedback:", report);
    setSubmitted(true);
  }

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-3 sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="my-auto w-full max-w-[760px] rounded-[26px] border border-gray-200 bg-[#fafafa] px-5 py-6 shadow-2xl sm:px-7 sm:py-7"
      >
        <header className="mb-6 flex items-center justify-between">
          <h1
            id="feedback-title"
            className="text-[23px] font-semibold tracking-tight text-[#171717]"
          >
            {submitted ? "Feedback submitted" : "Share feedback"}
          </h1>

          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Close feedback"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-200"
          >
            <X size={19} />
          </button>
        </header>

        {submitted ? (
          <div className="py-10 text-center">
            <CheckCircle2
              size={46}
              className="mx-auto mb-4 text-green-600"
            />
            <p className="text-lg font-medium">
              Thank you for your feedback.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Your feedback has been prepared successfully.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm text-white hover:bg-gray-800"
            >
              Back to chat
            </button>
          </div>
        ) : (
          <form onSubmit={submitFeedback}>
            <p className="mb-3 text-sm font-medium text-gray-700">
              What would you like to report?
            </p>

            <div className="mb-5 flex flex-wrap gap-2.5">
              {categories.map(({ name, icon: Icon }) => {
                const active = selected.includes(name);

                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(name)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm transition ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-[#dedede] bg-transparent text-[#262626] hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {name}
                  </button>
                );
              })}
            </div>

            <label htmlFor="feedback-details" className="sr-only">
              Feedback details
            </label>

            <textarea
              id="feedback-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Share details (required)"
              required
              rows={5}
              className="mb-4 block min-h-[145px] w-full resize-y rounded-lg border border-[#b8c9ff] bg-white p-3 text-base leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#4778ff] focus:ring-1 focus:ring-[#4778ff]"
            />

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100"
              >
                <ImagePlus size={17} />
                Add screenshots
              </button>

              {screenshots.length > 0 && (
                <div className="mt-3 space-y-2">
                  {screenshots.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm text-gray-700">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        aria-label={`Remove ${file.name}`}
                        className="rounded-md p-1.5 hover:bg-gray-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="mb-6 text-sm leading-6 text-[#929292]">
              Your feedback can help improve ModelNow.{" "}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-gray-600"
              >
                Learn more.
              </a>
            </p>

            <button
              type="submit"
              disabled={!details.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-base font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-[#a0a0a0]"
            >
              <Send size={16} />
              Submit
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
