export type RoutingDecisionCode =
  | "ELIGIBLE"
  | "MISSING_CAPABILITY"
  | "QUALITY_REQUIREMENT"
  | "CONTEXT_REQUIREMENT"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_UNHEALTHY"
  | "MODEL_DISABLED";

export type RoutingDecision = {
  code: RoutingDecisionCode;
  message: string;
};

export function createRoutingDecision(
  code: RoutingDecisionCode,
  message: string,
): RoutingDecision {
  return {
    code,
    message,
  };
}
