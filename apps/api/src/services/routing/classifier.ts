import type { ModelTier } from "./model-selector.js";

export type PromptClass = "simple" | "general" | "coding" | "reasoning" | "enterprise" | "creative";

export type Capability =
  | "basic_qa"
  | "coding"
  | "reasoning"
  | "architecture"
  | "enterprise"
  | "security"
  | "long_context"
  | "multi_step";

export type ClassificationResult = {
  type: PromptClass;
  complexity: number;
  confidence: number;
  reasoningRequired: boolean;
  codingRequired: boolean;
  enterpriseRequired: boolean;
  longContext: boolean;
  multiStep: boolean;
  capabilities: Capability[];
  qualityRequirement: "standard" | "advanced" | "maximum";
};

function contains(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function detectCodingIntent(text: string): boolean {
  const directCodingSignals = [
    "write code",
    "write some code",
    "generate code",
    "create code",
    "code for",
    "coding",
    "programming",
    "program this",
    "implement this",
    "implement a function",
    "implement an api",
    "debug",
    "fix this code",
    "fix the code",
    "refactor",
    "repository",
    "source code",
    "function",
    "class",
    "endpoint",
    "rest api",
    "api endpoint",
    "database integration",
    "sql query",
  ];

  if (contains(text, directCodingSignals)) {
    return true;
  }

  const languageMention = contains(text, [
    "python",
    "javascript",
    "typescript",
    "java",
    "c++",
    "c#",
    "golang",
    "rust",
    "php",
    "ruby",
    "sql",
  ]);

  const codingAction = contains(text, [
    "write",
    "build",
    "create",
    "develop",
    "implement",
    "generate",
    "debug",
    "fix",
    "refactor",
  ]);

  return languageMention && codingAction;
}

export function classifyPrompt(prompt: string): ClassificationResult {
  const text = String(prompt ?? "").trim().toLowerCase();
  const words = text.split(/\\s+/).filter(Boolean);
  const wordCount = words.length;

  const codingRequired = detectCodingIntent(text);

  const reasoningRequired = contains(text, [
    "analyze",
    "analysis",
    "reason",
    "reasoning",
    "evaluate",
    "derive",
    "solve",
    "compare",
    "trade-off",
    "tradeoff",
    "strategy",
    "strategic",
    "optimize",
    "optimization",
    "explain why",
    "step-by-step",
    "step by step",
    "complex",
    "detailed",
    "architecture",
    "system design",
  ]);

  const enterpriseRequired = contains(text, [
    "enterprise",
    "organization",
    "company",
    "business",
    "crm",
    "erp",
    "hr",
    "finance",
    "sales",
    "support",
    "governance",
    "compliance",
    "rbac",
    "sso",
    "audit",
    "policy",
    "multi-agent",
    "multi agent",
    "microservices",
  ]);

  const securityRequired = contains(text, [
    "security",
    "secure",
    "authentication",
    "authorization",
    "rbac",
    "sso",
    "encryption",
    "privacy",
    "compliance",
    "audit",
    "vulnerability",
    "threat",
  ]);

  const architectureRequired = contains(text, [
    "architecture",
    "architect",
    "system design",
    "design a system",
    "microservices",
    "distributed",
    "scalable",
    "high availability",
    "highly available",
  ]);

  const multiStep = contains(text, [
    "step-by-step",
    "step by step",
    "workflow",
    "pipeline",
    "process",
    "implement",
    "build",
    "first",
    "then",
    "after that",
    "finally",
  ]);

  const longContext = wordCount >= 120 || text.length >= 900;

  let complexity = 10;

  if (wordCount > 15) complexity += 10;
  if (wordCount > 40) complexity += 10;
  if (wordCount > 80) complexity += 10;
  if (wordCount > 120) complexity += 10;
  if (codingRequired) complexity += 20;
  if (reasoningRequired) complexity += 20;
  if (enterpriseRequired) complexity += 20;
  if (securityRequired) complexity += 15;
  if (architectureRequired) complexity += 20;
  if (multiStep) complexity += 10;
  if (longContext) complexity += 15;

  complexity = Math.min(100, complexity);

  let type: PromptClass;

  if (enterpriseRequired && (securityRequired || architectureRequired)) {
    type = "enterprise";
  } else if (codingRequired && (architectureRequired || multiStep || complexity >= 40)) {
    type = "coding";
  } else if (reasoningRequired || architectureRequired) {
    type = "reasoning";
  } else if (codingRequired) {
    type = "coding";
  } else if (contains(text, [
    "write a story",
    "poem",
    "creative",
    "caption",
    "marketing",
    "brainstorm",
  ])) {
    type = "creative";
  } else if (wordCount <= 12) {
    type = "simple";
  } else {
    type = "general";
  }

  const capabilities: Capability[] = [];

  if (codingRequired) capabilities.push("coding");
  if (reasoningRequired) capabilities.push("reasoning");
  if (architectureRequired) capabilities.push("architecture");
  if (enterpriseRequired) capabilities.push("enterprise");
  if (securityRequired) capabilities.push("security");
  if (longContext) capabilities.push("long_context");
  if (multiStep) capabilities.push("multi_step");

  if (capabilities.length === 0) capabilities.push("basic_qa");

  let qualityRequirement: "standard" | "advanced" | "maximum" = "standard";

  if (complexity >= 40) qualityRequirement = "advanced";
  if (complexity >= 70) qualityRequirement = "maximum";

  return {
    type,
    complexity,
    confidence: complexity >= 70 ? 0.92 : complexity >= 40 ? 0.86 : 0.8,
    reasoningRequired,
    codingRequired,
    enterpriseRequired,
    longContext,
    multiStep,
    capabilities,
    qualityRequirement,
  };
}
