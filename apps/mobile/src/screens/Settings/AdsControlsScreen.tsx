
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  ArrowLeft,
  ChevronRight,
} from "lucide-react-native";

type AdsControlsScreenProps = {
  onBack: () => void;
};

export default function AdsControlsScreen({
  onBack,
}: AdsControlsScreenProps) {
  const [personalizeAds, setPersonalizeAds] = useState(true);

  const showInfo = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete ad data",
      "Clear all advertising history and topics data?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            showInfo(
              "ModelNow",
              "Connect this action to your advertising data service to delete your data."
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <ArrowLeft
            size={23}
            color="#111111"
            strokeWidth={2}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Ads controls
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Ads data */}
        <Text style={styles.sectionTitle}>
          Ads data
        </Text>

        <View style={styles.groupCard}>
          <Pressable
            accessibilityRole="button"
            style={styles.dataRow}
            onPress={() =>
              showInfo(
                "History",
                "Your advertising history will appear here when this feature is connected."
              )
            }
          >
            <Text style={styles.rowText}>
              History
            </Text>

            <ChevronRight
              size={19}
              color="#888888"
              strokeWidth={2}
            />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            accessibilityRole="button"
            style={styles.dataRow}
            onPress={() =>
              showInfo(
                "Topics",
                "Your advertising topics will appear here when this feature is connected."
              )
            }
          >
            <Text style={styles.rowText}>
              Topics
            </Text>

            <ChevronRight
              size={19}
              color="#888888"
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* Delete ad data */}
        <Pressable
          accessibilityRole="button"
          style={styles.deleteCard}
          onPress={showDeleteConfirmation}
        >
          <Text style={styles.redText}>
            Delete ad data
          </Text>
        </Pressable>

        <Text style={styles.description}>
          Clear all ads history and topics data. This won't affect
          your chats.
        </Text>

        {/* Ads personalization */}
        <Text
          style={[
            styles.sectionTitle,
            styles.personalizationTitle,
          ]}
        >
          Ads personalization
        </Text>

        <View style={styles.toggleCard}>
          <Text style={styles.rowText}>
            Personalize ads
          </Text>

          <Switch
            value={personalizeAds}
            onValueChange={setPersonalizeAds}
            trackColor={{
              false: "#E5E5E5",
              true: "#111111",
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5E5"
          />
        </View>

        <Text style={styles.description}>
          Allow ModelNow to use your past chats, activity, and
          preferences to select ads. Ads may still be based on
          your current chat.
        </Text>

        {/* Ad-free plan */}
        <Pressable
          accessibilityRole="button"
          style={styles.planCard}
          onPress={() =>
            showInfo(
              "Change plan to go ad-free",
              "Connect your subscription and billing flow to manage ad-free plans."
            )
          }
        >
          <Text style={styles.blueText}>
            Change plan to go ad-free
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },

  header: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    position: "absolute",
    left: 70,
    right: 70,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
  },

  headerSpacer: {
    width: 40,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },

  sectionTitle: {
    marginHorizontal: 6,
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: "#858585",
  },

  groupCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  dataRow: {
    minHeight: 62,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowText: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: "#171717",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DDDDDD",
  },

  deleteCard: {
    minHeight: 62,
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  redText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D92746",
  },

  description: {
    marginTop: 10,
    marginHorizontal: 6,
    fontSize: 12,
    lineHeight: 18,
    color: "#858585",
  },

  personalizationTitle: {
    marginTop: 30,
  },

  toggleCard: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    paddingLeft: 22,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  planCard: {
    minHeight: 62,
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  blueText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#315BC5",
  },
});
