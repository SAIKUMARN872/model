export class EncryptionService {
  private readonly prefix = "encrypted:";

  public encrypt(value: string): string {
    if (!value) {
      return "";
    }

    try {
      const encoded =
        typeof window !== "undefined"
          ? window.btoa(
              encodeURIComponent(value)
            )
          : this.encodeBase64(value);

      return this.prefix + encoded;
    } catch {
      throw new Error(
        "Failed to encrypt value."
      );
    }
  }

  public decrypt(value: string): string {
    if (!value) {
      return "";
    }

    if (!value.startsWith(this.prefix)) {
      return value;
    }

    try {
      const encoded = value.substring(
        this.prefix.length
      );

      if (
        typeof window !== "undefined"
      ) {
        return decodeURIComponent(
          window.atob(encoded)
        );
      }

      return this.decodeBase64(encoded);
    } catch {
      throw new Error(
        "Failed to decrypt value."
      );
    }
  }

  public isEncrypted(
    value: string
  ): boolean {
    return value.startsWith(
      this.prefix
    );
  }

  private encodeBase64(
    value: string
  ): string {
    const bytes =
      new TextEncoder().encode(value);

    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }

  private decodeBase64(
    value: string
  ): string {
    const binary = atob(value);

    const bytes = Uint8Array.from(
      binary,
      (character) =>
        character.charCodeAt(0)
    );

    return new TextDecoder().decode(
      bytes
    );
  }
}

const encryption =
  new EncryptionService();

export default encryption;