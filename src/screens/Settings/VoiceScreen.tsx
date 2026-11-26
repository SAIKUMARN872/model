import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";

type VoiceScreenProps = {
  onBack: () => void;
};

const STORAGE_KEY = "modelnow-voice-settings-v1";

type VoiceSettings = {
  model: string;
  voice: string;
  language: string;
  backgroundConversations: boolean;
  defaultAssistant: boolean;
};

const DEFAULT_SETTINGS: VoiceSettings = {
  model: "Live",
  voice: "Cove",
  language: "Auto-detect",
  backgroundConversations: true,
  defaultAssistant: false,
};

export default function VoiceScreen({ onBack }: VoiceScreenProps) {
  const [settings, setSettings] =
    useState<VoiceSettings>(DEFAULT_SETTINGS);

  const [activeDropdown, setActiveDropdown] = useState<
    "model" | "voice" | "language" | null
  >(null);

  const [loaded, setLoaded] = useState(false);

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...JSON.parse(saved),
          });
        }
      } catch (error) {
        console.warn("Could not load voice settings.", error);
      } finally {
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (changes: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...changes };
    setSettings(updated);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.warn("Could not save voice settings.", error);
    }
  };

  const openDropdown = (
    name: "model" | "voice" | "language",
  ) => setActiveDropdown(name);

  const renderDropdown = (
    name: "model" | "voice" | "language",
    title: string,
    value: string,
    options: string[],
  ) => (
    <Modal
      visible={activeDropdown === name}
      transparent
      animationType="fade"
      onRequestClose={() => setActiveDropdown(null)}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={() => setActiveDropdown(null)}
      >
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>{title}</Text>

          {options.map((option) => (
            <Pressable
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                void updateSettings({ [name]: option });
                setActiveDropdown(null);
              }}
            >
              <Text style={styles.dropdownText}>{option}</Text>
              {value === option && (
                <Text style={styles.check}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  const renderRow = (
    label: string,
    value: string | null,
    onPress: () => void,
    last = false,
    dropdown = false,
  ) => (
    <Pressable
      style={[
        styles.row,
        !last && styles.rowDivider,
      ]}
      onPress={onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>

      <View style={styles.rowRight}>
        {value !== null && (
          <Text style={styles.rowValue}>{value}</Text>
        )}

        {dropdown ? (
          <ChevronDown size={18} color="#888888" />
        ) : (
          <ChevronRight size={20} color="#888888" />
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (showHistory) {
              setShowHistory(false);
            } else {
              onBack();
            }
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={25} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {showHistory ? "Dictation history" : "Voice"}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {showHistory ? (
        <View style={styles.historyContainer}>
          <Text style={styles.historyText}>
            Your dictation history will appear here when voice
            dictation is connected.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.singleCard}>
            {renderRow(
              "Model",
              settings.model,
              () => openDropdown("model"),
              true,
              true,
            )}
          </View>

          <View style={styles.groupCard}>
            {renderRow(
              "Voice",
              settings.voice,
              () => openDropdown("voice"),
            )}

            {renderRow(
              "Language",
              settings.language,
              () => openDropdown("language"),
              false,
              true,
            )}

            {renderRow(
              "Dictation history",
              null,
              () => setShowHistory(true),
              true,
            )}
          </View>

          <View style={styles.singleCard}>
            <View style={styles.switchRow}>
              <Text style={styles.rowLabel}>
                Background conversations
              </Text>

              <Switch
                value={settings.backgroundConversations}
                disabled={!loaded}
                onValueChange={(value) =>
                  void updateSettings({
                    backgroundConversations: value,
                  })
                }
                trackColor={{
                  false: "#D1D1D1",
                  true: "#111111",
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D1D1"
              />
            </View>
          </View>

          <Text style={styles.description}>
            Keep the conversation going in other apps or while your
            screen is off.{" "}
            <Text
              style={styles.learnMore}
              onPress={() =>
                Alert.alert(
                  "Background conversations",
                  "This preference is saved locally. Continuing voice conversations in the background requires additional audio and background-task integration.",
                )
              }
            >
              Learn more
            </Text>
          </Text>

          <View style={[styles.singleCard, styles.assistantCard]}>
            <View style={styles.switchRow}>
              <Text style={styles.rowLabel}>
                Use as default assistant
              </Text>

              <View style={styles.assistantRight}>
                <Switch
                  value={settings.defaultAssistant}
                  disabled={!loaded}
                  onValueChange={(value) =>
                    void updateSettings({
                      defaultAssistant: value,
                    })
                  }
                  trackColor={{
                    false: "#D1D1D1",
                    true: "#111111",
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D1D1D1"
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Default assistant information"
                  onPress={() =>
                    Alert.alert(
                      "Default assistant",
                      "Selecting ModelNow as your Android default assistant requires Android system integration and user approval.",
                    )
                  }
                >
                  <ChevronRight size={20} color="#888888" />
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.description}>
            Set ModelNow as your default digital assistant in
            Android settings.
          </Text>
        </ScrollView>
      )}

      {renderDropdown(
        "model",
        "Voice model",
        settings.model,
        ["Live", "Standard"],
      )}

      {renderDropdown(
        "voice",
        "Choose voice",
        settings.voice,
        ["Cove", "Breeze", "Juniper", "Ember", "Arbor", "Vale"],
      )}

      {renderDropdown(
        "language",
        "Voice language",
        settings.language,
        [
          "Auto-detect",
          "English",
          "Telugu",
          "Hindi",
          "Spanish",
          "French",
        ],
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },

  backButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },

  headerSpacer: {
    width: 54,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 27,
    paddingTop: 6,
    paddingBottom: 30,
  },

  singleCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  groupCard: {
    marginTop: 54,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  row: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#DEDEDE",
  },

  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: "#111111",
    fontWeight: "400",
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  rowValue: {
    fontSize: 14,
    color: "#929292",
  },

  switchRow: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  description: {
    marginTop: 14,
    marginHorizontal: 17,
    marginBottom: 46,
    fontSize: 12,
    lineHeight: 19,
    color: "#858585",
  },

  learnMore: {
    textDecorationLine: "underline",
  },

  assistantCard: {
    marginTop: 0,
  },

  assistantRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  historyContainer: {
    paddingHorizontal: 28,
    paddingTop: 20,
  },

  historyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#858585",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  dropdown: {
    width: "100%",
    maxWidth: 320,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    elevation: 12,
  },

  dropdownTitle: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },

  dropdownOption: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  dropdownText: {
    fontSize: 14,
    color: "#111111",
  },

  check: {
    fontSize: 17,
    color: "#111111",
  },
});