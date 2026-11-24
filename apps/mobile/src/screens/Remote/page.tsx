
import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowDownToLine,
  Laptop,
  Menu,
  Monitor,
  ShieldCheck,
} from "lucide-react-native";

type RemotePageProps = {
  onBack?: () => void;
  onMenuPress?: () => void;
};

const COLORS = {
  background: "#FFFFFF",
  text: "#111111",
  muted: "#686868",
  border: "#D4D4D4",
  black: "#0B0B0B",
  icon: "#222222",
};

export default function RemotePage({
  onBack,
  onMenuPress,
}: RemotePageProps) {
  const handleDesktopSignedIn = () => {
    Alert.alert(
      "Connect to your desktop",
      "Desktop pairing is not configured yet. Once the ModelNow desktop app and secure pairing service are ready, you can connect your devices here.",
      [{ text: "OK" }]
    );
  };

  const handleDownloadLink = () => {
    Alert.alert(
      "Desktop app",
      "Email delivery is not configured yet. Add a verified ModelNow desktop download URL and a backend email service to enable this feature.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.menuButton}
            onPress={
              onMenuPress ??
              (() =>
                Alert.alert(
                  "Navigation",
                  "Connect this button to your existing ModelNow navigation menu."
                ))
            }
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
          >
            <Menu size={27} color={COLORS.text} strokeWidth={2.2} />
          </Pressable>

          <Text style={styles.headerTitle}>Remote</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main illustration */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Laptop
                size={76}
                color={COLORS.black}
                strokeWidth={2.4}
              />
              <View style={styles.connectionDots}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} style={styles.dot} />
                ))}
              </View>
            </View>

            <Text style={styles.heroTitle}>Set up Remote</Text>

            <Text style={styles.heroDescription}>
              Use the power of ModelNow desktop while on the go.
            </Text>
          </View>

          {/* Explanation */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Monitor
                  size={31}
                  color={COLORS.muted}
                  strokeWidth={2}
                />
              </View>

              <Text style={styles.featureText}>
                Control ModelNow on your desktop computer to build software
                and do more ambitious work.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <ShieldCheck
                  size={31}
                  color={COLORS.muted}
                  strokeWidth={1.8}
                />
              </View>

              <Text style={styles.featureText}>
                To get started, sign in to the ModelNow desktop app with
                the same account you use on your phone.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleDesktopSignedIn}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              I'm signed in on desktop
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleDownloadLink}
            accessibilityRole="button"
          >
            <ArrowDownToLine
              size={19}
              color={COLORS.text}
              style={styles.downloadIcon}
            />
            <Text style={styles.secondaryButtonText}>
              Email me a download link
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 76,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuButton: {
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    left: 90,
    right: 90,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSpacer: {
    width: 58,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 27,
    paddingBottom: 25,
  },
  hero: {
    alignItems: "center",
    marginTop: 66,
  },
  heroIcon: {
    height: 115,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  connectionDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: -1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.black,
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  heroDescription: {
    marginTop: 11,
    maxWidth: 400,
    fontSize: 17,
    lineHeight: 27,
    fontWeight: "400",
    color: COLORS.muted,
    textAlign: "center",
  },
  features: {
    marginTop: 64,
    gap: 34,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
  },
  featureIcon: {
    width: 40,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 3,
  },
  featureText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 28,
    color: COLORS.muted,
  },
  bottomActions: {
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 20,
    gap: 14,
    backgroundColor: COLORS.background,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 32,
    paddingHorizontal: 16,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.background,
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 32,
    borderWidth: 1.4,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  downloadIcon: {
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
