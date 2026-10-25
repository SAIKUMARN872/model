"use client";

import {
  Cloud,
  Database,
  Mail,
  Network,
  Webhook,
} from "lucide-react";

import Section from "./Section";
import FeatureCard from "./FeatureCard";

type EnterpriseKnowledgeViewProps = {
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
};

const integrations = [
  {
    title: "Cloud Storage",
    description: "Connect enterprise cloud storage sources.",
    icon: Cloud,
  },
  {
    title: "Databases",
    description: "Connect structured enterprise databases.",
    icon: Database,
  },
  {
    title: "Email",
    description: "Ingest knowledge from supported email sources.",
    icon: Mail,
  },
  {
    title: "APIs",
    description: "Connect external systems through APIs.",
    icon: Network,
  },
  {
    title: "Webhooks",
    description: "Receive knowledge updates through webhooks.",
    icon: Webhook,
  },
];

export default function EnterpriseKnowledgeView({
  expandedSections,
  onToggleSection,
}: EnterpriseKnowledgeViewProps) {
  return (
    <div className="space-y-5">
      <Section
        id="enterprise"
        title="Enterprise Knowledge"
        description="Connect enterprise systems and data sources"
        icon={Network}
        expanded={expandedSections.enterprise ?? true}
        onToggle={onToggleSection}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <FeatureCard
              key={integration.title}
              title={integration.title}
              description={integration.description}
              icon={integration.icon}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}