import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { ArrowLeft, ChevronRight, X } from "lucide-react-native";

type Props = {
  onBack: () => void;
  onOpenSetting: (name: string) => void;
};

const MEMORY_ENABLED_KEY = "modelnow-memory-enabled-v1";

export default function MemoryScreen({
  onBack,
  onOpenSetting,
}: Props) {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [savedMemoriesVisible, setSavedMemoriesVisible] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMemorySetting = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(
          MEMORY_ENABLED_KEY,
        );

        if (mounted && storedValue !== null) {
          setEnabled(storedValue === "true");
        }
      } catch {
        // Keep the default value if storage is unavailable.
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    };

    loadMemorySetting();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleMemory = async () => {
    if (!ready) return;

    const nextValue = !enabled;
    setEnabled(nextValue);

    try {
      await AsyncStorage.setItem(
        MEMORY_ENABLED_KEY,
        String(nextValue),
      );
    } catch {
      Alert.alert(
        "Unable to save",
        "The memory setting could not be saved on this device.",
      );
    }
  };

  const showMemoryInfo = () => {
    Alert.alert(
      "About memory",
      "Memory settings let ModelNow remember useful details between conversations. This screen currently stores the toggle setting on this device. Actual AI memory requires integration with the memory service.",
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
          <ArrowLeft size={24} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>Memory</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Enable memory */}
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Enable memory"
          accessibilityState={{ checked: enabled }}
          onPress={toggleMemory}
          style={({ pressed }) => [
            styles.memoryToggleRow,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.toggleLabel}>
            Enable memory
          </Text>

          <View
            style={[
              styles.toggleTrack,
              enabled
                ? styles.toggleTrackEnabled
                : styles.toggleTrackDisabled,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                enabled
                  ? styles.toggleThumbEnabled
                  : styles.toggleThumbDisabled,
              ]}
            />
          </View>
        </Pressable>

        <Text style={styles.description}>
          Let ModelNow personalize your experience based on
          your chats, files, and connected apps.{" "}
          <Text
            onPress={showMemoryInfo}
            style={styles.link}
          >
            Learn more
          </Text>
        </Text>

        {/* Memory summary */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Memory summary"
          onPress={() => setSummaryVisible(true)}
          style={({ pressed }) => [
            styles.summaryRow,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.summaryTitle}>
            Memory summary
          </Text>

          <ChevronRight
            size={21}
            color="#858585"
            strokeWidth={2}
          />
        </Pressable>

        <Text style={styles.description}>
          View an overview of what ModelNow has learned about
          you. Use{" "}
          <Text
            onPress={() => onOpenSetting("Personalization")}
            style={styles.link}
          >
            custom instructions
          </Text>{" "}
          for information you’d like it to always keep in mind.
          You can still manage your old{" "}
          <Text
            onPress={() => setSavedMemoriesVisible(true)}
            style={styles.link}
          >
            saved memories
          </Text>
          .
        </Text>
      </ScrollView>

      {/* Memory summary modal */}
      <Modal
        visible={summaryVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSummaryVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close memory summary"
            style={styles.modalBackdrop}
            onPress={() => setSummaryVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Memory summary
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setSummaryVisible(false)}
                style={styles.closeButton}
              >
                <X size={21} color="#262626" />
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              This is where a summary of information ModelNow
              remembers about you will appear.
            </Text>

            <Text style={styles.emptyMemoryText}>
              No memory summary is available yet.
            </Text>

            <Text style={styles.modalFootnote}>
              The actual summary requires integration with
              ModelNow’s memory service.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSummaryVisible(false);
                onOpenSetting("Personalization");
              }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Open Personalization
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Saved memories modal */}
      <Modal
        visible={savedMemoriesVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setSavedMemoriesVisible(false)
        }
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close saved memories"
            style={styles.modalBackdrop}
            onPress={() => setSavedMemoriesVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Saved memories
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setSavedMemoriesVisible(false)}
                style={styles.closeButton}
              >
                <X size={21} color="#262626" />
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              Saved memories will appear here when memory
              storage is connected.
            </Text>

            <Text style={styles.emptyMemoryText}>
              No saved memories to display yet.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => setSavedMemoriesVisible(false)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Done
              </Text>
            </Pressable>
          </View>
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
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    width: 44,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },

  memoryToggleRow: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
  },

  toggleLabel: {
    flex: 1,
    fontSize: 17,
    color: "#171717",
    fontWeight: "400",
  },

  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: "center",
  },

  toggleTrackEnabled: {
    backgroundColor: "#080808",
  },

  toggleTrackDisabled: {
    backgroundColor: "#C9C9C9",
  },

  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },

  toggleThumbEnabled: {
    alignSelf: "flex-end",
  },

  toggleThumbDisabled: {
    alignSelf: "flex-start",
  },

  description: {
    marginTop: 10,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#696969",
  },

  link: {
    color: "#315FEA",
    fontWeight: "400",
  },

  summaryRow: {
    minHeight: 64,
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
  },

  summaryTitle: {
    fontSize: 17,
    color: "#171717",
    fontWeight: "400",
  },

  pressed: {
    opacity: 0.75,
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
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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

  emptyMemoryText: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 15,
    color: "#262626",
  },

  modalFootnote: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
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