
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
import { ArrowLeft, ChevronRight } from "lucide-react-native";

type HistoryAndDataScreenProps = {
  onBack: () => void;
};

export default function HistoryAndDataScreen({
  onBack,
}: HistoryAndDataScreenProps) {
  const [improveModel, setImproveModel] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(false);

  const showInfo = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const confirmAction = (
    title: string,
    message: string,
    actionLabel: string,
  ) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: actionLabel,
        style: "destructive",
        onPress: () =>
          showInfo(
            "ModelNow",
            "This action needs to be connected to your account and backend.",
          ),
      },
    ]);
  };

  const renderToggle = (
    value: boolean,
    onValueChange: (value: boolean) => void,
  ) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#E5E5E5", true: "#111111" }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E5E5E5"
    />
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
          hitSlop={8}
        >
          <ArrowLeft size={22} color="#111111" strokeWidth={2} />
        </Pressable>

        <Text style={styles.headerTitle}>History and data</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modelToggleCard}>
          <Text style={styles.rowTitle}>
            Improve the model for everyone
          </Text>
          {renderToggle(improveModel, setImproveModel)}
        </View>

        <Text style={styles.description}>
          Allow your content to be used to improve our models for you
          and other users. We take steps to protect your privacy.{" "}
          <Text
            style={styles.underlined}
            onPress={() =>
              showInfo(
                "Learn more",
                "Learn about ModelNow's data-use and privacy practices.",
              )
            }
          >
            Learn more
          </Text>
        </Text>

        <Text style={[styles.sectionTitle, styles.locationHeading]}>
          Location
        </Text>

        <View style={styles.groupCard}>
          <Pressable
            style={styles.locationRow}
            onPress={() =>
              showInfo(
                "Location services",
                "Manage location access for ModelNow in your device settings.",
              )
            }
          >
            <Text style={styles.rowTitle}>Location services</Text>
            <View style={styles.locationRight}>
              <Text style={styles.mutedValue}>Off</Text>
              <ChevronRight size={18} color="#888888" />
            </View>
          </Pressable>

          <View style={styles.innerDivider} />

          <Pressable
            style={styles.singleActionRow}
            onPress={() =>
              showInfo(
                "Allow location access",
                "Location access can be configured in your device settings.",
              )
            }
          >
            <Text style={styles.blueText}>Allow location access</Text>
          </Pressable>
        </View>

        <Text style={styles.description}>
          When enabled, your location helps ModelNow provide more
          relevant information, like local recommendations, news, and
          weather.{" "}
          <Text
            style={styles.underlined}
            onPress={() =>
              showInfo(
                "Learn more",
                "Location access is optional and can be managed through your device settings.",
              )
            }
          >
            Learn more
          </Text>
        </Text>

        <Pressable
          style={styles.actionCard}
          onPress={() =>
            showInfo(
              "Export Data",
              "Your data export request needs to be connected to the ModelNow backend.",
            )
          }
        >
          <Text style={styles.blueText}>Export Data</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, styles.deleteAccountCard]}
          onPress={() =>
            confirmAction(
              "Delete ModelNow account",
              "Are you sure you want to continue? Account deletion must be handled securely by the account service.",
              "Continue",
            )
          }
        >
          <Text style={styles.redText}>Delete ModelNow account</Text>
        </Pressable>

        <Text style={[styles.sectionTitle, styles.voiceHeading]}>
          Voice
        </Text>

        <View style={styles.toggleCard}>
          <Text style={styles.rowTitle}>
            Include your audio recordings
          </Text>
          {renderToggle(includeAudio, setIncludeAudio)}
        </View>

        <Text style={styles.description}>
          Include your audio recordings from Voice to train our models.
          Transcripts and other files are covered by Improve the model
          for everyone.{" "}
          <Text
            style={styles.underlined}
            onPress={() =>
              showInfo(
                "Learn more",
                "Review how audio recordings and other content may be used.",
              )
            }
          >
            Learn more
          </Text>
        </Text>

        <Text style={[styles.sectionTitle, styles.appsHeading]}>
          Apps with access
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.rowTitle}>
            No apps have access to your contact information.
          </Text>
        </View>

        <Text style={styles.description}>
          Manage the apps that can receive your contact information.
        </Text>

        <Text style={[styles.sectionTitle, styles.chatHeading]}>
          Chat history
        </Text>

        <View style={styles.historyCard}>
          <Pressable
            style={styles.historyRow}
            onPress={() =>
              showInfo(
                "View archived chats",
                "Your archived chats will appear here when archive functionality is connected.",
              )
            }
          >
            <Text style={styles.rowTitle}>View archived chats</Text>
            <ChevronRight size={18} color="#888888" />
          </Pressable>

          <View style={styles.innerDivider} />

          <Pressable
            style={styles.historyRow}
            onPress={() =>
              confirmAction(
                "Archive chat history",
                "Archive your chat history? This action needs to be connected to your chat storage.",
                "Continue",
              )
            }
          >
            <Text style={styles.blueText}>Archive chat history</Text>
          </Pressable>

          <View style={styles.innerDivider} />

          <Pressable
            style={styles.historyRow}
            onPress={() =>
              confirmAction(
                "Clear chat history",
                "Are you sure you want to clear your chat history? This cannot be undone once implemented.",
                "Continue",
              )
            }
          >
            <Text style={styles.redText}>Clear chat history</Text>
          </Pressable>
        </View>
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
    height: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    left: 60,
    right: 60,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
  },
  headerSpacer: {
    width: 42,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  modelToggleCard: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: "#171717",
  },
  description: {
    marginTop: 10,
    marginHorizontal: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#858585",
  },
  underlined: {
    textDecorationLine: "underline",
    color: "#858585",
  },
  sectionTitle: {
    marginHorizontal: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: "#858585",
  },
  locationHeading: {
    marginTop: 22,
    marginBottom: 7,
  },
  groupCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  locationRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  locationRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mutedValue: {
    fontSize: 13,
    color: "#888888",
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DDDDDD",
  },
  singleActionRow: {
    minHeight: 48,
    justifyContent: "center",
  },
  blueText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#315BC5",
  },
  redText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D92746",
  },
  actionCard: {
    minHeight: 52,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  deleteAccountCard: {
    marginTop: 14,
  },
  voiceHeading: {
    marginTop: 24,
    marginBottom: 7,
  },
  toggleCard: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  appsHeading: {
    marginTop: 24,
    marginBottom: 7,
  },
  infoCard: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  chatHeading: {
    marginTop: 24,
    marginBottom: 7,
  },
  historyCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  historyRow: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
});
