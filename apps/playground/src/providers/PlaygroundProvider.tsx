import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface PlaygroundRunOptions {
  input?: string;
  model?: string;
  tool?: string;
}

export interface PlaygroundResponse {
  id: string;
  content: string;
  model: string;
  tool: string;
  createdAt: string;
}

export interface PlaygroundContextValue {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  output: string;
  setOutput: Dispatch<SetStateAction<string>>;
  selectedModel: string;
  setSelectedModel: Dispatch<SetStateAction<string>>;
  selectedTool: string;
  setSelectedTool: Dispatch<SetStateAction<string>>;
  loading: boolean;
  error: string | null;
  run: (
    options?: PlaygroundRunOptions
  ) => Promise<PlaygroundResponse>;
  clear: () => void;
  clearError: () => void;
}

interface PlaygroundProviderProps {
  children: ReactNode;
}

const PlaygroundContext =
  createContext<PlaygroundContextValue | null>(null);

export function PlaygroundProvider({
  children,
}: PlaygroundProviderProps) {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const [selectedModel, setSelectedModel] =
    useState<string>("");

  const [selectedTool, setSelectedTool] =
    useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      options: PlaygroundRunOptions = {}
    ): Promise<PlaygroundResponse> => {
      setLoading(true);
      setError(null);

      try {
        const prompt = options.input ?? input;
        const model = options.model ?? selectedModel;
        const tool = options.tool ?? selectedTool;

        if (!prompt.trim()) {
          throw new Error("Please enter a prompt.");
        }

        const response: PlaygroundResponse = {
          id: Date.now().toString(),
          content: `Playground response for: ${prompt}`,
          model,
          tool,
          createdAt: new Date().toISOString(),
        };

        setOutput(response.content);

        return response;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to run playground.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [input, selectedModel, selectedTool]
  );

  const clear = useCallback((): void => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const value = useMemo<PlaygroundContextValue>(
    () => ({
      input,
      setInput,
      output,
      setOutput,
      selectedModel,
      setSelectedModel,
      selectedTool,
      setSelectedTool,
      loading,
      error,
      run,
      clear,
      clearError,
    }),
    [
      input,
      output,
      selectedModel,
      selectedTool,
      loading,
      error,
      run,
      clear,
      clearError,
    ]
  );

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlaygroundContext(): PlaygroundContextValue {
  const context = useContext(PlaygroundContext);

  if (!context) {
    throw new Error(
      "usePlaygroundContext must be used inside PlaygroundProvider."
    );
  }

  return context;
}

export default PlaygroundContext;