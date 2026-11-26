import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, ChevronRight } from "lucide-react-native";

type NotificationsScreenProps = {
  onBack: () => void;
};

const STORAGE_KEY = "modelnow-notification-settings-v1";

const DEFAULT_SETTINGS: Record<string, boolean> = {
  "Group chats": true,
  Health: true,
  Library: true,
  Marketing: true,
  "Personalized tips": true,
  Projects: true,
  Responses: true,
  Tasks: true,
  Usage: true,
};

export default function NotificationsScreen({
  onBack,
}: NotificationsScreenProps) {
  const [settings, setSettings] =
    useState<Record<string, boolean>>(DEFAULT_SETTINGS);

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);

          // Keep only supported categories, excluding old Codex data.
          const cleanedSettings: Record<string, boolean> = {};

          Object.keys(DEFAULT_SETTINGS).forEach((category) => {
            cleanedSettings[category] =
              typeof parsed[category] === "boolean"
                ? parsed[category]
                : DEFAULT_SETTINGS[category];
          });

          setSettings(cleanedSettings);

          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cleanedSettings),
          );
        }
      } catch (error) {
        console.warn(
          "Could not load notification settings.",
          error,
        );
      } finally {
        setLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (
    category: string,
    enabled: boolean,
  ) => {
    const updated = {
      ...settings,
      [category]: enabled,
    };

    setSettings(updated);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.warn(
        "Could not save notification settings.",
        error,
      );
    }
  };

  const categories = Object.keys(DEFAULT_SETTINGS);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (selectedCategory) {
              setSelectedCategory(null);
            } else {
              onBack();
            }
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {selectedCategory ?? "Notifications"}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {!selectedCategory ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listCard}>
            {categories.map((category, index) => (
              <Pressable
                key={category}
                accessibilityRole="button"
                accessibilityLabel={`${category}, ${
                  settings[category] ? "On" : "Off"
                }`}
                style={[
                  styles.categoryRow,
                  index !== categories.length - 1 &&
                    styles.categoryDivider,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryName}>
                  {category}
                </Text>

                <View style={styles.rowRight}>
                  <Text style={styles.statusText}>
                    {settings[category] ? "On" : "Off"}
                  </Text>

                  <ChevronRight
                    size={19}
                    color="#888888"
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.detailContent}>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailTextContainer}>
                <Text style={styles.categoryName}>
                  {selectedCategory}
                </Text>

                <Text style={styles.detailDescription}>
                  Receive {selectedCategory.toLowerCase()} notifications.
                </Text>
              </View>

              <Switch
                value={settings[selectedCategory]}
                onValueChange={(value) =>
                  updateSetting(selectedCategory, value)
                }
                disabled={!loaded}
                trackColor={{
                  false: "#D1D1D1",
                  true: "#111111",
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D1D1"
              />
            </View>
          </View>

          <Text style={styles.note}>
            Your preference is saved on this device. Actual push
            notifications require notification service integration.
          </Text>
        </View>
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
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  headerSpacer: {
    width: 38,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 20,
  },
  listCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  categoryRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  categoryDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#DEDEDE",
  },
  categoryName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "400",
    color: "#111111",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#929292",
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  detailCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailTextContainer: {
    flex: 1,
    gap: 4,
  },
  detailDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: "#858585",
  },
  note: {
    marginTop: 10,
    marginHorizontal: 7,
    fontSize: 10,
    lineHeight: 15,
    color: "#858585",
  },
});