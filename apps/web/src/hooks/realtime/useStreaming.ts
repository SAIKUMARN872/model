import { useEffect, useState } from "react";

export function useStreaming() {
  const [stream, setStream] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      setStream((prev) => prev + ".");
    }, 500);

    return () => clearInterval(timer);
  }, [isStreaming]);

  return {
    stream,
    isStreaming,
    start: () => setIsStreaming(true),
    stop: () => setIsStreaming(false),
  };
}