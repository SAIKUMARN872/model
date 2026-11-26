
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Code2,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react-native";

type Skill = {
  id: string;
  name: string;
  description: string;
  publisher: string;
  category: string;
  enabled: boolean;
  custom?: boolean;
};

type Connector = {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
};

type WorkspaceFile = {
  id: string;
  name: string;
  kind: "file" | "component";
  content: string;
};

type Props = {
  onBack: () => void;
  onTrySkill?: (name: string) => void;
};

const CATEGORIES = [
  "Productivity",
  "Development",
  "Design",
  "Research",
  "Writing",
  "Marketing",
  "Business",
  "Education",
  "Other",
];

const INITIAL_SKILLS: Skill[] = [
  {
    id: "design",
    name: "Design",
    description: "Explore design ideas, layouts, and visual concepts.",
    publisher: "ModelNow",
    category: "Design",
    enabled: false,
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Work through technical and engineering problems.",
    publisher: "ModelNow",
    category: "Development",
    enabled: false,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Get help with design workflows and interface concepts.",
    publisher: "ModelNow",
    category: "Design",
    enabled: false,
  },
  {
    id: "searchfit-seo",
    name: "SearchFit SEO",
    description: "Improve content discoverability and SEO planning.",
    publisher: "ModelNow",
    category: "Marketing",
    enabled: false,
  },
  {
    id: "desktop-commander",
    name: "Desktop Commander",
    description: "Plan desktop tasks and organize computer workflows.",
    publisher: "ModelNow",
    category: "Productivity",
    enabled: false,
  },
  {
    id: "research-assistant",
    name: "Research Assistant",
    description: "Research topics and organize findings into useful summaries.",
    publisher: "ModelNow",
    category: "Research",
    enabled: true,
  },
  {
    id: "writing-assistant",
    name: "Writing Assistant",
    description: "Draft, revise, and improve written content.",
    publisher: "ModelNow",
    category: "Writing",
    enabled: false,
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Review code for readability and possible issues.",
    publisher: "ModelNow",
    category: "Development",
    enabled: true,
  },
  {
    id: "corbis",
    name: "Corbis",
    description: "Assist with creative content and visual exploration.",
    publisher: "ModelNow",
    category: "Design",
    enabled: false,
  },
  {
    id: "finance-tutor",
    name: "Finance Tutor",
    description: "Understand financial concepts and calculations.",
    publisher: "ModelNow",
    category: "Education",
    enabled: false,
  },
  {
    id: "euler-partner-managers",
    name: "EULER for Partner Managers",
    description: "Organize partner communications and business workflows.",
    publisher: "ModelNow",
    category: "Business",
    enabled: false,
  },
  {
    id: "learn",
    name: "Learn",
    description: "Break topics into understandable learning steps.",
    publisher: "ModelNow",
    category: "Education",
    enabled: false,
  },
  {
    id: "doc-coauthoring",
    name: "Doc Coauthoring",
    description: "Collaborate on document drafts and revisions.",
    publisher: "ModelNow",
    category: "Writing",
    enabled: false,
  },
  {
    id: "web-artifacts-builder",
    name: "Web Artifacts Builder",
    description: "Plan and build web interface components.",
    publisher: "ModelNow",
    category: "Development",
    enabled: false,
  },
];

const INITIAL_CONNECTORS: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Work with repositories, issues, and development workflows.",
    category: "Development",
    enabled: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Connect files and documents from Google Drive.",
    category: "Productivity",
    enabled: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect team conversations and workspace information.",
    category: "Productivity",
    enabled: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect notes, pages, and knowledge resources.",
    category: "Productivity",
    enabled: false,
  },
  {
    id: "web-search",
    name: "Web Search",
    description: "Enable web-search access when a real integration is configured.",
    category: "Research",
    enabled: false,
  },
  {
    id: "file-workspace",
    name: "File Workspace",
    description: "Organize files created within this workspace.",
    category: "Productivity",
    enabled: false,
  },
];

const COMPONENT_TEMPLATE = `import React from "react";

export default function CustomComponent() {
  return (
    <div>
      <h1>Hello from ModelNow</h1>
    </div>
  );
}`;

export default function CustomizePage({
  onBack,
  onTrySkill,
}: Props) {
  const [tab, setTab] = useState<"Skills" | "Connectors">("Skills");
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [skillCategory, setSkillCategory] = useState("Productivity");
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [workspaceKind, setWorkspaceKind] = useState<"file" | "component">("file");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceContent, setWorkspaceContent] = useState("");

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase();

    return skills.filter((skill) =>
      [skill.name, skill.description, skill.publisher, skill.category]
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [skills, query]);

  const filteredConnectors = useMemo(() => {
    const q = query.trim().toLowerCase();

    return connectors.filter((connector) =>
      [connector.name, connector.description, connector.category]
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [connectors, query]);

  const enabledSkillCount = skills.filter((skill) => skill.enabled).length;
  const enabledConnectorCount = connectors.filter(
    (connector) => connector.enabled,
  ).length;

  const closeSkillModal = () => {
    setModalVisible(false);
    setEditingSkill(null);
    setSkillName("");
    setSkillDescription("");
    setSkillCategory("Productivity");
  };

  const openCreateSkill = () => {
    setEditingSkill(null);
    setSkillName("");
    setSkillDescription("");
    setSkillCategory("Productivity");
    setModalVisible(true);
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillName(skill.name);
    setSkillDescription(skill.description);
    setSkillCategory(skill.category);
    setModalVisible(true);
  };

  const saveSkill = () => {
    const name = skillName.trim();
    const description = skillDescription.trim();

    if (!name || !description) {
      Alert.alert(
        "Missing information",
        "Enter both a skill name and a description.",
      );
      return;
    }

    if (editingSkill) {
      setSkills((previous) =>
        previous.map((skill) =>
          skill.id === editingSkill.id
            ? {
                ...skill,
                name,
                description,
                category: skillCategory,
              }
            : skill,
        ),
      );
    } else {
      const newSkill: Skill = {
        id: `custom-${Date.now()}`,
        name,
        description,
        publisher: "You",
        category: skillCategory,
        enabled: true,
        custom: true,
      };

      setSkills((previous) => [newSkill, ...previous]);
    }

    closeSkillModal();
  };

  const toggleSkill = (id: string) => {
    setSkills((previous) =>
      previous.map((skill) =>
        skill.id === id
          ? { ...skill, enabled: !skill.enabled }
          : skill,
      ),
    );
  };

  const deleteSkill = (skill: Skill) => {
    if (!skill.custom) {
      Alert.alert(
        "Built-in skill",
        "Built-in skills cannot be deleted. You can disable them instead.",
      );
      return;
    }

    Alert.alert(
      "Delete skill?",
      `Delete "${skill.name}" from this session?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setSkills((previous) =>
              previous.filter((item) => item.id !== skill.id),
            ),
        },
      ],
    );
  };

  const toggleConnector = (id: string) => {
    setConnectors((previous) =>
      previous.map((connector) =>
        connector.id === id
          ? { ...connector, enabled: !connector.enabled }
          : connector,
      ),
    );
  };

  const openWorkspaceModal = (kind: "file" | "component") => {
    setWorkspaceKind(kind);
    setWorkspaceName(kind === "component" ? "CustomComponent" : "notes.txt");
    setWorkspaceContent(kind === "component" ? COMPONENT_TEMPLATE : "");
    setWorkspaceModalVisible(true);
  };

  const saveWorkspaceFile = () => {
    const name = workspaceName.trim();

    if (!name) {
      Alert.alert("File name required", "Enter a name before saving.");
      return;
    }

    const finalName =
      workspaceKind === "component" && !name.endsWith(".tsx")
        ? `${name}.tsx`
        : name;

    setWorkspaceFiles((previous) => [
      {
        id: `workspace-${Date.now()}`,
        name: finalName,
        kind: workspaceKind,
        content: workspaceContent,
      },
      ...previous,
    ]);

    setWorkspaceModalVisible(false);
  };

  const removeWorkspaceFile = (id: string) => {
    setWorkspaceFiles((previous) =>
      previous.filter((file) => file.id !== id),
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to chat"
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={21} color="#18181B" />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Customize</Text>
          <Text style={styles.headerSubtitle}>
            Configure your ModelNow workspace
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Zap size={23} color="#6D28D9" />
          </View>
          <Text style={styles.introTitle}>Make ModelNow yours</Text>
          <Text style={styles.introText}>
            Manage skills, explore connectors, and organize your workspace.
          </Text>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => {
              setTab("Skills");
              setQuery("");
            }}
            style={[styles.tab, tab === "Skills" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                tab === "Skills" && styles.activeTabText,
              ]}
            >
              Skills ({skills.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setTab("Connectors");
              setQuery("");
            }}
            style={[styles.tab, tab === "Connectors" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                tab === "Connectors" && styles.activeTabText,
              ]}
            >
              Connectors ({connectors.length})
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Search size={19} color="#71717A" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${tab.toLowerCase()}...`}
            placeholderTextColor="#A1A1AA"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <X size={18} color="#71717A" />
            </Pressable>
          )}
        </View>

        {tab === "Skills" ? (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Your skills</Text>
                <Text style={styles.sectionSubtitle}>
                  {enabledSkillCount} enabled
                </Text>
              </View>
              <Pressable
                onPress={openCreateSkill}
                style={styles.primaryButton}
              >
                <Plus size={17} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Create</Text>
              </Pressable>
            </View>

            {filteredSkills.length === 0 ? (
              <EmptyState text="No skills match your search." />
            ) : (
              filteredSkills.map((skill) => (
                <View key={skill.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.skillIcon}>
                      <Zap size={20} color="#6D28D9" />
                    </View>
                    <View style={styles.cardTitleWrap}>
                      <Text style={styles.cardTitle}>{skill.name}</Text>
                      <Text style={styles.publisher}>
                        By {skill.publisher}
                        {skill.custom ? " · Custom" : ""}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${skill.name}`}
                      onPress={() => openEditSkill(skill)}
                      style={styles.iconButton}
                    >
                      <Pencil size={17} color="#52525B" />
                    </Pressable>
                  </View>

                  <Text style={styles.cardDescription}>
                    {skill.description}
                  </Text>

                  <View style={styles.cardBottom}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryText}>{skill.category}</Text>
                    </View>

                    <View style={styles.cardActions}>
                      {skill.custom && (
                        <Pressable
                          onPress={() => deleteSkill(skill)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color="#DC2626" />
                        </Pressable>
                      )}

                      <Pressable
                        onPress={() => {
                          if (onTrySkill) {
                            onTrySkill(skill.name);
                          } else {
                            Alert.alert(
                              "Try skill",
                              `To use ${skill.name}, connect this action to your chat screen.`,
                            );
                          }
                        }}
                        style={styles.secondaryButton}
                      >
                        <Text style={styles.secondaryButtonText}>Try</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => toggleSkill(skill.id)}
                        style={[
                          styles.toggleButton,
                          skill.enabled && styles.toggleButtonEnabled,
                        ]}
                      >
                        {skill.enabled && (
                          <Check size={15} color="#FFFFFF" />
                        )}
                        <Text
                          style={[
                            styles.toggleButtonText,
                            skill.enabled && styles.toggleButtonTextEnabled,
                          ]}
                        >
                          {skill.enabled ? "Added" : "Add"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Connectors</Text>
                <Text style={styles.sectionSubtitle}>
                  {enabledConnectorCount} enabled
                </Text>
              </View>
            </View>

            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                Connector switches are local previews. A real connection
                requires the corresponding service integration and permissions.
              </Text>
            </View>

            {filteredConnectors.length === 0 ? (
              <EmptyState text="No connectors match your search." />
            ) : (
              filteredConnectors.map((connector) => (
                <View key={connector.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.connectorIcon}>
                      <Code2 size={20} color="#52525B" />
                    </View>
                    <View style={styles.cardTitleWrap}>
                      <Text style={styles.cardTitle}>{connector.name}</Text>
                      <Text style={styles.publisher}>
                        {connector.category}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusDot,
                        connector.enabled && styles.statusDotEnabled,
                      ]}
                    />
                  </View>

                  <Text style={styles.cardDescription}>
                    {connector.description}
                  </Text>

                  <View style={styles.connectorBottom}>
                    <Text
                      style={[
                        styles.statusText,
                        connector.enabled && styles.statusTextEnabled,
                      ]}
                    >
                      {connector.enabled ? "Enabled" : "Not connected"}
                    </Text>

                    <Pressable
                      onPress={() => toggleConnector(connector.id)}
                      style={[
                        styles.toggleButton,
                        connector.enabled && styles.toggleButtonEnabled,
                      ]}
                    >
                      {connector.enabled && (
                        <Check size={15} color="#FFFFFF" />
                      )}
                      <Text
                        style={[
                          styles.toggleButtonText,
                          connector.enabled && styles.toggleButtonTextEnabled,
                        ]}
                      >
                        {connector.enabled ? "Enabled" : "Connect"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={styles.workspaceHeader}>
          <View style={styles.workspaceHeadingIcon}>
            <FileText size={20} color="#6D28D9" />
          </View>
          <View style={styles.workspaceHeadingText}>
            <Text style={styles.sectionTitle}>Workspace files</Text>
            <Text style={styles.sectionSubtitle}>
              Create and organize files for this session
            </Text>
          </View>
        </View>

        <View style={styles.workspaceActions}>
          <Pressable
            onPress={() => openWorkspaceModal("file")}
            style={styles.workspaceAction}
          >
            <FileText size={19} color="#6D28D9" />
            <Text style={styles.workspaceActionText}>Create file</Text>
          </Pressable>

          <Pressable
            onPress={() => openWorkspaceModal("component")}
            style={styles.workspaceAction}
          >
            <Code2 size={19} color="#6D28D9" />
            <Text style={styles.workspaceActionText}>Create component</Text>
          </Pressable>
        </View>

        {workspaceFiles.length === 0 ? (
          <View style={styles.emptyWorkspace}>
            <FileText size={27} color="#A1A1AA" />
            <Text style={styles.emptyWorkspaceTitle}>No workspace files yet</Text>
            <Text style={styles.emptyWorkspaceText}>
              Create a text file or a component template to get started.
            </Text>
          </View>
        ) : (
          workspaceFiles.map((file) => (
            <View key={file.id} style={styles.fileRow}>
              <View style={styles.fileIcon}>
                {file.kind === "component" ? (
                  <Code2 size={19} color="#6D28D9" />
                ) : (
                  <FileText size={19} color="#6D28D9" />
                )}
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileMeta}>
                  {file.kind === "component" ? "Component" : "Text file"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${file.name}`}
                onPress={() => removeWorkspaceFile(file.id)}
                style={styles.iconButton}
              >
                <Trash2 size={17} color="#DC2626" />
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.footerNote}>
          Changes currently remain in this screen's memory. Persistent storage
          and actual connector integrations can be added separately.
        </Text>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSkillModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeSkillModal}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSkill ? "Edit skill" : "Create skill"}
              </Text>
              <Pressable onPress={closeSkillModal} style={styles.iconButton}>
                <X size={21} color="#52525B" />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Skill name</Text>
            <TextInput
              value={skillName}
              onChangeText={setSkillName}
              placeholder="e.g. Product Research"
              placeholderTextColor="#A1A1AA"
              style={styles.fieldInput}
              maxLength={80}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={skillDescription}
              onChangeText={setSkillDescription}
              placeholder="Describe what this skill should help with"
              placeholderTextColor="#A1A1AA"
              style={[styles.fieldInput, styles.multilineInput]}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <Pressable
              onPress={() => setCategoryPickerVisible(true)}
              style={styles.categorySelector}
            >
              <Text style={styles.categorySelectorText}>{skillCategory}</Text>
              <ChevronDown size={18} color="#71717A" />
            </Pressable>

            <Pressable onPress={saveSkill} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {editingSkill ? "Save changes" : "Create skill"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCategoryPickerVisible(false)}
          />
          <View style={styles.categorySheet}>
            <Text style={styles.modalTitle}>Choose category</Text>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  setSkillCategory(category);
                  setCategoryPickerVisible(false);
                }}
                style={styles.categoryOption}
              >
                <Text style={styles.categoryOptionText}>{category}</Text>
                {skillCategory === category && (
                  <Check size={18} color="#6D28D9" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={workspaceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWorkspaceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setWorkspaceModalVisible(false)}
          />
          <View style={[styles.modalSheet, styles.workspaceModalSheet]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {workspaceKind === "component"
                  ? "Create component"
                  : "Create file"}
              </Text>
              <Pressable
                onPress={() => setWorkspaceModalVisible(false)}
                style={styles.iconButton}
              >
                <X size={21} color="#52525B" />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>File name</Text>
            <TextInput
              value={workspaceName}
              onChangeText={setWorkspaceName}
              placeholder="Enter file name"
              placeholderTextColor="#A1A1AA"
              style={styles.fieldInput}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Content</Text>
            <TextInput
              value={workspaceContent}
              onChangeText={setWorkspaceContent}
              placeholder="Write your content here..."
              placeholderTextColor="#A1A1AA"
              style={[styles.fieldInput, styles.contentEditor]}
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
            />

            <Pressable onPress={saveWorkspaceFile} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save to workspace</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Search size={25} color="#A1A1AA" />
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E4E7",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F5",
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#18181B",
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#71717A",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  introCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#F1EBFF",
    borderWidth: 1,
    borderColor: "#E4D7FF",
    marginBottom: 20,
  },
  introIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#3B0764",
  },
  introText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: "#5B3B7A",
  },
  tabRow: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#EDEDF0",
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    paddingHorizontal: 5,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#71717A",
  },
  activeTabText: {
    color: "#6D28D9",
    fontWeight: "800",
  },
  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    marginBottom: 22,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "#18181B",
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#18181B",
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#71717A",
  },
  primaryButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#6D28D9",
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  card: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  skillIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
    marginRight: 11,
  },
  connectorIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F5",
    marginRight: 11,
  },
  cardTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#18181B",
  },
  publisher: {
    marginTop: 4,
    fontSize: 11,
    color: "#71717A",
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F4F4F5",
  },
  cardDescription: {
    marginTop: 13,
    fontSize: 13,
    lineHeight: 19,
    color: "#52525B",
  },
  cardBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 15,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F4F4F5",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#52525B",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  deleteButton: {
    width: 33,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  secondaryButton: {
    minHeight: 34,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#D4D4D8",
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3F3F46",
  },
  toggleButton: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  toggleButtonEnabled: {
    backgroundColor: "#6D28D9",
    borderColor: "#6D28D9",
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#52525B",
  },
  toggleButtonTextEnabled: {
    color: "#FFFFFF",
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#D4D4D8",
    marginLeft: 8,
  },
  statusDotEnabled: {
    backgroundColor: "#16A34A",
  },
  connectorBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  statusText: {
    fontSize: 12,
    color: "#71717A",
  },
  statusTextEnabled: {
    color: "#15803D",
    fontWeight: "700",
  },
  infoBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginBottom: 14,
  },
  infoBannerText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#9A3412",
  },
  emptyState: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    backgroundColor: "#FFFFFF",
  },
  emptyStateText: {
    textAlign: "center",
    fontSize: 13,
    color: "#71717A",
  },
  workspaceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 14,
  },
  workspaceHeadingIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
    marginRight: 11,
  },
  workspaceHeadingText: {
    flex: 1,
  },
  workspaceActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 13,
  },
  workspaceAction: {
    flex: 1,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  workspaceActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#52525B",
  },
  emptyWorkspace: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  emptyWorkspaceTitle: {
    marginTop: 11,
    fontSize: 14,
    fontWeight: "700",
    color: "#3F3F46",
  },
  emptyWorkspaceText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#71717A",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    marginBottom: 9,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  fileIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#18181B",
  },
  fileMeta: {
    marginTop: 4,
    fontSize: 11,
    color: "#71717A",
  },
  footerNote: {
    marginTop: 17,
    fontSize: 11,
    lineHeight: 17,
    color: "#71717A",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
modalBackdrop: {
  ...StyleSheet.absoluteFill,
  backgroundColor: "rgba(24, 24, 27, 0.45)",
},
  modalSheet: {
    paddingHorizontal: 20,
    paddingTop: 19,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#18181B",
  },
  fieldLabel: {
    marginBottom: 7,
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#3F3F46",
  },
  fieldInput: {
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4D4D8",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#18181B",
  },
  multilineInput: {
    minHeight: 90,
  },
  categorySelector: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4D4D8",
  },
  categorySelectorText: {
    fontSize: 14,
    color: "#18181B",
  },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    borderRadius: 13,
    backgroundColor: "#6D28D9",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  categorySheet: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  categoryOption: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E4E7",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#3F3F46",
  },
  workspaceModalSheet: {
    paddingBottom: 25,
  },
  contentEditor: {
    minHeight: 180,
    maxHeight: 300,
    fontFamily: "monospace",
  },
});
