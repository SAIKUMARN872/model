
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Plus,
  Plug,
  ShieldCheck,
  X,
} from "lucide-react-native";

type Plugin = {
  name: string;
  description: string;
  category: string;
  installed: boolean;
};

const INITIAL_PLUGINS: Plugin[] = [
  { name: "Web Search", description: "Search the web for useful information.", category: "Research", installed: false },
  { name: "Tavily", description: "Search and research using web sources.", category: "Research", installed: false },
  { name: "Google Drive", description: "Access and organize cloud files.", category: "Productivity", installed: false },
  { name: "Google Docs", description: "Work with documents and text.", category: "Productivity", installed: false },
  { name: "Google Sheets", description: "Work with spreadsheets and data.", category: "Productivity", installed: false },
  { name: "Google Slides", description: "Create and manage presentations.", category: "Productivity", installed: false },
  { name: "Notion", description: "Organize notes, documents, and projects.", category: "Productivity", installed: false },
  { name: "OneDrive", description: "Store and access cloud files.", category: "Productivity", installed: false },
  { name: "Dropbox", description: "Store and share files securely.", category: "Productivity", installed: false },
  { name: "Word", description: "Create and edit documents.", category: "Productivity", installed: false },
  { name: "Excel", description: "Analyze data and manage spreadsheets.", category: "Productivity", installed: false },
  { name: "Slack", description: "Team messaging and collaboration.", category: "Communication", installed: false },
  { name: "Microsoft Teams", description: "Meetings, chat, and team collaboration.", category: "Communication", installed: false },
  { name: "Discord", description: "Communicate with teams and communities.", category: "Communication", installed: false },
  { name: "Zoom", description: "Meetings and video conferencing.", category: "Communication", installed: false },
  { name: "Gmail", description: "Manage email and inbox workflows.", category: "Email", installed: false },
  { name: "Outlook", description: "Manage email, contacts, and calendars.", category: "Email", installed: false },
  { name: "GitHub", description: "Manage code repositories and development.", category: "Development", installed: false },
  { name: "GitLab", description: "Manage repositories and CI/CD workflows.", category: "Development", installed: false },
  { name: "Bitbucket", description: "Collaborate on source code.", category: "Development", installed: false },
  { name: "Jira", description: "Track issues and manage projects.", category: "Development", installed: false },
  { name: "Linear", description: "Manage issues and development projects.", category: "Development", installed: false },
  { name: "Sentry", description: "Monitor application errors and performance.", category: "Development", installed: false },
  { name: "LinkedIn", description: "Professional networking and career workflows.", category: "Professional", installed: false },
  { name: "Facebook", description: "Manage social media workflows.", category: "Professional", installed: false },
  { name: "Salesforce", description: "Manage customer relationships and sales.", category: "Business", installed: false },
  { name: "HubSpot", description: "Manage marketing, sales, and customer data.", category: "Business", installed: false },
  { name: "Zoho CRM", description: "Manage leads, contacts, and sales pipelines.", category: "Business", installed: false },
  { name: "Zendesk", description: "Manage customer support and tickets.", category: "Business", installed: false },
  { name: "Intercom", description: "Manage customer conversations and support.", category: "Business", installed: false },
  { name: "Google Calendar", description: "Manage events and schedules.", category: "Scheduling", installed: false },
  { name: "Calendly", description: "Schedule meetings and appointments.", category: "Scheduling", installed: false },
  { name: "Zapier", description: "Automate workflows between apps.", category: "Automation", installed: false },
  { name: "Make", description: "Build visual workflow automations.", category: "Automation", installed: false },
  { name: "n8n", description: "Create customizable workflow automations.", category: "Automation", installed: false },
  { name: "Razorpay", description: "Manage payment workflows.", category: "Finance", installed: false },
  { name: "Stripe", description: "Process payments and manage billing.", category: "Finance", installed: false },
  { name: "QuickBooks", description: "Manage accounting and business finances.", category: "Finance", installed: false },
  { name: "Hevy", description: "Track workouts and fitness routines.", category: "Health & Fitness", installed: false },
];

const CATEGORIES = [
  "Research",
  "Communication",
  "Email",
  "Productivity",
  "Development",
  "Business",
  "Professional",
  "Scheduling",
  "Automation",
  "Finance",
  "Health & Fitness",
];

const DOMAINS: Record<string, string> = {
  "Web Search": "google.com",
  Tavily: "tavily.com",
  "Google Drive": "drive.google.com",
  "Google Docs": "docs.google.com",
  "Google Sheets": "sheets.google.com",
  "Google Slides": "slides.google.com",
  Notion: "notion.so",
  OneDrive: "onedrive.live.com",
  Dropbox: "dropbox.com",
  Word: "word.cloud.microsoft",
  Excel: "excel.cloud.microsoft",
  Slack: "slack.com",
  "Microsoft Teams": "teams.microsoft.com",
  Discord: "discord.com",
  Zoom: "zoom.us",
  Gmail: "mail.google.com",
  Outlook: "outlook.live.com",
  GitHub: "github.com",
  GitLab: "gitlab.com",
  Bitbucket: "bitbucket.org",
  Jira: "atlassian.com",
  Linear: "linear.app",
  Sentry: "sentry.io",
  LinkedIn: "linkedin.com",
  Facebook: "facebook.com",
  Salesforce: "salesforce.com",
  HubSpot: "hubspot.com",
  "Zoho CRM": "zoho.com",
  Zendesk: "zendesk.com",
  Intercom: "intercom.com",
  "Google Calendar": "calendar.google.com",
  Calendly: "calendly.com",
  Zapier: "zapier.com",
  Make: "make.com",
  n8n: "n8n.io",
  Razorpay: "razorpay.com",
  Stripe: "stripe.com",
  QuickBooks: "quickbooks.intuit.com",
  Hevy: "hevyapp.com",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Research: "Search the web and discover information.",
  Communication: "Connect messaging and meeting platforms.",
  Email: "Manage your inbox and email workflows.",
  Productivity: "Work with files, documents, and projects.",
  Development: "Connect code, issues, and developer tools.",
  Business: "Connect CRM and customer support tools.",
  Professional: "Connect professional and social platforms.",
  Scheduling: "Manage calendars and appointments.",
  Automation: "Automate repetitive tasks and workflows.",
  Finance: "Connect payments and accounting tools.",
  "Health & Fitness": "Connect fitness and workout tools.",
};

function getPluginUrl(name: string) {
  const domain = DOMAINS[name];
  return domain ? `https://${domain}` : null;
}

function PluginLogo({
  name,
  size = 42,
}: {
  name: string;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const domain = DOMAINS[name];

  return (
    <View style={[styles.logoContainer, { width: size, height: size }]}>
      {!imageFailed && domain ? (
        <Image
          source={{
            uri: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          }}
          style={{ width: size - 10, height: size - 10 }}
          resizeMode="contain"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Text style={styles.logoInitial}>
          {name.slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

function PluginRow({
  plugin,
  onPress,
  onToggle,
}: {
  plugin: Plugin;
  onPress: () => void;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pluginRow,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <PluginLogo name={plugin.name} />

      <View style={styles.pluginInfo}>
        <Text style={styles.pluginName}>{plugin.name}</Text>
        <Text style={styles.pluginDescription} numberOfLines={2}>
          {plugin.description}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          plugin.installed
            ? `Disconnect ${plugin.name}`
            : `Connect ${plugin.name}`
        }
        style={[
          styles.actionButton,
          plugin.installed && styles.connectedButton,
        ]}
        onPress={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        {plugin.installed ? (
          <Check size={19} color="#15803D" />
        ) : (
          <Plus size={20} color="#374151" />
        )}
      </Pressable>
    </Pressable>
  );
}

export default function PluginsPage({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [search, setSearch] = useState("");

  const installedPlugins = useMemo(
    () => plugins.filter((plugin) => plugin.installed),
    [plugins]
  );

  const filteredPlugins = useMemo(() => {
    const query = search.trim().toLowerCase();

    return plugins.filter((plugin) => {
      const matchesCategory =
        !selectedCategory || plugin.category === selectedCategory;

      const matchesSearch =
        !query ||
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [plugins, selectedCategory, search]);

  function updatePluginStatus(name: string, installed: boolean) {
    setPlugins((current) =>
      current.map((plugin) =>
        plugin.name === name ? { ...plugin, installed } : plugin
      )
    );

    setSelectedPlugin((current) =>
      current?.name === name ? { ...current, installed } : current
    );
  }

  async function handleConnect(plugin: Plugin) {
    if (plugin.installed) {
      Alert.alert(
        `Disconnect ${plugin.name}?`,
        "This removes the app from your locally installed list. It does not revoke provider access.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disconnect",
            style: "destructive",
            onPress: () => updatePluginStatus(plugin.name, false),
          },
        ]
      );
      return;
    }

    const url = getPluginUrl(plugin.name);

    Alert.alert(
      `Connect ${plugin.name}`,
      "This opens the provider website. Actual account connection requires ModelNow's OAuth or integration flow.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open website",
          onPress: async () => {
            if (!url) return;

            try {
              await Linking.openURL(url);
            } catch {
              Alert.alert("Unable to open website", "Please try again.");
            }
          },
        },
      ]
    );
  }

  function goBack() {
    if (selectedPlugin) {
      setSelectedPlugin(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onBack?.();
    }
  }

  const pageTitle = selectedPlugin
    ? selectedPlugin.name
    : selectedCategory ?? "Explore plugins";

  function renderPluginList(items: Plugin[]) {
    if (items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Plug size={25} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No apps found</Text>
          <Text style={styles.emptyDescription}>
            Try another search or category.
          </Text>
        </View>
      );
    }

    return items.map((plugin) => (
      <PluginRow
        key={plugin.name}
        plugin={plugin}
        onPress={() => setSelectedPlugin(plugin)}
        onToggle={() => handleConnect(plugin)}
      />
    ));
  }

  function renderCategorySection(category: string) {
    const categoryPlugins = filteredPlugins.filter(
      (plugin) => plugin.category === category
    );

    if (categoryPlugins.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <Pressable
          style={styles.categoryHeader}
          onPress={() => setSelectedCategory(category)}
        >
          <View style={styles.categoryHeadingText}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <Text style={styles.categoryDescription}>
              {CATEGORY_DESCRIPTIONS[category]}
            </Text>
          </View>

          <View style={styles.categoryHeaderRight}>
            <Text style={styles.categoryCount}>{categoryPlugins.length}</Text>
            <ChevronRight size={19} color="#6B7280" />
          </View>
        </Pressable>

        <View style={styles.categoryApps}>
          {renderPluginList(categoryPlugins)}
        </View>
      </View>
    );
  }

  if (selectedPlugin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={21} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>App details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.detailsContent}>
          <View style={styles.detailLogo}>
            <PluginLogo name={selectedPlugin.name} size={76} />
          </View>

          <Text style={styles.detailTitle}>{selectedPlugin.name}</Text>
          <Text style={styles.detailDescription}>
            {selectedPlugin.description}
          </Text>

          <View style={styles.detailCategory}>
            <Text style={styles.detailCategoryText}>
              {selectedPlugin.category}
            </Text>
          </View>

          <Pressable
            style={[
              styles.primaryButton,
              selectedPlugin.installed && styles.disconnectButton,
            ]}
            onPress={() => handleConnect(selectedPlugin)}
          >
            {selectedPlugin.installed ? (
              <Check size={19} color="#15803D" />
            ) : (
              <Plus size={19} color="#FFFFFF" />
            )}
            <Text
              style={[
                styles.primaryButtonText,
                selectedPlugin.installed && styles.disconnectButtonText,
              ]}
            >
              {selectedPlugin.installed ? "Connected locally" : "Connect"}
            </Text>
          </Pressable>

          <View style={styles.securityCard}>
            <ShieldCheck size={23} color="#2563EB" />
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>
                Secure account connection
              </Text>
              <Text style={styles.securityDescription}>
                Provider authentication and permissions must be configured
                before ModelNow can access your account. Opening a website
                alone does not connect your account.
              </Text>
            </View>
          </View>

          <View style={styles.detailInfoCard}>
            <Text style={styles.detailInfoLabel}>Provider website</Text>
            <Text style={styles.detailInfoValue}>
              {DOMAINS[selectedPlugin.name] ?? "Not available"}
            </Text>
            <Text style={styles.detailInfoLabel}>Category</Text>
            <Text style={styles.detailInfoValue}>
              {selectedPlugin.category}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <ArrowLeft size={21} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>{pageTitle}</Text>

        {selectedCategory ? (
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={styles.headerAction}
          >
            <X size={20} color="#374151" />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {!selectedCategory ? (
          <>
      

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <Text style={styles.searchPlaceholder}>
                All apps are listed below
              </Text>
            </View>

            {installedPlugins.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Installed</Text>
                <Text style={styles.sectionSubtitle}>
                  Apps you've added to your list
                </Text>
                {renderPluginList(installedPlugins)}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Explore categories</Text>
              <Text style={styles.sectionSubtitle}>
                Browse every category and its apps.
              </Text>
              {CATEGORIES.map(renderCategorySection)}
            </View>

            <View style={styles.footerNote}>
              <ShieldCheck size={17} color="#6B7280" />
              <Text style={styles.footerText}>
                Actual integrations require provider authorization and backend
                configuration.
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.categoryPageIntro}>
              <Text style={styles.categoryPageTitle}>{selectedCategory}</Text>
              <Text style={styles.categoryPageDescription}>
                {CATEGORY_DESCRIPTIONS[selectedCategory]}
              </Text>
            </View>
            {renderPluginList(filteredPlugins)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },
  headerSpacer: {
    width: 24,
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 17,
    paddingBottom: 36,
  },
  hero: {
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: "center",
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 330,
  },
  searchBox: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 23,
    color: "#6B7280",
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
    marginBottom: 13,
  },

  // Flat category layout: no outer border, card background, or rounded box.
  categorySection: {
    marginTop: 8,
    marginBottom: 19,
    backgroundColor: "#FFFFFF",
  },
  categoryHeader: {
    minHeight: 70,
    paddingHorizontal: 4,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  categoryHeadingText: {
    flex: 1,
    paddingRight: 8,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  categoryDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
    marginTop: 3,
  },
  categoryHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  categoryCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  categoryApps: {
    paddingHorizontal: 0,
  },
  pluginRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  pressed: {
    opacity: 0.72,
  },
  logoContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoInitial: {
    fontSize: 17,
    fontWeight: "800",
    color: "#374151",
  },
  pluginInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  pluginName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  pluginDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
    marginTop: 3,
  },
  actionButton: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  connectedButton: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  categoryPageIntro: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  categoryPageTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
  },
  categoryPageDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
    lineHeight: 19,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 10,
  },
  emptyDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 5,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#6B7280",
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
    alignItems: "center",
  },
  detailLogo: {
    marginTop: 35,
    marginBottom: 17,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  detailDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 320,
  },
  detailCategory: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
  },
  detailCategoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  primaryButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 25,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disconnectButton: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  disconnectButtonText: {
    color: "#15803D",
  },
  securityCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 15,
    gap: 11,
    marginTop: 20,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  securityDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: "#1D4ED8",
    marginTop: 5,
  },
  detailInfoCard: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    marginTop: 16,
  },
  detailInfoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
  },
  detailInfoValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginTop: 4,
  },
});
