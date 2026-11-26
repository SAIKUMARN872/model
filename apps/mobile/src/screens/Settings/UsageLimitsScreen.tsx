import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import {
  ArrowLeft,
  ChevronRight,
  Gauge,
  RefreshCw,
  Coins,
  Zap,
} from "lucide-react-native";

type Props = {
  onBack: () => void;
  onAutomaticRecharge: () => void;
};

export default function UsageLimitsScreen({
  onBack,
  onAutomaticRecharge,
}: Props) {
  const [usagePercent] = useState(100);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#171717" />
        </Pressable>

        <Text style={styles.headerTitle}>Usage and limits</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Usage</Text>

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <View style={styles.iconBox}>
              <Gauge size={22} color="#315FEA" />
            </View>

            <View style={styles.headingText}>
              <Text style={styles.cardTitle}>
                Agentic usage limit
              </Text>
              <Text style={styles.mutedText}>
                Your available usage for the current period
              </Text>
            </View>
          </View>

          <View style={styles.usageHeading}>
            <Text style={styles.usageLabel}>Usage remaining</Text>
            <Text style={styles.percentage}>
              {usagePercent}%
            </Text>
          </View>

          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: usagePercent,
            }}
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${usagePercent}%` },
              ]}
            />
          </View>

          <Text style={styles.resetText}>
            Resets according to your plan
          </Text>

          <View style={styles.cardDivider} />

          <View style={styles.resetHeading}>
            <RefreshCw size={20} color="#737373" />
            <Text style={styles.cardTitle}>
              Usage limit resets
            </Text>
          </View>

          <Text style={styles.emptyText}>
            No usage limit resets available at this time.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Credits
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <View style={styles.iconBox}>
              <Coins size={22} color="#315FEA" />
            </View>

            <View style={styles.headingText}>
              <Text style={styles.cardTitle}>
                Credits and automatic recharge
              </Text>
              <Text style={styles.mutedText}>
                Manage additional usage credits
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onAutomaticRecharge}
            style={({ pressed }) => [
              styles.rechargeRow,
              pressed && styles.pressed,
            ]}
          >
            <Zap size={21} color="#525252" />

            <Text style={styles.rechargeLabel}>
              Automatic recharge
            </Text>

            <Text style={styles.offText}>Off</Text>

            <ChevronRight size={20} color="#737373" />
          </Pressable>

          <Text style={styles.footnote}>
            Credits can extend usage beyond your plan limits.
            Automatic recharge settings can be configured separately.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          Usage information shown here is a frontend preview.
          Live limits, reset dates, and credit balances will be
          connected to the ModelNow backend.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#171717",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#171717",
    marginTop: 28,
    marginBottom: 14,
  },
  card: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EFF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headingText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
  },
  mutedText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#737373",
  },
  usageHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
  },
  usageLabel: {
    fontSize: 13,
    color: "#525252",
  },
  percentage: {
    fontSize: 17,
    fontWeight: "800",
    color: "#315FEA",
  },
  progressTrack: {
    height: 9,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#315FEA",
  },
  resetText: {
    marginTop: 10,
    fontSize: 12,
    color: "#737373",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 22,
  },
  resetHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: "#737373",
  },
  rechargeRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  rechargeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  offText: {
    fontSize: 13,
    color: "#737373",
  },
  pressed: {
    opacity: 0.65,
  },
  footnote: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 19,
    color: "#737373",
  },
  disclaimer: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 19,
    color: "#737373",
  },
});