import { AssetRepository } from "./asset-repository.js";
import { ResultRepository } from "./result-repository.js";
import { SessionRepository } from "./session-repository.js";

export class MultimodalRepository {
  readonly assets = new AssetRepository();
  readonly results = new ResultRepository();
  readonly sessions = new SessionRepository();
}
