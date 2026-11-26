import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react-native";

type PersonalizationSettings = {
  baseStyle: string;
  warmth: string;
  enthusiasm: string;
  headersAndLists: string;
  emoji: string;
  customInstructions: string;
};

type Props = {
  onBack: () => void;
  onSave?: (settings: PersonalizationSettings) => void;
};

type Option = {
  label: string;
  description: string;
};

type Setting = {
  key: keyof Pick<
    PersonalizationSettings,
    "baseStyle" | "warmth" | "enthusiasm" | "headersAndLists" | "emoji"
  >;
  title: string;
  options: Option[];
};

const SETTINGS: Setting[] = [
  {
    key: "baseStyle",
    title: "Base style and tone",
    options: [
      { label: "Default", description: "Balanced and natural" },
      { label: "Professional", description: "Polished and precise" },
      { label: "Friendly", description: "Warm and chatty" },
      { label: "Candid", description: "Direct and encouraging" },
      { label: "Quirky", description: "Playful and imaginative" },
      { label: "Efficient", description: "Concise and plain" },
      { label: "Cynical", description: "Critical and sarcastic" },
    ],
  },
  {
    key: "warmth",
    title: "Warmth",
    options: [
      { label: "More", description: "Friendlier and more personable" },
      { label: "Default", description: "A balanced level of warmth" },
      { label: "Less", description: "More professional and practical" },
    ],
  },
  {
    key: "enthusiasm",
    title: "Enthusiasm",
    options: [
      { label: "More", description: "More energy and excitement" },
      { label: "Default", description: "A balanced level of enthusiasm" },
      { label: "Less", description: "Calmer and more neutral" },
    ],
  },
  {
    key: "headersAndLists",
    title: "Headers and lists",
    options: [
      { label: "More", description: "Use clean formatting and lists" },
      { label: "Default", description: "Balanced formatting" },
      { label: "Less", description: "More paragraphs instead of lists" },
    ],
  },
  {
    key: "emoji",
    title: "Emoji",
    options: [
      { label: "More", description: "Use more emojis" },
      { label: "Default", description: "Use emojis when appropriate" },
      { label: "Less", description: "Don't use as many emojis" },
    ],
  },
];

const INITIAL_SETTINGS: PersonalizationSettings = {
  baseStyle: "Default",
  warmth: "Default",
  enthusiasm: "Default",
  headersAndLists: "Default",
  emoji: "Default",
  customInstructions: "",
};

export default function PersonalizationScreen({
  onBack,
  onSave,
}: Props) {
  const [settings, setSettings] =
    useState<PersonalizationSettings>(INITIAL_SETTINGS);

  const [activeSetting, setActiveSetting] = useState<Setting | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const openDropdown = (setting: Setting) => {
    setActiveSetting(setting);
  };

  const chooseOption = (value: string) => {
    if (!activeSetting) return;

    setSettings((previous) => ({
      ...previous,
      [activeSetting.key]: value,
    }));

    setActiveSetting(null);
  };

  const saveSettings = () => {
    onSave?.(settings);
    setShowSaved(true);

    setTimeout(() => {
      setShowSaved(false);
      onBack();
    }, 700);
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
          style={styles.headerButton}
        >
          <ArrowLeft size={23} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>Personalization</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save personalization"
          onPress={saveSettings}
          style={styles.headerButton}
        >
          <Check
            size={23}
            color={showSaved ? "#16A34A" : "#777777"}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Settings */}
          <View style={styles.settingsCard}>
            {SETTINGS.map((setting, index) => (
              <Pressable
                key={setting.key}
                accessibilityRole="button"
                accessibilityLabel={setting.title}
                onPress={() => openDropdown(setting)}
                style={[
                  styles.settingRow,
                  index !== SETTINGS.length - 1 && styles.rowDivider,
                ]}
              >
                <Text style={styles.settingTitle}>
                  {setting.title}
                </Text>

                <View style={styles.valueContainer}>
                  <Text
                    numberOfLines={1}
                    style={styles.settingValue}
                  >
                    {settings[setting.key]}
                  </Text>

                  <ChevronDown size={18} color="#777777" />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Custom instructions */}
          <Text style={styles.instructionsLabel}>
            Custom instructions
          </Text>

          <TextInput
            value={settings.customInstructions}
            onChangeText={(text) =>
              setSettings((previous) => ({
                ...previous,
                customInstructions: text,
              }))
            }
            placeholder="Share anything else you'd like ModelNow to consider in its response."
            placeholderTextColor="#858585"
            multiline
            textAlignVertical="top"
            style={styles.instructionsInput}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Compact options popup */}
      <Modal
        visible={activeSetting !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setActiveSetting(null)}
      >
        <View style={styles.modalOverlay}>
          {/* Tap outside the popup to close it */}
          <Pressable
            style={styles.overlayTouchable}
            accessibilityRole="button"
            accessibilityLabel="Close options"
            onPress={() => setActiveSetting(null)}
          />

          {/* Popup remains above the dismissible background */}
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <Text
                numberOfLines={1}
                style={styles.popupTitle}
              >
                {activeSetting?.title}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close options"
                onPress={() => setActiveSetting(null)}
                style={styles.closeButton}
              >
                <X size={19} color="#333333" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {activeSetting?.options.map((option) => {
                const selected =
                  settings[activeSetting.key] === option.label;

                return (
                  <Pressable
                    key={option.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => chooseOption(option.label)}
                    style={[
                      styles.optionRow,
                      selected && styles.selectedOption,
                    ]}
                  >
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          selected && styles.selectedOptionLabel,
                        ]}
                      >
                        {option.label}
                      </Text>

                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>

                    {selected ? (
                      <Check size={19} color="#315FEA" />
                    ) : (
                      <ChevronRight size={17} color="#AAAAAA" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 19,
    fontWeight: "700",
    color: "#111111",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  settingsCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  settingRow: {
    minHeight: 58,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D5D5D5",
  },

  settingTitle: {
    flex: 1,
    fontSize: 14,
    color: "#171717",
  },

  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  settingValue: {
    maxWidth: 85,
    fontSize: 13,
    color: "#666666",
  },

  instructionsLabel: {
    marginTop: 24,
    marginBottom: 9,
    marginLeft: 4,
    fontSize: 14,
    color: "#777777",
  },

  instructionsInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#171717",
    backgroundColor: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  overlayTouchable: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  popup: {
    width: "100%",
    maxWidth: 340,
    maxHeight: "65%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    paddingTop: 2,
    paddingBottom: 4,
    overflow: "hidden",
    elevation: 8,
  },

  popupHeader: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },

  popupTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  optionsList: {
    flexGrow: 0,
    flexShrink: 1,
  },

  optionsContent: {
    paddingVertical: 4,
  },

  optionRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },

  selectedOption: {
    backgroundColor: "#EEF3FF",
  },

  optionTextContainer: {
    flex: 1,
    gap: 2,
  },

  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#252525",
  },

  selectedOptionLabel: {
    color: "#315FEA",
  },

  optionDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: "#777777",
  },
});