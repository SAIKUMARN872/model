
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft } from "lucide-react-native";

type SafetyScreenProps = {
  onBack: () => void;
};

const STORAGE_KEY = "modelnow-safety-settings-v1";

export default function SafetyScreen({ onBack }: SafetyScreenProps) {
  const [reduceSensitiveContent, setReduceSensitiveContent] =
    useState(false);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
          setReduceSensitiveContent(saved === "true");
        }
      } catch (error) {
        console.warn("Could not load Safety settings.", error);
      } finally {
        setLoaded(true);
      }
    };

    loadSetting();
  }, []);

  const updateSetting = async (value: boolean) => {
    setReduceSensitiveContent(value);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(value));
    } catch (error) {
      console.warn("Could not save Safety settings.", error);
      Alert.alert(
        "Settings",
        "Your preference could not be saved on this device.",
      );
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={25} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>Safety</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingCard}>
          <Text style={styles.settingTitle}>
            Reduce sensitive content
          </Text>

          <Switch
            value={reduceSensitiveContent}
            disabled={!loaded}
            onValueChange={updateSetting}
            trackColor={{
              false: "#EEEEEE",
              true: "#111111",
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#EEEEEE"
            style={styles.switch}
          />
        </View>

        <Text style={styles.description}>
          Add extra safeguards around sensitive topics and limit
          certain types of content in ModelNow.{" "}
          <Text
            style={styles.learnMore}
            onPress={() =>
              Alert.alert(
                "Reduce sensitive content",
                "This setting records your preference. To enforce additional safeguards, the preference must also be connected to ModelNow's AI response and safety policies.",
              )
            }
          >
            Learn more
          </Text>
        </Text>
      </ScrollView>
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },

  headerSpacer: {
    width: 54,
  },

  content: {
    paddingHorizontal: 27,
    paddingTop: 6,
    paddingBottom: 24,
  },

  settingCard: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 34,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  settingTitle: {
    flex: 1,
    fontSize: 15,
    color: "#111111",
    fontWeight: "400",
  },

  switch: {
    transform: [{ scale: 1.05 }],
    marginRight: -3,
  },

  description: {
    marginTop: 17,
    marginHorizontal: 33,
    fontSize: 13,
    lineHeight: 21,
    color: "#858585",
  },

  learnMore: {
    color: "#315FBD",
  },
});
