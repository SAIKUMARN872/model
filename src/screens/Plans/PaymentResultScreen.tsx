import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PaymentResult } from "./CheckoutScreen";

type Props = {
  result: PaymentResult;
  onRetry: () => void;
  onDone: () => void;
};

export default function PaymentResultScreen({
  result,
  onRetry,
  onDone,
}: Props) {
  const isSuccess = result === "success";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerBox}>
        <View
          style={[
            styles.statusCircle,
            isSuccess ? styles.successCircle : styles.failCircle,
          ]}
        >
          <Ionicons
            name={isSuccess ? "checkmark" : "close"}
            size={36}
            color={isSuccess ? "#10B981" : "#EF4444"}
          />
        </View>

        <Text style={styles.title}>
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </Text>
        <Text style={styles.subtitle}>
          {isSuccess
            ? "Your ModelNow subscription is now active."
            : "We could not complete your payment. Please try again."}
        </Text>

        {!isSuccess && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneBtnText}>Back to Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090A0F" },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  statusCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successCircle: {
    backgroundColor: "rgba(16, 185, 129, 0.14)",
    borderColor: "#10B981",
  },
  failCircle: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    borderColor: "#EF4444",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  retryBtn: {
    width: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  retryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  doneBtn: {
    width: "100%",
    backgroundColor: "#1C1E26",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  doneBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});