export interface BiometricCredential {
  id: string;
  userId: string;
  type: "fingerprint" | "face" | "voice";
  registeredAt: string;
  enabled: boolean;
}

export interface BiometricResult {
  success: boolean;
  credential?: BiometricCredential;
  message?: string;
}

export class BiometricService {
  private credentials: BiometricCredential[] = [];

  public register(
    userId: string,
    type: BiometricCredential["type"]
  ): BiometricResult {
    if (!userId.trim()) {
      return {
        success: false,
        message: "User ID is required.",
      };
    }

    const credential: BiometricCredential = {
      id: this.generateId(),
      userId,
      type,
      registeredAt: new Date().toISOString(),
      enabled: true,
    };

    this.credentials.push(credential);

    return {
      success: true,
      credential,
      message: "Biometric credential registered.",
    };
  }

  public authenticate(
    userId: string,
    type: BiometricCredential["type"]
  ): BiometricResult {
    const credential = this.credentials.find(
      (item) =>
        item.userId === userId &&
        item.type === type &&
        item.enabled
    );

    if (!credential) {
      return {
        success: false,
        message:
          "No active biometric credential found.",
      };
    }

    return {
      success: true,
      credential,
      message: "Biometric authentication successful.",
    };
  }

  public disable(
    credentialId: string
  ): boolean {
    const credential = this.credentials.find(
      (item) => item.id === credentialId
    );

    if (!credential) {
      return false;
    }

    credential.enabled = false;

    return true;
  }

  public enable(
    credentialId: string
  ): boolean {
    const credential = this.credentials.find(
      (item) => item.id === credentialId
    );

    if (!credential) {
      return false;
    }

    credential.enabled = true;

    return true;
  }

  public getUserCredentials(
    userId: string
  ): BiometricCredential[] {
    return this.credentials.filter(
      (credential) =>
        credential.userId === userId
    );
  }

  public remove(
    credentialId: string
  ): boolean {
    const initialLength =
      this.credentials.length;

    this.credentials = this.credentials.filter(
      (credential) =>
        credential.id !== credentialId
    );

    return (
      this.credentials.length <
      initialLength
    );
  }

  public clear(): void {
    this.credentials = [];
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

const biometricService =
  new BiometricService();

export default biometricService;