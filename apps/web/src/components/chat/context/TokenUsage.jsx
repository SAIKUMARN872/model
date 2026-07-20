"use client";

export default function TokenUsage({
  promptTokens = 250,
  completionTokens = 400,
}) {
  const total = promptTokens + completionTokens;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">

      <h2 className="mb-4 text-lg font-semibold">
        Token Usage
      </h2>

      <div className="space-y-2">

        <div className="flex justify-between">
          <span>Prompt Tokens</span>
          <span>{promptTokens}</span>
        </div>

        <div className="flex justify-between">
          <span>Completion Tokens</span>
          <span>{completionTokens}</span>
        </div>

        <hr />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{total}</span>
        </div>

      </div>

    </div>
  );
}