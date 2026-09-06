import PropTypes from "prop-types";

/**
 * =========================================================
 * Common Types
 * =========================================================
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} [success]
 * @property {*} [data]
 * @property {string} [message]
 * @property {Object} [meta]
 */

/**
 * @typedef {Object} ApiErrorResponse
 * @property {string} [code]
 * @property {string} [message]
 * @property {number} [status]
 * @property {Object} [details]
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 */

/**
 * @typedef {Object} DateRange
 * @property {string} startDate
 * @property {string} endDate
 */

/**
 * =========================================================
 * User & Authentication
 * =========================================================
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} [name]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [avatar]
 * @property {string} [role]
 * @property {string[]} [permissions]
 * @property {string} [organizationId]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} AuthSession
 * @property {string} accessToken
 * @property {string} [refreshToken]
 * @property {number} [expiresIn]
 * @property {User} user
 */

/**
 * =========================================================
 * Organization & Teams
 * =========================================================
 */

/**
 * @typedef {Object} Organization
 * @property {string} id
 * @property {string} name
 * @property {string} [slug]
 * @property {string} [plan]
 * @property {string} [status]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} TeamMember
 * @property {string} id
 * @property {string} userId
 * @property {string} email
 * @property {string} [name]
 * @property {string} role
 * @property {string} status
 * @property {string} [joinedAt]
 */

/**
 * =========================================================
 * Models
 * =========================================================
 */

/**
 * @typedef {Object} Model
 * @property {string} id
 * @property {string} name
 * @property {string} [displayName]
 * @property {string} provider
 * @property {string} [description]
 * @property {string} [version]
 * @property {boolean} [enabled]
 * @property {boolean} [available]
 * @property {number} [contextWindow]
 * @property {number} [maxOutputTokens]
 * @property {number} [inputPrice]
 * @property {number} [outputPrice]
 * @property {string} [currency]
 * @property {string[]} [capabilities]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} ModelParameters
 * @property {number} [temperature]
 * @property {number} [topP]
 * @property {number} [maxTokens]
 * @property {number} [frequencyPenalty]
 * @property {number} [presencePenalty]
 * @property {number} [topK]
 * @property {number} [seed]
 */

/**
 * =========================================================
 * API Keys
 * =========================================================
 */

/**
 * @typedef {Object} ApiKey
 * @property {string} id
 * @property {string} name
 * @property {string} [prefix]
 * @property {string} [key]
 * @property {string} [lastFour]
 * @property {string} [environment]
 * @property {string} [status]
 * @property {string} [createdAt]
 * @property {string} [expiresAt]
 * @property {string} [lastUsedAt]
 * @property {string[]} [permissions]
 */

/**
 * =========================================================
 * Agents
 * =========================================================
 */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [modelId]
 * @property {string} [status]
 * @property {string} [version]
 * @property {Object} [configuration]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * =========================================================
 * Prompts
 * =========================================================
 */

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} content
 * @property {string} [version]
 * @property {string} [status]
 * @property {string} [modelId]
 * @property {Object} [variables]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * =========================================================
 * Playground
 * =========================================================
 */

/**
 * @typedef {Object} PlaygroundMessage
 * @property {string} id
 * @property {"system"|"user"|"assistant"|"tool"} role
 * @property {string} content
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} PlaygroundRequest
 * @property {string} model
 * @property {PlaygroundMessage[]} messages
 * @property {ModelParameters} [parameters]
 * @property {boolean} [stream]
 */

/**
 * @typedef {Object} PlaygroundResponse
 * @property {string} [id]
 * @property {string} [model]
 * @property {string} [content]
 * @property {string} [finishReason]
 * @property {number} [promptTokens]
 * @property {number} [completionTokens]
 * @property {number} [totalTokens]
 * @property {number} [latency]
 * @property {string} [createdAt]
 */

/**
 * =========================================================
 * Usage & Analytics
 * =========================================================
 */

/**
 * @typedef {Object} UsageOverview
 * @property {number} [totalRequests]
 * @property {number} [totalTokens]
 * @property {number} [inputTokens]
 * @property {number} [outputTokens]
 * @property {number} [totalCost]
 * @property {number} [averageLatency]
 * @property {number} [errorRate]
 */

/**
 * @typedef {Object} UsageTrend
 * @property {string} date
 * @property {number} [requests]
 * @property {number} [tokens]
 * @property {number} [inputTokens]
 * @property {number} [outputTokens]
 * @property {number} [cost]
 * @property {number} [latency]
 */

/**
 * @typedef {Object} TokenUsage
 * @property {number} [inputTokens]
 * @property {number} [outputTokens]
 * @property {number} [totalTokens]
 * @property {number} [averageTokensPerRequest]
 */

/**
 * @typedef {Object} RequestUsage
 * @property {number} [totalRequests]
 * @property {number} [successfulRequests]
 * @property {number} [failedRequests]
 * @property {number} [errorRate]
 */

/**
 * @typedef {Object} CostBreakdown
 * @property {number} [totalCost]
 * @property {number} [inputCost]
 * @property {number} [outputCost]
 * @property {Array} [byModel]
 * @property {Array} [byProvider]
 * @property {Array} [byEnvironment]
 */

/**
 * @typedef {Object} UsageLimit
 * @property {string} [id]
 * @property {string} type
 * @property {number} limit
 * @property {number} used
 * @property {number} [remaining]
 * @property {string} [period]
 */

/**
 * =========================================================
 * Analytics
 * =========================================================
 */

/**
 * @typedef {Object} AnalyticsMetric
 * @property {string} name
 * @property {number} value
 * @property {number} [previousValue]
 * @property {number} [change]
 * @property {"increase"|"decrease"|"neutral"} [trend]
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {AnalyticsMetric[]} [metrics]
 * @property {UsageTrend[]} [trends]
 * @property {Object[]} [breakdowns]
 */

/**
 * =========================================================
 * Cost
 * =========================================================
 */

/**
 * @typedef {Object} CostMetric
 * @property {number} [total]
 * @property {number} [input]
 * @property {number} [output]
 * @property {number} [average]
 * @property {string} [currency]
 */

/**
 * @typedef {Object} CostTrend
 * @property {string} date
 * @property {number} cost
 */

/**
 * =========================================================
 * Latency
 * =========================================================
 */

/**
 * @typedef {Object} LatencyMetric
 * @property {number} [average]
 * @property {number} [p50]
 * @property {number} [p75]
 * @property {number} [p90]
 * @property {number} [p95]
 * @property {number} [p99]
 */

/**
 * @typedef {Object} LatencyTrend
 * @property {string} date
 * @property {number} latency
 */

/**
 * =========================================================
 * Logs
 * =========================================================
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} id
 * @property {string} timestamp
 * @property {"debug"|"info"|"warn"|"error"|"fatal"} level
 * @property {string} message
 * @property {string} [service]
 * @property {string} [requestId]
 * @property {string} [userId]
 * @property {string} [modelId]
 * @property {Object} [metadata]
 */

/**
 * =========================================================
 * Governance
 * =========================================================
 */

/**
 * @typedef {Object} Policy
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} status
 * @property {string} [version]
 * @property {Object} [rules]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} ApprovalRequest
 * @property {string} id
 * @property {string} type
 * @property {string} status
 * @property {string} requestedBy
 * @property {string} [approvedBy]
 * @property {string} [reason]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} AuditEvent
 * @property {string} id
 * @property {string} action
 * @property {string} actor
 * @property {string} [resource]
 * @property {string} [resourceId]
 * @property {string} timestamp
 * @property {Object} [metadata]
 */

/**
 * =========================================================
 * Security
 * =========================================================
 */

/**
 * @typedef {Object} SecurityEvent
 * @property {string} id
 * @property {string} type
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {string} [description]
 * @property {string} timestamp
 * @property {string} [status]
 */

/**
 * =========================================================
 * Billing
 * =========================================================
 */

/**
 * @typedef {Object} BillingAccount
 * @property {string} id
 * @property {string} plan
 * @property {string} status
 * @property {string} [currency]
 * @property {number} [balance]
 * @property {string} [billingCycle]
 * @property {string} [nextBillingDate]
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} number
 * @property {number} amount
 * @property {string} [currency]
 * @property {"draft"|"open"|"paid"|"void"|"uncollectible"} status
 * @property {string} [invoiceDate]
 * @property {string} [dueDate]
 */

/**
 * =========================================================
 * Integrations
 * =========================================================
 */

/**
 * @typedef {Object} Integration
 * @property {string} id
 * @property {string} name
 * @property {string} provider
 * @property {string} status
 * @property {Object} [configuration]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * =========================================================
 * Navigation
 * =========================================================
 */

/**
 * @typedef {Object} NavigationItem
 * @property {string} label
 * @property {string} path
 * @property {string} [icon]
 * @property {string[]} [permissions]
 * @property {NavigationItem[]} [children]
 */

/**
 * =========================================================
 * Filters
 * =========================================================
 */

/**
 * @typedef {Object} UsageFilters
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} [interval]
 * @property {string} [modelId]
 * @property {string} [provider]
 * @property {string} [environment]
 * @property {string} [apiKeyId]
 * @property {string} [userId]
 */

/**
 * @typedef {Object} LogFilters
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} [level]
 * @property {string} [service]
 * @property {string} [requestId]
 * @property {string} [search]
 */

/**
 * =========================================================
 * Generic Component PropTypes
 * =========================================================
 */

export const CommonPropTypes = {
  id: PropTypes.string,

  className:
    PropTypes.string,

  children:
    PropTypes.node,
};

/**
 * =========================================================
 * Status Constants
 * =========================================================
 */

export const STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  DISABLED: "disabled",
  ENABLED: "enabled",
  SUCCESS: "success",
  FAILED: "failed",
  ERROR: "error",
});

/**
 * =========================================================
 * Log Levels
 * =========================================================
 */

export const LOG_LEVELS = Object.freeze({
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  FATAL: "fatal",
});

/**
 * =========================================================
 * Environment Types
 * =========================================================
 */

export const ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
  TEST: "test",
});

/**
 * =========================================================
 * Billing Plans
 * =========================================================
 */

export const BILLING_PLANS = Object.freeze({
  FREE: "free",
  STARTER: "starter",
  PROFESSIONAL: "professional",
  ENTERPRISE: "enterprise",
});

/**
 * =========================================================
 * Export
 * =========================================================
 */

export default {
  STATUS,
  LOG_LEVELS,
  ENVIRONMENTS,
  BILLING_PLANS,
  CommonPropTypes,
};