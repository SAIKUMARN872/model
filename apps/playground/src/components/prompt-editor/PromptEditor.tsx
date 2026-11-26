import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  FileText,
  Save,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface PromptEditorProps {
  initialPrompt?: string;
  onSave?: (prompt: string) => void;
}

export default function PromptEditor({
  initialPrompt = "",
  onSave,
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [saved, setSaved] = useState(false);

  const handleSave = (): void => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) return;

    onSave?.(trimmedPrompt);
    setSaved(true);
  };

  const handleChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setPrompt(event.target.value);
    setSaved(false);
  };

  const handleClear = (): void => {
    setPrompt("");
    setSaved(false);
    onSave?.("");
  };

  return (
    <section className="chat-card prompt-editor-card">
      <div className="prompt-editor-heading">
        <div className="prompt-editor-title">
          <div className="prompt-editor-icon">
            <FileText size={19} />
          </div>

          <div>
            <h2>Prompt Editor</h2>
            <p>Create and edit your AI prompts.</p>
          </div>
        </div>

        <span className="prompt-editor-badge">
          <Sparkles size={12} />
          System Prompt
        </span>
      </div>

      <div className="prompt-editor-textarea-wrapper">
        <textarea
          value={prompt}
          onChange={handleChange}
          placeholder="Enter your system prompt here..."
          rows={8}
          aria-label="System prompt"
        />

        <div className="prompt-editor-character-count">
          {prompt.length.toLocaleString()} characters
        </div>
      </div>

      <div className="prompt-editor-actions">
        <button
          type="button"
          className="prompt-save-button"
          onClick={handleSave}
          disabled={!prompt.trim()}
        >
          <Save size={15} />
          Save Prompt
        </button>

        <button
          type="button"
          className="prompt-clear-button"
          onClick={handleClear}
          disabled={!prompt}
        >
          <Trash2 size={15} />
          Clear
        </button>

        {saved && (
          <span className="prompt-saved-message" role="status">
            <CheckCircle2 size={15} />
            Saved successfully
          </span>
        )}
      </div>
    </section>
  );
}