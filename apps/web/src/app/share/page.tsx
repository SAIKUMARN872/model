"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Link2,
  Copy,
  Check,
  Shield,
  Pencil,
  Eye,
  Ban,
  X,
} from "lucide-react";

type AccessType = "view" | "edit";

type ShareLink = {
  id: string;
  url: string;
  access: AccessType;
  createdAt: string;
  active: boolean;
};

export default function SharePage() {
  const router = useRouter();

  const [accessType, setAccessType] =
    useState<AccessType>("view");

  const [shareLink, setShareLink] =
    useState<ShareLink | null>(null);

  const [copied, setCopied] = useState(false);

  const [showRevokeConfirm, setShowRevokeConfirm] =
    useState(false);

  const generateShareLink = () => {
    const randomId = Math.random()
      .toString(36)
      .substring(2, 12);

    const newLink: ShareLink = {
      id: randomId,
      url: `https://modelnow.ai/share/${randomId}`,
      access: accessType,
      createdAt: new Date().toLocaleString(),
      active: true,
    };

    setShareLink(newLink);
    setCopied(false);
  };

  const copyShareLink = async () => {
    if (!shareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        shareLink.url
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const revokeAccess = () => {
    setShareLink(null);
    setCopied(false);
    setShowRevokeConfirm(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      <div className="flex min-h-screen">

        {/* ================= SIDEBAR ================= */}
        <aside className="fixed left-0 top-0 hidden h-screen w-[270px] flex-col border-r border-[#e5e5e5] bg-white md:flex">

          <div className="flex h-16 items-center border-b border-[#e5e5e5] px-5">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm font-medium text-[#343541] hover:text-black"
            >
              <ArrowLeft size={18} />
              ModelNow
            </button>
          </div>

          <div className="flex-1 px-3 py-5">

            <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-[#8e8ea0]">
              Functionality
            </div>

            <button
              className="flex w-full items-center gap-3 rounded-lg bg-[#ececf1] px-3 py-2.5 text-left text-sm font-medium text-[#202123]"
            >
              <Share2 size={18} />
              Share
            </button>

          </div>
        </aside>

        {/* ================= MOBILE HEADER ================= */}
        <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-[#e5e5e5] bg-white px-4 md:hidden">

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-medium text-[#343541]"
          >
            <ArrowLeft size={18} />
            ModelNow
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm font-medium">
            <Share2 size={17} />
            Share
          </div>

        </div>

        {/* ================= MAIN CONTENT ================= */}
        <section className="ml-0 flex min-w-0 flex-1 flex-col md:ml-[270px]">

          {/* Header */}
          <header className="hidden h-16 items-center border-b border-[#e5e5e5] bg-white px-7 md:flex">
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f1f1]">
                <Share2 size={18} />
              </div>

              <div>
                <h1 className="text-lg font-semibold">
                  Share
                </h1>

                <p className="text-xs text-[#8e8ea0]">
                  Share a ModelNow chat with other people
                </p>
              </div>

            </div>
          </header>

          {/* Mobile spacing */}
          <div className="h-14 md:hidden" />

          {/* Content */}
          <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8">

            {/* Intro */}
            <div className="mb-6 rounded-2xl border border-[#e5e5e5] bg-white p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#f1f1f1]">
                  <Link2 size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Shareable Chat Link
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#6e6e80]">
                    Generate a secure link that allows others
                    to access this chat.
                  </p>
                </div>

              </div>

            </div>

            {/* Access Selection */}
            <div className="mb-6 rounded-2xl border border-[#e5e5e5] bg-white p-6">

              <h3 className="text-sm font-semibold">
                Choose access
              </h3>

              <p className="mt-1 text-sm text-[#6e6e80]">
                Select what people can do with the shared chat.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">

                {/* View Only */}
                <button
                  onClick={() => setAccessType("view")}
                  className={`rounded-xl border p-4 text-left transition ${
                    accessType === "view"
                      ? "border-[#202123] bg-[#f7f7f8]"
                      : "border-[#e5e5e5] hover:bg-[#fafafa]"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <Eye size={18} />
                    </div>

                    <div>
                      <div className="text-sm font-medium">
                        View-only
                      </div>

                      <div className="mt-0.5 text-xs text-[#8e8ea0]">
                        People can view the conversation.
                      </div>
                    </div>

                  </div>

                  {accessType === "view" && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#343541]">
                      <Check size={14} />
                      Selected
                    </div>
                  )}

                </button>

                {/* Edit Access */}
                <button
                  onClick={() => setAccessType("edit")}
                  className={`rounded-xl border p-4 text-left transition ${
                    accessType === "edit"
                      ? "border-[#202123] bg-[#f7f7f8]"
                      : "border-[#e5e5e5] hover:bg-[#fafafa]"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <Pencil size={18} />
                    </div>

                    <div>
                      <div className="text-sm font-medium">
                        Edit access
                      </div>

                      <div className="mt-0.5 text-xs text-[#8e8ea0]">
                        People can interact with the shared chat.
                      </div>
                    </div>

                  </div>

                  {accessType === "edit" && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#343541]">
                      <Check size={14} />
                      Selected
                    </div>
                  )}

                </button>

              </div>

              {/* Generate */}
              <button
                onClick={generateShareLink}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202123] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#343541]"
              >
                <Link2 size={17} />
                Generate Shareable Link
              </button>

            </div>

            {/* Generated Link */}
            {shareLink && (
              <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6">

                <div className="mb-5 flex items-start justify-between gap-4">

                  <div>
                    <h3 className="text-sm font-semibold">
                      Share link created
                    </h3>

                    <p className="mt-1 text-sm text-[#6e6e80]">
                      This link currently has{" "}
                      {shareLink.access === "view"
                        ? "view-only"
                        : "edit"}{" "}
                      access.
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f1f1]">
                    <Shield size={17} />
                  </div>

                </div>

                {/* Link */}
                <div className="flex flex-col gap-2 sm:flex-row">

                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d9d9e3] bg-[#fafafa] px-3 py-2.5">

                    <Link2
                      size={16}
                      className="flex-shrink-0 text-[#8e8ea0]"
                    />

                    <span className="min-w-0 flex-1 truncate text-sm text-[#565869]">
                      {shareLink.url}
                    </span>

                  </div>

                  <button
                    onClick={copyShareLink}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#202123] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#343541]"
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Link
                      </>
                    )}
                  </button>

                </div>

                {/* Details */}
                <div className="mt-5 grid gap-3 border-t border-[#e5e5e5] pt-5 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-[#8e8ea0]">
                      Access
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {shareLink.access === "view"
                        ? "View-only"
                        : "Edit access"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8e8ea0]">
                      Created
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {shareLink.createdAt}
                    </p>
                  </div>

                </div>

                {/* Revoke */}
                <div className="mt-5 border-t border-[#e5e5e5] pt-5">

                  <button
                    onClick={() =>
                      setShowRevokeConfirm(true)
                    }
                    className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Ban size={16} />
                    Revoke Access
                  </button>

                </div>

              </div>
            )}

            {/* Empty State */}
            {!shareLink && (
              <div className="rounded-2xl border border-dashed border-[#d9d9e3] bg-white p-8 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f1f1]">
                  <Share2 size={21} />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  No active share link
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8e8ea0]">
                  Choose an access level and generate a
                  shareable link to share your chat.
                </p>

              </div>
            )}

          </div>
        </section>
      </div>

      {/* ================= REVOKE CONFIRMATION ================= */}
      {showRevokeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-sm rounded-2xl border border-[#e5e5e5] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">

              <h2 className="text-base font-semibold">
                Revoke access?
              </h2>

              <button
                onClick={() =>
                  setShowRevokeConfirm(false)
                }
                className="rounded-lg p-2 text-[#8e8ea0] hover:bg-[#f7f7f8]"
              >
                <X size={18} />
              </button>

            </div>

            <div className="p-5">

              <p className="text-sm leading-6 text-[#6e6e80]">
                Anyone using this share link will no longer
                be able to access the chat.
              </p>

            </div>

            <div className="flex justify-end gap-2 border-t border-[#e5e5e5] px-5 py-4">

              <button
                onClick={() =>
                  setShowRevokeConfirm(false)
                }
                className="rounded-lg border border-[#d9d9e3] px-4 py-2 text-sm font-medium text-[#343541] hover:bg-[#f7f7f8]"
              >
                Cancel
              </button>

              <button
                onClick={revokeAccess}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Revoke Access
              </button>

            </div>

          </div>
        </div>
      )}
    </main>
  );
}