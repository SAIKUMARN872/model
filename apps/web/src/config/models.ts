export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Fast multimodal AI model",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    description: "Advanced reasoning model",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    description: "Strong reasoning and coding",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Google AI model",
  },
  {
    id: "llama-3",
    name: "Llama 3",
    provider: "Meta",
    description: "Open-source language model",
  },
];

export default AI_MODELS;