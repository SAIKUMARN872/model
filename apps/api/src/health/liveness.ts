export interface LivenessStatus {
  readonly success: true;
  readonly status: "alive";
  readonly timestamp: string;
}

export function getLivenessStatus(): LivenessStatus {
  return {
    success: true,
    status: "alive",
    timestamp: new Date().toISOString(),
  };
}