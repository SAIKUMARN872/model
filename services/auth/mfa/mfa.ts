import { randomUUID } from "node:crypto";

export type MfaMethod = "totp" | "sms" | "email";

export interface MfaFactor {
  id: string;
  userId: string;
  method: MfaMethod;
  secret?: string;
  enabled: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MfaSetup {
  factorId: string;
  userId: string;
  method: MfaMethod;
  secret?: string;
  enabled: boolean;
  verified: boolean;
}

export class MfaService {
  private readonly factors = new Map<string, MfaFactor>();

  setup(
    userId: string,
    method: MfaMethod = "totp",
    secret?: string,
  ): MfaSetup {
    if (!userId.trim()) {
      throw new Error("userId is required");
    }

    const factor: MfaFactor = {
      id: randomUUID(),
      userId,
      method,
      secret,
      enabled: false,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.factors.set(factor.id, factor);

    return {
      factorId: factor.id,
      userId: factor.userId,
      method: factor.method,
      secret: factor.secret,
      enabled: factor.enabled,
      verified: factor.verified,
    };
  }

  getById(factorId: string): MfaFactor | undefined {
    const factor = this.factors.get(factorId);
    return factor ? this.clone(factor) : undefined;
  }

  getUserFactors(userId: string): MfaFactor[] {
    return Array.from(this.factors.values())
      .filter((factor) => factor.userId === userId)
      .map((factor) => this.clone(factor));
  }

  enable(factorId: string): MfaFactor {
    const factor = this.requireFactor(factorId);

    factor.enabled = true;
    factor.verified = true;
    factor.updatedAt = new Date();

    return this.clone(factor);
  }

  disable(factorId: string): MfaFactor {
    const factor = this.requireFactor(factorId);

    factor.enabled = false;
    factor.updatedAt = new Date();

    return this.clone(factor);
  }

  delete(factorId: string): boolean {
    return this.factors.delete(factorId);
  }

  isEnabled(userId: string): boolean {
    return Array.from(this.factors.values()).some(
      (factor) =>
        factor.userId === userId &&
        factor.enabled &&
        factor.verified,
    );
  }

  count(): number {
    return this.factors.size;
  }

  clear(): void {
    this.factors.clear();
  }

  health(): { healthy: boolean; factorCount: number } {
    return {
      healthy: true,
      factorCount: this.factors.size,
    };
  }

  private requireFactor(factorId: string): MfaFactor {
    const factor = this.factors.get(factorId);

    if (!factor) {
      throw new Error(`MFA factor not found: ${factorId}`);
    }

    return factor;
  }

  private clone(factor: MfaFactor): MfaFactor {
    return {
      ...factor,
      createdAt: new Date(factor.createdAt),
      updatedAt: new Date(factor.updatedAt),
    };
  }
}

export const mfaService = new MfaService();
