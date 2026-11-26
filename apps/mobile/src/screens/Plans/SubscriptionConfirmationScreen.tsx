import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { PaymentMethod } from "./PaymentMethodsScreen";

type Props = {
  plan: "plus" | "pro";
  billing: "monthly" | "yearly";
  paymentMethod: PaymentMethod;
  onBack: () => void;
  onSubscribe: () => void;
};

export default function SubscriptionConfirmationScreen({
  plan,
  billing,
  paymentMethod,
  onSubscribe,
}: Props) {
  const planName = plan === "plus" ? "ModelNow Plus" : "ModelNow Pro";
  const credits = plan === "plus" ? 2000 : 5000;
  const price =
    plan === "plus"
      ? billing === "monthly"
        ? 699
        : 6999
      : billing === "monthly"
      ? 1499
      : 14999;
  const billingLabel = billing === "monthly" ? "Monthly" : "Yearly";

  const transactionId = useMemo(
    () => `MN_${Date.now().toString().slice(-8)}`,
    []
  );

  const formattedNextDate = useMemo(() => {
    const nextBillingDate = new Date();
    if (billing === "monthly") {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }
    return nextBillingDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [billing]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.successRing}>
            <Ionicons name="checkmark" size={36} color="#10B981" />
          </View>
          <Text style={styles.title}>Subscription Active!</Text>
          <Text style={styles.subtitle}>
            Welcome to {planName}. Your {credits.toLocaleString()} monthly
            credits have been added.
          </Text>
        </View>

        <View style={styles.receiptCard}>
          <Text style={styles.cardEyebrow}>RECEIPT SUMMARY</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan</Text>
            <Text style={styles.detailValue}>{planName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Credits added</Text>
            <Text style={[styles.detailValue, { color: "#60A5FA" }]}>
              +{credits.toLocaleString()} credits
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Billing cycle</Text>
            <Text style={styles.detailValue}>{billingLabel}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment method</Text>
            <Text style={styles.detailValue}>{paymentMethod}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next billing date</Text>
            <Text style={styles.detailValue}>{formattedNextDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transactionId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Paid</Text>
            <Text style={styles.totalValue}>₹{price}</Text>
          </View>
        </View>

        <View style={styles.statusBanner}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={20}
            color="#10B981"
          />
          <Text style={styles.statusText}>
            Auto-renewal is active. You can manage or cancel anytime from
            Settings.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onSubscribe}>
          <Text style={styles.primaryBtnText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090A0F" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24 },
  hero: { alignItems: "center", marginBottom: 28 },
  successRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(16, 185, 129, 0.14)",
    borderWidth: 1.5,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  receiptCard: {
    backgroundColor: "#111625",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F293D",
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#60A5FA",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  detailLabel: { fontSize: 13, color: "#9CA3AF" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
  divider: { height: 1, backgroundColor: "#1E2638", marginVertical: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  totalValue: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#111625",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1F293D",
    marginTop: 16,
  },
  statusText: { flex: 1, fontSize: 12, color: "#9CA3AF", lineHeight: 18 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#090A0F",
  },
  primaryBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#090A0F", fontSize: 16, fontWeight: "700" },
});