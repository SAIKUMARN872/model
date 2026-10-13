import type { Request, Response } from "express";
import { routePrompt, RoutingError } from "../services/routing/routing-service.js";
import { executionService } from "../services/execution/index.js";
import type { ExecutionRequest } from "../services/execution/execution-types.js";

export async function chatController(req: Request, res: Response) {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message is required.",
      });
    }

    const policy = {
      prioritize:
        req.body?.prioritize === "cost" ||
        req.body?.prioritize === "latency" ||
        req.body?.prioritize === "quality" ||
        req.body?.prioritize === "balanced"
          ? req.body.prioritize
          : "balanced",
    } as const;

    const route = await routePrompt(message, policy);

    const executionRequest: ExecutionRequest = {
      model: route.model,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      timeoutMs: 120000,
    };

    const execution = await executionService.execute(
      route.provider,
      executionRequest,
    );

    return res.status(200).json({
      success: true,
      message: execution.content,
      routing: route.routing,
      classification: route.classification,
      model: route.model,
      execution,
      candidates: route.candidates,
      explainability: route.explainability,
    });
  } catch (error) {
    if (error instanceof RoutingError) {
      const capableModelsUnavailable = error.explainability
        .filter(
          (candidate) =>
            candidate.capabilityEligible &&
            !candidate.executionEligible,
        )
        .map((candidate) => ({
          model: candidate.model,
          provider: candidate.provider,
          tier: candidate.tier,
          providerAvailable: candidate.providerAvailable,
          providerHealthy: candidate.providerHealthy,
          decisions: candidate.decisions,
        }));

      return res.status(503).json({
        success: false,
        error: error.message,
        reason:
          capableModelsUnavailable.length > 0
            ? "CAPABLE_MODELS_UNAVAILABLE"
            : "NO_CAPABLE_MODEL",
        classification: error.classification,
        capableModelsUnavailable,
        explainability: error.explainability,
      });
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected chat execution error.";

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
