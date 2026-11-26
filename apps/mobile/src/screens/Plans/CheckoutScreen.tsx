import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { PaymentMethod } from "./PaymentMethodsScreen";

export type PaymentResult = "success" | "failed" | "cancelled";

type Props = {
  plan: "plus" | "pro";
  billing: "monthly" | "yearly";
  paymentMethod: PaymentMethod;
  isLoading: boolean;
  onBack: () => void;
  onPayNow: () => void;
};

const PLAN_DETAILS = {
  plus: {
    name: "ModelNow Plus",
    credits: "2,000 credits",
    monthlyPrice: "₹699",
    yearlyPrice: "₹6,999",
  },
  pro: {
    name: "ModelNow Pro",
    credits: "5,000 credits",
    monthlyPrice: "₹1,499",
    yearlyPrice: "₹14,999",
  },
};

export default function CheckoutScreen({
  plan,
  billing,
  paymentMethod,
  isLoading,
  onBack,
  onPayNow,
}: Props) {
  const insets = useSafeAreaInsets();
  const details = PLAN_DETAILS[plan];
  const price =
    billing === "monthly" ? details.monthlyPrice : details.yearlyPrice;

  const isCard = paymentMethod === "Credit or debit card";

  // Card form state
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleProceedPress = () => {
    if (isCard) {
      setCardModalVisible(true);
    } else {
      onPayNow();
    }
  };

  const handleCardSubmit = () => {
    const rawDigits = cardNumber.replace(/\s/g, "");
    if (rawDigits.length < 13) {
      Alert.alert("Invalid card number", "Please enter a valid 13–16 digit card number.");
      return;
    }
    if (expiry.length < 5) {
      Alert.alert("Invalid expiry", "Please enter expiry in MM/YY format.");
      return;
    }
    if (cvv.length < 3) {
      Alert.alert("Invalid CVV", "Please enter a valid 3 or 4 digit CVV.");
      return;
    }
    if (!cardName.trim()) {
      Alert.alert("Name required", "Please enter the cardholder's name.");
      return;
    }

    setCardModalVisible(false);
    onPayNow();
  };

  const footerBottom = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 24 : 16
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>
        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons name="settings-sharp" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Complete your order</Text>
        <Text style={styles.subtitle}>
          Review your subscription details before proceeding.
        </Text>

        {/* Order Summary Box */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>YOUR PLAN</Text>

          <View style={styles.planRow}>
            <View style={styles.planLeft}>
              <View style={styles.planIconBox}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#60A5FA"
                />
              </View>
              <View>
                <Text style={styles.planName}>{details.name}</Text>
                <Text style={styles.planCredits}>{details.credits}</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>{price}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Billing cycle</Text>
            <Text style={styles.metaValue}>
              {billing === "monthly" ? "Monthly" : "Yearly"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Preferred payment method</Text>
            <Text style={styles.metaValue}>{paymentMethod}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Subscription</Text>
            <Text style={styles.metaValue}>Recurring</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total due today</Text>
            <Text style={styles.totalPrice}>{price}</Text>
          </View>
        </View>

        {/* Selected Payment Method Card */}
        <TouchableOpacity style={styles.methodCard} onPress={onBack}>
          <View style={styles.methodIconBox}>
            <Ionicons
              name={isCard ? "card-outline" : "phone-portrait-outline"}
              size={20}
              color="#60A5FA"
            />
          </View>
          <View style={styles.methodTextWrap}>
            <Text style={styles.methodTitle}>Payment method</Text>
            <Text style={styles.methodValue}>{paymentMethod}</Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color="#34D399"
          />
          <Text style={styles.securityText}>
            Your subscription activates immediately once payment is confirmed via{" "}
            {paymentMethod}.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Pay CTA */}
      <View style={[styles.footer, { paddingBottom: footerBottom }]}>
        <TouchableOpacity
          style={[styles.payBtn, isLoading && styles.payBtnDisabled]}
          onPress={handleProceedPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payBtnText}>Proceed to Pay {price}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.footerHint}>
          Your subscription will become active immediately after confirmation.
        </Text>
      </View>

      {/* Credit / Debit Card Details Modal */}
      <Modal
        visible={cardModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCardModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add credit or debit card</Text>
              <TouchableOpacity onPress={() => setCardModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Card number</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              maxLength={19}
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#6B7280"
                  keyboardType="number-pad"
                  maxLength={5}
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#6B7280"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  value={cvv}
                  onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Name on card</Text>
            <TextInput
              style={styles.input}
              placeholder="Pujitha Marikanti"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              value={cardName}
              onChangeText={setCardName}
            />

            <TouchableOpacity
              style={styles.modalPayBtn}
              onPress={handleCardSubmit}
            >
              <Text style={styles.payBtnText}>Pay {price}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090A0F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1E26",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#FFFFFF", marginTop: 12 },
  subtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 6, marginBottom: 22 },
  card: {
    backgroundColor: "#12141D",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E2230",
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#60A5FA",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1B1F2E",
    alignItems: "center",
    justifyContent: "center",
  },
  planName: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  planCredits: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  planPrice: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  divider: { height: 1, backgroundColor: "#1E2230", marginVertical: 16 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaLabel: { fontSize: 13, color: "#9CA3AF" },
  metaValue: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  totalPrice: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12141D",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#1E2230",
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1B1F2E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  methodTextWrap: { flex: 1 },
  methodTitle: { fontSize: 12, color: "#9CA3AF" },
  methodValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 2,
  },
  changeText: { fontSize: 13, fontWeight: "600", color: "#60A5FA" },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 4,
  },
  securityText: { flex: 1, fontSize: 12, color: "#9CA3AF", lineHeight: 18 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#090A0F",
  },
  payBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  payBtnDisabled: { opacity: 0.7 },
  payBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  footerHint: {
    textAlign: "center",
    fontSize: 11,
    color: "#6B7280",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#13151F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: "#232738",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#1B1E2B",
    borderWidth: 1,
    borderColor: "#2C3144",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  modalPayBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 22,
  },
});