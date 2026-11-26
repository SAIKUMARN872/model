
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowLeft, ArrowUp } from "lucide-react-native";

type ReportBugScreenProps = {
  onBack: () => void;
};

export default function ReportBugScreen({
  onBack,
}: ReportBugScreenProps) {
  const [issue, setIssue] = useState("");
  const [shakeToReport, setShakeToReport] = useState(true);

  const handleSend = () => {
    const trimmedIssue = issue.trim();

    if (!trimmedIssue) {
      Alert.alert(
        "Report a bug",
        "Please describe the issue you encountered."
      );
      return;
    }

    Alert.alert(
      "Report a bug",
      "Your report is ready. Connect the feedback API to send it to ModelNow.",
      [
        {
          text: "OK",
          onPress: () => setIssue(""),
        },
      ]
    );
  };

  const handleLearnMore = () => {
    Alert.alert(
      "Learn more",
      "Your feedback helps the ModelNow team identify issues and improve the app."
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
          Report a bug
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Issue description */}
        <Text style={styles.sectionTitle}>
          What happened?
        </Text>

        <View style={styles.inputCard}>
          <TextInput
            value={issue}
            onChangeText={setIssue}
            placeholder="Tell us about the issue you encountered"
            placeholderTextColor="#888888"
            multiline
            textAlignVertical="top"
            style={styles.textInput}
            accessibilityLabel="Describe the issue you encountered"
          />
        </View>

        {/* Feedback information */}
        <Text style={styles.description}>
          Your feedback can be used to improve ModelNow.{" "}
          <Text
            style={styles.learnMore}
            onPress={handleLearnMore}
            accessibilityRole="link"
          >
            Learn more
          </Text>
        </Text>

        {/* Shake-to-report toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>
              Shake phone to report a bug
            </Text>
          </View>

          <Switch
            value={shakeToReport}
            onValueChange={setShakeToReport}
            trackColor={{
              false: "#D9D9D9",
              true: "#222222",
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D9D9D9"
            accessibilityLabel="Shake phone to report a bug"
          />
        </View>

        {/* Send button */}
        <View style={styles.sendContainer}>
          <Pressable
            onPress={handleSend}
            accessibilityRole="button"
            accessibilityLabel="Send bug report"
            style={[
              styles.sendButton,
              !issue.trim() && styles.sendButtonDisabled,
            ]}
          >
            <Text style={styles.sendText}>
              Send
            </Text>

            <ArrowUp
              size={17}
              color="#FFFFFF"
              strokeWidth={2.5}
            />
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
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#222222",
  },

  inputCard: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  textInput: {
    flex: 1,
    minHeight: 120,
    padding: 0,
    fontSize: 14,
    lineHeight: 21,
    color: "#171717",
  },

  description: {
    marginTop: 14,
    marginHorizontal: 6,
    fontSize: 12,
    lineHeight: 19,
    color: "#777777",
  },

  learnMore: {
    color: "#222222",
    textDecorationLine: "underline",
    fontWeight: "500",
  },

  toggleRow: {
    minHeight: 68,
    marginTop: 28,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  toggleTextContainer: {
    flex: 1,
  },

  toggleTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#171717",
  },

  sendContainer: {
    alignItems: "flex-end",
    marginTop: 24,
  },

  sendButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: "#171717",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  sendButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },

  sendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
