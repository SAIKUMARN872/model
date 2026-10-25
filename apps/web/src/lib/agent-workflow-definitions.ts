import type { AgentId } from "./agent-workflows-api";

export type AgentWorkflowStage = {
  id: string;
  name: string;
};

export type AgentWorkflowDefinition = {
  agentId: AgentId;
  workflowId: string;
  stages: AgentWorkflowStage[];
};

/* -------------------------------------------------------------------------- */
/* Business Support                                                           */
/* -------------------------------------------------------------------------- */

export const BUSINESS_SUPPORT_WORKFLOW: AgentWorkflowDefinition = {
  agentId: "business-support",
  workflowId: "business-support-default",
  stages: [
    {
      id: "customer-request",
      name: "Customer Request",
    },
    {
      id: "understand",
      name: "Understand",
    },
    {
      id: "knowledge-search",
      name: "Knowledge Search",
    },
    {
      id: "resolve",
      name: "Resolve",
    },
    {
      id: "create-ticket",
      name: "Create Ticket",
    },
    {
      id: "escalate-if-necessary",
      name: "Escalate if necessary",
    },
    {
      id: "verify",
      name: "Verify",
    },
    {
      id: "close",
      name: "Close",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* CRM                                                                          */
/* -------------------------------------------------------------------------- */

export const CRM_WORKFLOW: AgentWorkflowDefinition = {
  agentId: "crm",
  workflowId: "crm-default",
  stages: [
    {
      id: "customer",
      name: "Customer",
    },
    {
      id: "lead",
      name: "Lead",
    },
    {
      id: "qualification",
      name: "Qualification",
    },
    {
      id: "opportunity",
      name: "Opportunity",
    },
    {
      id: "follow-up",
      name: "Follow-up",
    },
    {
      id: "quote",
      name: "Quote",
    },
    {
      id: "approval",
      name: "Approval",
    },
    {
      id: "deal",
      name: "Deal",
    },
    {
      id: "close",
      name: "Close",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* ERP                                                                          */
/* -------------------------------------------------------------------------- */

export const ERP_WORKFLOW: AgentWorkflowDefinition = {
  agentId: "erp",
  workflowId: "erp-default",
  stages: [
    {
      id: "request",
      name: "Request",
    },
    {
      id: "inventory-procurement",
      name: "Inventory / Procurement",
    },
    {
      id: "purchase-order",
      name: "Purchase Order",
    },
    {
      id: "approval",
      name: "Approval",
    },
    {
      id: "supplier",
      name: "Supplier",
    },
    {
      id: "goods-service",
      name: "Goods / Service",
    },
    {
      id: "invoice",
      name: "Invoice",
    },
    {
      id: "payment",
      name: "Payment",
    },
    {
      id: "accounting",
      name: "Accounting",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* HR                                                                           */
/* -------------------------------------------------------------------------- */

export const HR_WORKFLOW: AgentWorkflowDefinition = {
  agentId: "hr",
  workflowId: "hr-default",
  stages: [
    {
      id: "employee-request",
      name: "Employee Request",
    },
    {
      id: "employee-record",
      name: "Employee Record",
    },
    {
      id: "policy-knowledge",
      name: "Policy / Knowledge",
    },
    {
      id: "approval",
      name: "Approval",
    },
    {
      id: "hr-action",
      name: "HR Action",
    },
    {
      id: "notification",
      name: "Notification",
    },
    {
      id: "audit",
      name: "Audit",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Sales                                                                        */
/* -------------------------------------------------------------------------- */

export const SALES_WORKFLOW: AgentWorkflowDefinition = {
  agentId: "sales",
  workflowId: "sales-default",
  stages: [
    {
      id: "lead",
      name: "Lead",
    },
    {
      id: "research",
      name: "Research",
    },
    {
      id: "qualification",
      name: "Qualification",
    },
    {
      id: "opportunity",
      name: "Opportunity",
    },
    {
      id: "outreach",
      name: "Outreach",
    },
    {
      id: "meeting",
      name: "Meeting",
    },
    {
      id: "proposal",
      name: "Proposal",
    },
    {
      id: "negotiation",
      name: "Negotiation",
    },
    {
      id: "close",
      name: "Close",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Finance                                                                      */
/* -------------------------------------------------------------------------- */

export const FINANCE_WORKFLOW: AgentWorkflowDefinition = {
  agentId: "finance",
  workflowId: "finance-default",
  stages: [
    {
      id: "financial-request",
      name: "Financial Request",
    },
    {
      id: "data-retrieval",
      name: "Data Retrieval",
    },
    {
      id: "analysis",
      name: "Analysis",
    },
    {
      id: "validation",
      name: "Validation",
    },
    {
      id: "approval",
      name: "Approval",
    },
    {
      id: "transaction",
      name: "Transaction",
    },
    {
      id: "reconciliation",
      name: "Reconciliation",
    },
    {
      id: "audit",
      name: "Audit",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Custom Enterprise Agent                                                     */
/* -------------------------------------------------------------------------- */

export const CUSTOM_ENTERPRISE_WORKFLOW: AgentWorkflowDefinition = {
  agentId: "custom-enterprise",
  workflowId: "custom-enterprise",
  stages: [
    {
      id: "organization-defines",
      name: "Organization defines",
    },
    {
      id: "custom-agent",
      name: "Custom Agent",
    },
    {
      id: "custom-workflow",
      name: "Custom workflow",
    },
    {
      id: "custom-tools",
      name: "Custom tools",
    },
    {
      id: "custom-connectors",
      name: "Custom connectors",
    },
    {
      id: "modelnow-execution-platform",
      name: "ModelNow execution platform",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Reusable stage-name exports                                                 */
/* -------------------------------------------------------------------------- */

export const BUSINESS_SUPPORT_STEPS =
  BUSINESS_SUPPORT_WORKFLOW.stages.map(
    (stage) => stage.name,
  );

export const CRM_STEPS =
  CRM_WORKFLOW.stages.map(
    (stage) => stage.name,
  );

export const ERP_STEPS =
  ERP_WORKFLOW.stages.map(
    (stage) => stage.name,
  );

export const HR_STEPS =
  HR_WORKFLOW.stages.map(
    (stage) => stage.name,
  );

export const SALES_STEPS =
  SALES_WORKFLOW.stages.map(
    (stage) => stage.name,
  );

export const FINANCE_STEPS =
  FINANCE_WORKFLOW.stages.map(
    (stage) => stage.name,
  );

export const CUSTOM_ENTERPRISE_STEPS =
  CUSTOM_ENTERPRISE_WORKFLOW.stages.map(
    (stage) => stage.name,
  );

/* -------------------------------------------------------------------------- */
/* Complete workflow registry                                                  */
/* -------------------------------------------------------------------------- */

export const AGENT_WORKFLOW_DEFINITIONS: Record<
  AgentId,
  AgentWorkflowDefinition
> = {
  "business-support":
    BUSINESS_SUPPORT_WORKFLOW,

  crm:
    CRM_WORKFLOW,

  erp:
    ERP_WORKFLOW,

  hr:
    HR_WORKFLOW,

  sales:
    SALES_WORKFLOW,

  finance:
    FINANCE_WORKFLOW,

  "custom-enterprise":
    CUSTOM_ENTERPRISE_WORKFLOW,
};