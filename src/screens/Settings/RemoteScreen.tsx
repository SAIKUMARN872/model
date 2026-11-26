import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Monitor,
  Plus,
  X,
} from "lucide-react-native";

type RemoteScreenProps = {
  onBack: () => void;
};

type FollowUpOption = "Queue" | "Interrupt";

type SavedConnection = {
  id: string;
  name: string;
  pairingCode: string;
};

const STORAGE_KEY = "modelnow-remote-settings-v1";

export default function RemoteScreen({
  onBack,
}: RemoteScreenProps) {
  const [followUp, setFollowUp] =
    useState<FollowUpOption>("Queue");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [pairingVisible, setPairingVisible] = useState(false);
  const [connectionName, setConnectionName] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const parsed = JSON.parse(saved);

        if (
          parsed.followUp === "Queue" ||
          parsed.followUp === "Interrupt"
        ) {
          setFollowUp(parsed.followUp);
        }

        if (Array.isArray(parsed.connections)) {
          setConnections(parsed.connections);
        }
      } catch {
        console.warn("Could not load Remote settings.");
      }
    };

    void loadSettings();
  }, []);

  const persistSettings = async (
    nextFollowUp: FollowUpOption,
    nextConnections: SavedConnection[],
  ) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        followUp: nextFollowUp,
        connections: nextConnections,
      }),
    );
  };

  const saveFollowUp = async (option: FollowUpOption) => {
    setFollowUp(option);
    setDropdownVisible(false);

    try {
      await persistSettings(option, connections);
    } catch {
      Alert.alert("Error", "Could not save your preference.");
    }
  };

  const openPairing = () => {
    setConnectionName("");
    setPairingCode("");
    setPairingVisible(true);
  };

  const pairComputer = async () => {
    Keyboard.dismiss();

    const name = connectionName.trim();
    const code = pairingCode.trim();

    if (!name) {
      Alert.alert(
        "Computer name required",
        "Enter a name for this computer.",
      );
      return;
    }

    if (!/^[A-Za-z0-9-]{4,12}$/.test(code)) {
      Alert.alert(
        "Invalid pairing code",
        "Enter a pairing code containing 4–12 letters, numbers, or hyphens.",
      );
      return;
    }

    setSaving(true);

    try {
      const nextConnections: SavedConnection[] = [
        ...connections.filter((item) => item.pairingCode !== code),
        {
          id: `${Date.now()}`,
          name,
          pairingCode: code,
        },
      ];

      await persistSettings(followUp, nextConnections);

      setConnections(nextConnections);
      setPairingVisible(false);

      Alert.alert(
        "Saved locally",
        "The computer details were saved, but the pairing code has not been verified. Connect the ModelNow desktop service to establish a real connection.",
      );
    } catch {
      Alert.alert("Error", "Could not save the computer details.");
    } finally {
      setSaving(false);
    }
  };

  const removeConnection = (id: string) => {
    Alert.alert(
      "Remove computer",
      "Remove this saved computer from the list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const nextConnections = connections.filter(
              (item) => item.id !== id,
            );

            try {
              await persistSettings(followUp, nextConnections);
              setConnections(nextConnections);
            } catch {
              Alert.alert(
                "Error",
                "Could not remove this computer.",
              );
            }
          },
        },
      ],
    );
  };

  const addShortcut = () => {
    Alert.alert(
      "Remote shortcut",
      "Home-screen shortcut installation requires native shortcut support.",
    );
  };

  const renderDescription = (text: string) => (
    <Text style={styles.description}>{text}</Text>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>Remote</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Connections</Text>

        <View style={styles.card}>
          {connections.length === 0 ? (
            <View style={styles.emptyConnection}>
              <Monitor size={23} color="#888888" />
              <Text style={styles.connectionDescription}>
                No saved computers yet. Add a computer to begin
                the pairing process.
              </Text>
            </View>
          ) : (
            connections.map((connection, index) => (
              <View key={connection.id}>
                {index > 0 && <View style={styles.divider} />}

                <View style={styles.connectionRow}>
                  <View style={styles.computerIcon}>
                    <Monitor size={20} color="#555555" />
                  </View>

                  <View style={styles.connectionInfo}>
                    <Text style={styles.rowTitle}>
                      {connection.name}
                    </Text>
                    <Text style={styles.connectionStatus}>
                      Saved · Not connected
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${connection.name}`}
                    onPress={() => removeConnection(connection.id)}
                    hitSlop={8}
                    style={styles.removeButton}
                  >
                    <X size={18} color="#888888" />
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <View style={styles.divider} />

          <Pressable
            accessibilityRole="button"
            style={styles.row}
            onPress={openPairing}
          >
            <Text style={styles.rowTitle}>Add connection</Text>
            <ChevronRight size={19} color="#888888" />
          </Pressable>
        </View>

        {renderDescription(
          "Enter the pairing code displayed by ModelNow Desktop. A verified desktop service is required to establish a connection.",
        )}

        <Text style={[styles.sectionTitle, styles.composerTitle]}>
          Composer
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Follow-up behavior: ${followUp}`}
          style={styles.followUpCard}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.rowTitle}>Follow-up behavior</Text>

          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{followUp}</Text>
            <ChevronDown size={19} color="#888888" />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.shortcutCard}
          onPress={addShortcut}
        >
          <Text style={styles.shortcutText}>
            Add Remote shortcut
          </Text>
        </Pressable>

        {renderDescription("Open Remote from your home screen.")}
      </ScrollView>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDropdownVisible(false)}
        >
          <Pressable
            style={styles.dropdown}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.dropdownTitle}>
              Follow-up behavior
            </Text>

            {(["Queue", "Interrupt"] as const).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                style={styles.dropdownOption}
                onPress={() => void saveFollowUp(option)}
              >
                <Text style={styles.dropdownText}>{option}</Text>

                {followUp === option && (
                  <Check size={18} color="#111111" />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={pairingVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPairingVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.pairingModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a computer</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setPairingVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#555555" />
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              Open ModelNow Desktop on the computer you want to pair
              and enter the details displayed there.
            </Text>

            <Text style={styles.inputLabel}>Computer name</Text>
            <TextInput
              value={connectionName}
              onChangeText={setConnectionName}
              placeholder="e.g. My Windows PC"
              placeholderTextColor="#999999"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Pairing code</Text>
            <TextInput
              value={pairingCode}
              onChangeText={(value) =>
                setPairingCode(
                  value.replace(/[^A-Za-z0-9-]/g, ""),
                )
              }
              placeholder="Enter desktop pairing code"
              placeholderTextColor="#999999"
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              returnKeyType="done"
              onSubmitEditing={() => void pairComputer()}
            />

            <Text style={styles.pairingNote}>
              The code is not verified yet. Saving these details does
              not connect to or control a computer.
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              style={[
                styles.connectButton,
                saving && styles.disabledButton,
              ]}
              onPress={() => void pairComputer()}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.connectButtonText}>
                {saving ? "Saving..." : "Save computer"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },
  headerSpacer: {
    width: 46,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionTitle: {
    marginHorizontal: 24,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#858585",
  },
  card: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  emptyConnection: {
    paddingHorizontal: 22,
    paddingTop: 17,
    paddingBottom: 15,
    gap: 9,
  },
  connectionDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E2E2",
  },
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  rowTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#111111",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    color: "#929292",
  },
  description: {
    marginTop: 13,
    marginBottom: 30,
    marginHorizontal: 24,
    fontSize: 12,
    lineHeight: 19,
    color: "#858585",
  },
  composerTitle: {
    marginBottom: 7,
  },
  followUpCard: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 28,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  shortcutCard: {
    minHeight: 58,
    marginTop: 44,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 28,
    paddingHorizontal: 22,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  shortcutText: {
    fontSize: 14,
    color: "#315FC4",
    fontWeight: "400",
  },
  connectionRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
  },
  computerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  connectionInfo: {
    flex: 1,
    gap: 5,
  },
  connectionStatus: {
    fontSize: 12,
    color: "#888888",
  },
  removeButton: {
    padding: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdown: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 8,
    elevation: 8,
  },
  dropdownTitle: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },
  dropdownOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  dropdownText: {
    fontSize: 14,
    color: "#111111",
  },
  pairingModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666666",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DEDEDE",
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111111",
    marginBottom: 16,
  },
  pairingNote: {
    fontSize: 12,
    lineHeight: 18,
    color: "#888888",
    marginBottom: 18,
  },
  connectButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#111111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});