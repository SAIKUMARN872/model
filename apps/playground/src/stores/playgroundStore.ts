export interface PlaygroundHistoryItem {
  id: string;
  input: string;
  output: string;
  model: string;
  tool: string;
  createdAt: string;
}

export interface PlaygroundState {
  input: string;
  output: string;
  selectedModel: string;
  selectedTool: string;
  loading: boolean;
  error: string | null;
  history: PlaygroundHistoryItem[];
}

export interface PlaygroundRunPayload {
  input?: string;
  model?: string;
  tool?: string;
  [key: string]: unknown;
}

export interface PlaygroundRunResult {
  output?: string;
  content?: string;
  response?: string;
  model?: string;
  tool?: string;
  [key: string]: unknown;
}

export type PlaygroundApiFunction = (
  payload: PlaygroundRunPayload
) => Promise<PlaygroundRunResult>;

export type PlaygroundListener = (
  state: PlaygroundState
) => void;

const createInitialState = (): PlaygroundState => ({
  input: "",
  output: "",
  selectedModel: "",
  selectedTool: "",
  loading: false,
  error: null,
  history: [],
});

let state: PlaygroundState = createInitialState();

const listeners = new Set<PlaygroundListener>();

function notify(): void {
  listeners.forEach((listener) => {
    listener(state);
  });
}

function updateState(
  updates: Partial<PlaygroundState>
): void {
  state = {
    ...state,
    ...updates,
  };

  notify();
}

export function getPlaygroundState(): PlaygroundState {
  return state;
}

export function subscribeToPlayground(
  listener: PlaygroundListener
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setInput(input: string): void {
  updateState({
    input,
    error: null,
  });
}

export function setOutput(output: string): void {
  updateState({ output });
}

export function setSelectedModel(
  selectedModel: string
): void {
  updateState({ selectedModel });
}

export function setSelectedTool(
  selectedTool: string
): void {
  updateState({ selectedTool });
}

export function setLoading(loading: boolean): void {
  updateState({ loading });
}

export function setError(error: string | null): void {
  updateState({
    error,
    loading: false,
  });
}

export function addToHistory(
  result: Partial<PlaygroundRunResult> = {}
): PlaygroundHistoryItem {
  const historyItem: PlaygroundHistoryItem = {
    id: Date.now().toString(),
    input: state.input,
    output:
      result.output ||
      result.content ||
      state.output,
    model:
      result.model ||
      state.selectedModel,
    tool:
      result.tool ||
      state.selectedTool,
    createdAt: new Date().toISOString(),
  };

  updateState({
    history: [
      historyItem,
      ...state.history,
    ],
  });

  return historyItem;
}

export function clearHistory(): void {
  updateState({
    history: [],
  });
}

export function clearPlayground(): void {
  updateState({
    input: "",
    output: "",
    error: null,
    loading: false,
  });
}

export function resetPlayground(): void {
  state = createInitialState();
  notify();
}

export async function runPlayground(
  apiFunction: PlaygroundApiFunction,
  payload: PlaygroundRunPayload = {}
): Promise<PlaygroundRunResult> {
  updateState({
    loading: true,
    error: null,
  });

  try {
    if (typeof apiFunction !== "function") {
      throw new Error("API function is required.");
    }

    const result = await apiFunction({
      input: payload.input ?? state.input,
      model: payload.model ?? state.selectedModel,
      tool: payload.tool ?? state.selectedTool,
      ...payload,
    });

    const output =
      result?.output ||
      result?.content ||
      result?.response ||
      "";

    updateState({
      output,
      loading: false,
    });

    addToHistory({
      ...result,
      output,
    });

    return result;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to run playground.";

    updateState({
      error: message,
      loading: false,
    });

    throw error;
  }
}

export default {
  getPlaygroundState,
  subscribeToPlayground,
  setInput,
  setOutput,
  setSelectedModel,
  setSelectedTool,
  setLoading,
  setError,
  addToHistory,
  clearHistory,
  clearPlayground,
  resetPlayground,
  runPlayground,
};
