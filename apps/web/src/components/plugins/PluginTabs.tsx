"use client";

type PluginTab =
  | "Browse Plugins"
  | "Connect"
  | "Settings";

type PluginTabsProps = {
  activeTab: PluginTab;
  onChange: (tab: PluginTab) => void;
};

const tabs: PluginTab[] = [
  "Browse Plugins",
  "Connect",
  "Settings",
];

export default function PluginTabs({
  activeTab,
  onChange,
}: PluginTabsProps) {
  return (
    <div className="mb-8 border-b border-[#eeeeef]">
      <div className="flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`relative pb-3 text-sm font-medium transition ${
                isActive
                  ? "text-[#17181a]"
                  : "text-[#85898f] hover:text-[#555a60]"
              }`}
            >
              {tab}

              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#17181a]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}