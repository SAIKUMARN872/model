import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  onBack: () => void;
  onUpgrade: (plan: "plus" | "pro", billing: "monthly" | "yearly") => void;
};

const FEATURES = [
  { name: "Basic AI models", free: true, plus: true, pro: true },
  { name: "More messages", free: true, plus: true, pro: true },
  { name: "More file uploads", free: true, plus: true, pro: true },
  { name: "More image creation", free: true, plus: true, pro: true },
  { name: "Longer memory", free: true, plus: true, pro: true },
  { name: "Advanced AI models", free: false, plus: false, pro: true },
];

export default function UpgradePlanScreen({ onBack, onUpgrade }: Props) {
  const [selectedTier, setSelectedTier] = useState<"Plus" | "Pro">("Plus");
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">(
    "Monthly"
  );

  const getPrice = () => {
    if (selectedTier === "Plus") return billingCycle === "Monthly" ? 699 : 6999;
    return billingCycle === "Monthly" ? 1499 : 14999;
  };

  const handleUpgrade = () => {
    const planId = selectedTier === "Plus" ? "plus" : "pro";
    const billingId = billingCycle === "Monthly" ? "monthly" : "yearly";
    onUpgrade(planId, billingId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons name="settings-sharp" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>
          ModelNow <Text style={styles.titleAccent}>{selectedTier}</Text>
        </Text>
        <Text style={styles.subtitle}>
          {selectedTier === "Plus"
            ? "More access for everyday AI use"
            : "Maximum power for heavy workflows"}
        </Text>

        {/* Tier Selector (Plus / Pro) */}
        <View style={styles.tierContainer}>
          <TouchableOpacity
            style={[
              styles.tierTab,
              selectedTier === "Plus" && styles.tierTabActive,
            ]}
            onPress={() => setSelectedTier("Plus")}
          >
            <Ionicons
              name="flash-outline"
              size={18}
              color={selectedTier === "Plus" ? "#FFFFFF" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.tierText,
                selectedTier === "Plus" && styles.tierTextActive,
              ]}
            >
              Plus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tierTab,
              selectedTier === "Pro" && styles.tierTabActive,
            ]}
            onPress={() => setSelectedTier("Pro")}
          >
            <MaterialCommunityIcons
              name="creation"
              size={18}
              color={selectedTier === "Pro" ? "#FFFFFF" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.tierText,
                selectedTier === "Pro" && styles.tierTextActive,
              ]}
            >
              Pro
            </Text>
          </TouchableOpacity>
        </View>

        {/* Billing Cycle Toggle (Monthly / Yearly) */}
        <View style={styles.cycleWrapper}>
          <View style={styles.cycleContainer}>
            {(["Monthly", "Yearly"] as const).map((cycle) => (
              <TouchableOpacity
                key={cycle}
                style={[
                  styles.cycleTab,
                  billingCycle === cycle && styles.cycleTabActive,
                ]}
                onPress={() => setBillingCycle(cycle)}
              >
                <Text
                  style={[
                    styles.cycleText,
                    billingCycle === cycle && styles.cycleTextActive,
                  ]}
                >
                  {cycle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.billedText}>
            Billed {billingCycle.toLowerCase()}
          </Text>
        </View>

        {/* Feature Comparison Card */}
        <View style={styles.featuresCard}>
          <View style={styles.featureHeaderRow}>
            <Text style={styles.featureHeaderLabel}>Features</Text>
            <Text style={styles.featureColLabel}>Free</Text>
            <Text style={[styles.featureColLabel, { color: "#3B82F6" }]}>
              {selectedTier}
            </Text>
          </View>

          {FEATURES.map((item, idx) => {
            const tierIncluded = selectedTier === "Plus" ? item.plus : item.pro;
            return (
              <View
                key={item.name}
                style={[
                  styles.featureRow,
                  idx === FEATURES.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.featureName}>{item.name}</Text>
                <View style={styles.iconCol}>
                  {item.free ? (
                    <Ionicons name="checkmark" size={18} color="#9CA3AF" />
                  ) : (
                    <Text style={styles.dash}>—</Text>
                  )}
                </View>
                <View style={styles.iconCol}>
                  {tierIncluded ? (
                    <Ionicons name="checkmark" size={18} color="#3B82F6" />
                  ) : (
                    <Text style={styles.dash}>—</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Sticky Footer */}
      <View style={styles.footer}>
        <Text style={styles.selectedPlanHint}>
          Selected plan: {selectedTier}
        </Text>
        <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade}>
          <Text style={styles.upgradeBtnText}>
            Upgrade for ₹{getPrice()}/{billingCycle === "Monthly" ? "mo" : "yr"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.cancelNote}>
          Renews {billingCycle.toLowerCase()}. Cancel anytime.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090A0F" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1E26",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 30, fontWeight: "700", color: "#FFFFFF", marginTop: 12 },
  titleAccent: { color: "#3B82F6" },
  subtitle: { fontSize: 15, color: "#9CA3AF", marginTop: 6, marginBottom: 22 },
  tierContainer: {
    flexDirection: "row",
    backgroundColor: "#12141C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#232634",
    padding: 4,
  },
  tierTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  tierTabActive: { backgroundColor: "#232631" },
  tierText: { fontSize: 15, fontWeight: "600", color: "#9CA3AF" },
  tierTextActive: { color: "#FFFFFF" },
  cycleWrapper: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  cycleContainer: {
    flexDirection: "row",
    backgroundColor: "#12141C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#232634",
    padding: 4,
    width: 220,
  },
  cycleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  cycleTabActive: { backgroundColor: "#232631" },
  cycleText: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  cycleTextActive: { color: "#FFFFFF" },
  billedText: { fontSize: 12, color: "#6B7280", marginTop: 8 },
  featuresCard: {
    backgroundColor: "#12141C",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E2130",
  },
  featureHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2230",
  },
  featureHeaderLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#E5E7EB",
  },
  featureColLabel: {
    width: 48,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1D29",
  },
  featureName: { flex: 1, fontSize: 14, color: "#E5E7EB" },
  iconCol: { width: 48, alignItems: "center" },
  dash: { color: "#4B5563", fontSize: 16 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#161822",
    backgroundColor: "#090A0F",
  },
  selectedPlanHint: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 10,
  },
  upgradeBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  upgradeBtnText: { color: "#090A0F", fontSize: 16, fontWeight: "700" },
  cancelNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#6B7280",
    marginTop: 10,
  },
});