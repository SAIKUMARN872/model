export interface VoiceOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class VoiceService {
  private recognition: any = null;

  public speak(
    text: string,
    options: VoiceOptions = {}
  ): void {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    if (!text.trim()) {
      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang =
      options.language ?? "en-US";

    utterance.rate =
      options.rate ?? 1;

    utterance.pitch =
      options.pitch ?? 1;

    utterance.volume =
      options.volume ?? 1;

    window.speechSynthesis.speak(
      utterance
    );
  }

  public stopSpeaking(): void {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeechSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    );
  }

  public isRecognitionSupported(): boolean {
    if (
      typeof window === "undefined"
    ) {
      return false;
    }

    return (
      "SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window
    );
  }

  public startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): void {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.(
        "Speech recognition is not supported."
      );

      return;
    }

    this.recognition =
      new SpeechRecognition();

    this.recognition.lang = "en-US";
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (
      event: any
    ) => {
      const text =
        event.results[0][0].transcript;

      onResult(text);
    };

    this.recognition.onerror = (
      event: any
    ) => {
      onError?.(
        event.error ||
          "Voice recognition failed."
      );
    };

    this.recognition.start();
  }

  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }
}

const voiceService =
  new VoiceService();

export default voiceService;