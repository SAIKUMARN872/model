
import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeft,
  Laptop,
  ShieldCheck,
  Monitor,
  Mail,
  ChevronRight,
} from "lucide-react-native";

type RemotePageProps = {
  onBack?: () => void;
  onMenuPress?: () => void;
};

const COLORS = {
  background: "#FFFFFF",
  text: "#171717",
  muted: "#737373",
  border: "#E5E5E5",
  soft: "#F5F5F5",
  black: "#111111",
};

export default function RemotePage({
  onBack,
}: RemotePageProps) {
  const handleDesktopSignIn = () => {
    Alert.alert(
      "Remote setup",
      "Desktop pairing is not configured yet. Connect the ModelNow desktop pairing service to continue."
    );
  };

  const handleEmailLink = () => {
    Alert.alert(
      "Download link",
      "Email delivery is not configured yet. Connect the ModelNow email service to send a desktop download link."
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
<StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to chat"
          onPress={onBack}
          style={styles.headerButton}
        >
          <ArrowLeft size={22} color={COLORS.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Remote</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.illustration}>
          <View style={styles.laptop}>
            <Laptop size={82} color={COLORS.text} strokeWidth={1.3} />
          </View>

          <View style={styles.phoneBadge}>
            <Monitor size={23} color={COLORS.text} />
          </View>

          <View style={styles.shieldBadge}>
            <ShieldCheck size={23} color="#15803D" />
          </View>
        </View>

        <Text style={styles.title}>Set up Remote</Text>

        <Text style={styles.description}>
          Connect your desktop to ModelNow and continue working
          with your desktop from your mobile device.
        </Text>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Monitor size={21} color={COLORS.text} />
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Access your desktop</Text>
            <Text style={styles.featureDescription}>
              Prepare to connect your desktop to ModelNow.
            </Text>
          </View>

          <ChevronRight size={19} color={COLORS.muted} />
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <ShieldCheck size={21} color={COLORS.text} />
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Secure connection</Text>
            <Text style={styles.featureDescription}>
              Remote access will require a verified connection.
            </Text>
          </View>

          <ChevronRight size={19} color={COLORS.muted} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleDesktopSignIn}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            I&apos;m signed in on desktop
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleEmailLink}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Mail size={18} color={COLORS.text} />
          <Text style={styles.secondaryButtonText}>
            Email me a download link
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          Desktop pairing and remote control must be configured
          before these actions can work.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  illustration: {
    width: 190,
    height: 155,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  laptop: {
    width: 144,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: COLORS.soft,
  },
  phoneBadge: {
    position: "absolute",
    right: 4,
    bottom: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shieldBadge: {
    position: "absolute",
    left: 3,
    top: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    maxWidth: 340,
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 28,
  },
  feature: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    width: "100%",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.black,
    borderRadius: 15,
    marginTop: 30,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 18,
  },
});
