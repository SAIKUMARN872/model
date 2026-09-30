import { randomUUID } from "node:crypto";
import { TotpService } from "./totp.js";

export interface VerificationResult {
  verified: boolean;
  verificationId: string;
  factorId?: string;
  userId?: string;
  method?: string;
  message: string;
}

export interface VerificationRecord {
  id: string;
  factorId: string;
  userId: string;
  verified: boolean;
  createdAt: Date;
}

export class MfaVerificationService {
  private readonly records = new Map<string, VerificationRecord>();

  constructor(
    private readonly totp: TotpService = new TotpService(),
  ) {}

  verifyTotp(
    factorId: string,
    userId: string,
    token: string,
    secret: string,
    timestamp = Date.now(),
  ): VerificationResult {
    const verificationId = randomUUID();

    if (!factorId.trim()) {
      return {
        verified: false,
        verificationId,
        message: "factorId is required",
      };
    }

    if (!userId.trim()) {
      return {
        verified: false,
        verificationId,
        message: "userId is required",
      };
    }

    const verified = this.totp.verify(
      token,
      secret,
      timestamp,
    );

    this.records.set(verificationId, {
      id: verificationId,
      factorId,
      userId,
      verified,
      createdAt: new Date(),
    });

    return {
      verified,
      verificationId,
      factorId,
      userId,
      method: "totp",
      message: verified
        ? "MFA verification successful"
        : "Invalid MFA code",
    };
  }

  getVerification(
    id: string,
  ): VerificationRecord | undefined {
    const record = this.records.get(id);

    if (!record) {
      return undefined;
    }

    return {
      ...record,
      createdAt: new Date(record.createdAt),
    };
  }

  getUserVerifications(
    userId: string,
  ): VerificationRecord[] {
    return Array.from(this.records.values())
      .filter((record) => record.userId === userId)
      .map((record) => ({
        ...record,
        createdAt: new Date(record.createdAt),
      }));
  }

  count(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
  }

  health(): {
    healthy: boolean;
    verificationCount: number;
  } {
    return {
      healthy: true,
      verificationCount: this.records.size,
    };
  }
}

export const mfaVerificationService =
  new MfaVerificationService();
