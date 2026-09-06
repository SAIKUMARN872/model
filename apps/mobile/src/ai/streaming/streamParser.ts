export interface ParsedStreamChunk {
  id: string;
  content: string;
  done: boolean;
  error?: string;
}

export class StreamParser {
  private buffer = "";

  public parse(chunk: string): ParsedStreamChunk[] {
    if (!chunk) {
      return [];
    }

    this.buffer += chunk;

    const results: ParsedStreamChunk[] = [];

    const lines = this.buffer.split("\n");

    this.buffer = lines.pop() ?? "";

    for (const line of lines) {
      const parsed = this.parseLine(line);

      if (parsed) {
        results.push(parsed);
      }
    }

    return results;
  }

  public parseLine(
    line: string
  ): ParsedStreamChunk | null {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return null;
    }

    if (trimmedLine.startsWith("data:")) {
      const data = trimmedLine
        .substring(5)
        .trim();

      if (data === "[DONE]") {
        return {
          id: this.generateId(),
          content: "",
          done: true,
        };
      }

      try {
        const parsed = JSON.parse(data);

        return {
          id: parsed.id ?? this.generateId(),
          content:
            parsed.content ??
            parsed.delta ??
            parsed.text ??
            "",
          done: parsed.done ?? false,
          error: parsed.error,
        };
      } catch {
        return {
          id: this.generateId(),
          content: data,
          done: false,
        };
      }
    }

    return {
      id: this.generateId(),
      content: trimmedLine,
      done: false,
    };
  }

  public flush(): ParsedStreamChunk[] {
    if (!this.buffer.trim()) {
      this.buffer = "";

      return [];
    }

    const result = this.parseLine(this.buffer);

    this.buffer = "";

    return result ? [result] : [];
  }

  public reset(): void {
    this.buffer = "";
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const streamParser = new StreamParser();

export default streamParser;