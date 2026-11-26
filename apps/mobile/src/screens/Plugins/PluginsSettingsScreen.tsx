import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import {
  ArrowLeft,
  ChevronRight,
  Grid2X2,
  Handshake,
  LayoutGrid,
  ShieldCheck,
  X,
} from "lucide-react-native";

type Props = {
  onBack: () => void;
  onBrowsePlugins: () => void;
};

const plugins = [
  {
    name: "LinkedIn",
    description:
      "Connect professional networking and career-related workflows.",
    initials: "in",
    backgroundColor: "#0A66C2",
    kind: "linkedin",
  },
  {
    name: "Plugin Management",
    description:
      "Manage available plugins, connections, and access settings.",
    initials: "✿",
    backgroundColor: "#167C72",
    kind: "management",
  },
  {
    name: "Sales",
    description:
      "Support sales workflows, account research, and follow-ups.",
    initials: "",
    backgroundColor: "#F4E9E2",
    kind: "sales",
  },
  {
    name: "Sites",
    description:
      "Access supported website and site-related workflows.",
    initials: "",
    backgroundColor: "#E6F3FF",
    kind: "sites",
  },
];

export default function PluginsSettingsScreen({
  onBack,
  onBrowsePlugins,
}: Props) {
  const [permissionsVisible, setPermissionsVisible] =
    useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<
    (typeof plugins)[number] | null
  >(null);
  const [permissionLevel, setPermissionLevel] =
    useState("Allow low-risk");

  const renderPluginIcon = (
    plugin: (typeof plugins)[number],
  ) => {
    if (plugin.kind === "linkedin") {
      return (
        <View
          style={[
            styles.pluginIcon,
            { backgroundColor: plugin.backgroundColor },
          ]}
        >
          <Text style={styles.linkedinText}>in</Text>
        </View>
      );
    }

    if (plugin.kind === "management") {
      return (
        <View
          style={[
            styles.pluginIcon,
            { backgroundColor: plugin.backgroundColor },
          ]}
        >
          <Text style={styles.managementText}>✿</Text>
        </View>
      );
    }

    if (plugin.kind === "sales") {
      return (
        <View
          style={[
            styles.pluginIcon,
            { backgroundColor: plugin.backgroundColor },
          ]}
        >
          <Handshake size={23} color="#E56A43" />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.pluginIcon,
          { backgroundColor: plugin.backgroundColor },
        ]}
      >
        <LayoutGrid size={24} color="#2689D8" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <ArrowLeft size={27} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>Plugins</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences */}
        <Text style={styles.sectionHeading}>
          Preferences
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => setPermissionsVisible(true)}
          style={({ pressed }) => [
            styles.permissionRow,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.permissionTitle}>
            Permissions
          </Text>

          <View style={styles.permissionValue}>
            <Text style={styles.permissionValueText}>
              {permissionLevel}
            </Text>
            <ChevronRight size={22} color="#858585" />
          </View>
        </Pressable>

        {/* Added plugins */}
        <Text style={styles.addedHeading}>Added</Text>

        <View style={styles.pluginList}>
          {plugins.map((plugin, index) => (
            <Pressable
              key={plugin.name}
              accessibilityRole="button"
              onPress={() => setSelectedPlugin(plugin)}
              style={({ pressed }) => [
                styles.pluginRow,
                index !== plugins.length - 1 &&
                  styles.pluginRowBorder,
                pressed && styles.pressed,
              ]}
            >
              {renderPluginIcon(plugin)}

              <Text style={styles.pluginName}>
                {plugin.name}
              </Text>

              <View style={styles.rowSpacer} />
              <ChevronRight
                size={18}
                color="#A0A0A0"
                style={styles.rowChevron}
              />
            </Pressable>
          ))}
        </View>

        {/* Browse plugins */}
        <Pressable
          accessibilityRole="button"
          onPress={onBrowsePlugins}
          style={({ pressed }) => [
            styles.browseButton,
            pressed && styles.pressed,
          ]}
        >
          <Grid2X2
            size={27}
            color="#111111"
            strokeWidth={2.2}
          />

          <Text style={styles.browseText}>
            Browse plugins
          </Text>
        </Pressable>
      </ScrollView>

      {/* Permissions modal */}
      <Modal
        visible={permissionsVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPermissionsVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close permissions"
            style={styles.modalBackdrop}
            onPress={() => setPermissionsVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingGroup}>
                <ShieldCheck
                  size={23}
                  color="#111111"
                />
                <Text style={styles.modalTitle}>
                  Plugin permissions
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setPermissionsVisible(false)}
                style={styles.closeButton}
              >
                <X size={22} color="#262626" />
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              Choose the permission level for plugin actions.
            </Text>

            {[
              {
                title: "Allow low-risk",
                description:
                  "Allow low-risk actions without additional approval.",
              },
              {
                title: "Ask every time",
                description:
                  "Request approval before plugin actions.",
              },
              {
                title: "Deny permissions",
                description:
                  "Do not allow plugin actions.",
              },
            ].map((option) => {
              const selected =
                permissionLevel === option.title;

              return (
                <Pressable
                  key={option.title}
                  onPress={() =>
                    setPermissionLevel(option.title)
                  }
                  style={[
                    styles.permissionOption,
                    selected &&
                      styles.permissionOptionSelected,
                  ]}
                >
                  <View style={styles.optionTextGroup}>
                    <Text style={styles.optionTitle}>
                      {option.title}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>

                  <View style={styles.radioOuter}>
                    {selected && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setPermissionsVisible(false)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Plugin details modal */}
      <Modal
        visible={selectedPlugin !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedPlugin(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close plugin details"
            style={styles.modalBackdrop}
            onPress={() => setSelectedPlugin(null)}
          />

          {selectedPlugin && (
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedPlugin.name}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  onPress={() => setSelectedPlugin(null)}
                  style={styles.closeButton}
                >
                  <X size={22} color="#262626" />
                </Pressable>
              </View>

              <View style={styles.detailIcon}>
                {renderPluginIcon(selectedPlugin)}
              </View>

              <Text style={styles.modalDescription}>
                {selectedPlugin.description}
              </Text>

              <Text style={styles.modalFootnote}>
                Plugin actions and account connections depend
                on the integration being configured.
              </Text>

              <Pressable
                onPress={() => setSelectedPlugin(null)}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  Done
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  backButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },

  headerSpacer: {
    width: 54,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },

  sectionHeading: {
    marginLeft: 26,
    marginBottom: 14,
    fontSize: 17,
    color: "#858585",
    fontWeight: "400",
  },

  permissionRow: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 36,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  permissionTitle: {
    fontSize: 17,
    color: "#171717",
  },

  permissionValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  permissionValueText: {
    fontSize: 16,
    color: "#686868",
  },

  addedHeading: {
    marginLeft: 26,
    marginTop: 48,
    marginBottom: 14,
    fontSize: 17,
    color: "#858585",
  },

  pluginList: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 29,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  pluginRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  pluginRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D6D6D6",
  },

  pluginIcon: {
    width: 40,
    height: 40,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  linkedinText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
    lineHeight: 32,
  },

  managementText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
  },

  pluginName: {
    marginLeft: 15,
    fontSize: 17,
    color: "#171717",
    fontWeight: "400",
  },

  rowSpacer: {
    flex: 1,
  },

  rowChevron: {
    opacity: 0,
  },

  browseButton: {
    minHeight: 72,
    marginTop: 46,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 36,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    backgroundColor: "#FFFFFF",
  },

  browseText: {
    fontSize: 17,
    color: "#171717",
    fontWeight: "400",
  },

  pressed: {
    opacity: 0.72,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  modalHeadingGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  modalTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
    color: "#171717",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#666666",
  },

  permissionOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 13,
  },

  permissionOptionSelected: {
    borderColor: "#111111",
    backgroundColor: "#F8F8F8",
  },

  optionTextGroup: {
    flex: 1,
    paddingRight: 10,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
  },

  optionDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#777777",
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#777777",
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111111",
  },

  detailIcon: {
    alignItems: "flex-start",
    marginBottom: 16,
  },

  modalFootnote: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: "#777777",
  },

  primaryButton: {
    minHeight: 44,
    marginTop: 20,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
    paddingHorizontal: 16,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});