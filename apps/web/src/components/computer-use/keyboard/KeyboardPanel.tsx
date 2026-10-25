import {
  Keyboard,
  Copy,
  Clipboard,
} from "lucide-react";

import Section from "../shared/Section";
import ActionButton from "../shared/ActionButton";

type KeyboardPanelProps = {
  runAction: (action: string) => void;
};

export default function KeyboardPanel({
  runAction,
}: KeyboardPanelProps) {
  return (
    <Section
      title="Keyboard Control"
      description="Type text and execute keyboard actions."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <textarea
            placeholder="Text to type into the active application..."
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-slate-400"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton
              icon={Keyboard}
              label="Type"
              onClick={() => runAction("Type text")}
            />

            <ActionButton
              icon={Keyboard}
              label="Key Press"
              onClick={() => runAction("Key press")}
            />

            <ActionButton
              icon={Copy}
              label="Copy"
              onClick={() => runAction("Copy")}
            />

            <ActionButton
              icon={Clipboard}
              label="Paste"
              onClick={() => runAction("Paste")}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Hotkeys</p>

          <div className="grid grid-cols-2 gap-2">
            {[
              "Ctrl + C",
              "Ctrl + V",
              "Ctrl + X",
              "Ctrl + Z",
              "Alt + Tab",
              "Ctrl + S",
            ].map((key) => (
              <button
                key={key}
                onClick={() => runAction(key)}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium hover:bg-slate-100"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}