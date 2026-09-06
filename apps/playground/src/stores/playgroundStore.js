"use client";

let state = {
  input: "",
  output: "",
  selectedModel: "",
  selectedTool: "",
  loading: false,
  error: null,
  history: [],
};

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => {
    listener(state);
  });
}

function updateState(updates) {
  state = {
    ...state,
    ...updates,
  };

  notify();
}

export function getPlaygroundState() {
  return state;
}

export function subscribeToPlayground(
  listener
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setInput(input) {
  updateState({
    input,
    error: null,
  });
}

export function setOutput(output) {
  updateState({
    output,
  });
}

export function setSelectedModel(
  selectedModel
) {
  updateState({
    selectedModel,
  });
}

export function setSelectedTool(
  selectedTool
) {
  updateState({
    selectedTool,
  });
}

export function setLoading(loading) {
  updateState({
    loading,
  });
}

export function setError(error) {
  updateState({
    error,
    loading: false,
  });
}

export function addToHistory(
  result
) {
  const historyItem = {
    id: Date.now().toString(),
    input: state.input,
    output:
      result?.output ||
      result?.content ||
      state.output,
    model:
      result?.model ||
      state.selectedModel,
    tool:
      result?.tool ||
      state.selectedTool,
    createdAt:
      new Date().toISOString(),
  };

  updateState({
    history: [
      historyItem,
      ...state.history,
    ],
  });

  return historyItem;
}

export function clearHistory() {
  updateState({
    history: [],
  });
}

export function clearPlayground() {
  updateState({
    input: "",
    output: "",
    error: null,
    loading: false,
  });
}

export function resetPlayground() {
  state = {
    input: "",
    output: "",
    selectedModel: "",
    selectedTool: "",
    loading: false,
    error: null,
    history: [],
  };

  notify();
}

export async function runPlayground(
  apiFunction,
  payload = {}
) {
  updateState({
    loading: true,
    error: null,
  });

  try {
    if (
      typeof apiFunction !==
      "function"
    ) {
      throw new Error(
        "API function is required."
      );
    }

    const result =
      await apiFunction({
        input:
          payload.input ??
          state.input,
        model:
          payload.model ??
          state.selectedModel,
        tool:
          payload.tool ??
          state.selectedTool,
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
  } catch (error) {
    const message =
      error?.message ||
      "Failed to run playground.";

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