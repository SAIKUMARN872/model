import type { SessionRecord, VerificationResult } from "../interfaces.js";
import { VerificationService } from "../services/verification-service.js";
import { createVerificationJob } from "../jobs/verification-job.js";

export class VerificationWorker {
  constructor(private readonly verifier = new VerificationService()) {}

  run(session: SessionRecord, actionId?: string): VerificationResult {
    createVerificationJob(session.id, actionId);
    return this.verifier.verify(session, actionId);
  }
}
