import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polygon } from "react-native-svg";

export type PaymentMethod =
  | "Credit or debit card"
  | "Google Pay"
  | "PhonePe"
  | "Paytm"
  | "super.money"
  | "WhatsApp";

type Props = {
  planName: string;
  userEmail?: string;
  savedUpiLabel?: string;
  onBack: () => void;
  onContinue: (method: PaymentMethod) => void;
};

function UpiTriColorMark({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.75} viewBox="0 0 32 24">
      <Polygon points="14,2 24,12 10,22" fill="#008B45" />
      <Polygon points="8,2 18,12 4,22" fill="#F37021" />
    </Svg>
  );
}

type UpiAppItem = {
  id: string;
  label: string;
  value: PaymentMethod;
  circleBg: string;
  renderBadgeContent: () => React.ReactNode;
};

const UPI_APPS: UpiAppItem[] = [
  {
    id: "gpay",
    label: "GPay",
    value: "Google Pay",
    circleBg: "#FFFFFF",
    renderBadgeContent: () => (
      <Image
        source={require("../../../assets/payment-logos/gpay.png")}
        style={styles.appLogoImage}
        resizeMode="contain"
      />
    ),
  },
  {
    id: "phonepe",
    label: "PhonePe",
    value: "PhonePe",
    circleBg: "#5F259F",
    renderBadgeContent: () => <Text style={styles.phonePeGlyph}>पे</Text>,
  },
  {
    id: "paytm",
    label: "Paytm",
    value: "Paytm",
    circleBg: "#FFFFFF",
    renderBadgeContent: () => (
      <View style={styles.paytmRow}>
        <Text style={styles.paytmDark}>pay</Text>
        <Text style={styles.paytmLight}>tm</Text>
      </View>
    ),
  },
  {
    id: "supermoney",
    label: "super.money",
    value: "super.money",
    circleBg: "#4338CA",
    renderBadgeContent: () => (
      <Image
        source={require("../../../assets/payment-logos/supermoney.png")}
        style={styles.superMoneyImage}
        resizeMode="cover"
      />
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "WhatsApp",
    circleBg: "#25D366",
    renderBadgeContent: () => (
      <Image
        source={require("../../../assets/payment-logos/whatsapp.png")}
        style={styles.appLogoImage}
        resizeMode="contain"
      />
    ),
  },
];

export default function PaymentMethodsScreen({
  userEmail = "pujithamarikanti@gmail.com",
  savedUpiLabel = "Union Bank of India: @oksbi",
  onBack,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("Google Pay");
  const [upiExpanded, setUpiExpanded] = useState(true);

  const footerBottomPadding = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 24 : 14
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#E3E3E3" />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Payment methods</Text>
          <Text style={styles.headerEmail}>{userEmail}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Saved Primary UPI Account Row */}
        <TouchableOpacity
          style={styles.savedMethodRow}
          onPress={() => setSelectedMethod("Google Pay")}
          activeOpacity={0.75}
        >
          <View style={styles.miniCardBadge}>
            <Image
              source={require("../../../assets/payment-logos/gpay.png")}
              style={styles.miniLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.savedMethodText}>{savedUpiLabel}</Text>
          {selectedMethod === "Google Pay" && (
            <Ionicons name="checkmark-circle" size={20} color="#8AB4F8" />
          )}
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        {/* Section Heading */}
        <Text style={styles.sectionHeading}>
          Add payment method to your Google Account
        </Text>

        {/* Add Card Row */}
        <TouchableOpacity
          style={[
            styles.addCardRow,
            selectedMethod === "Credit or debit card" && styles.selectedRowBg,
          ]}
          onPress={() => setSelectedMethod("Credit or debit card")}
          activeOpacity={0.75}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="card-outline" size={22} color="#9AA0A6" />
            <Text style={styles.rowLabel}>Add card</Text>
          </View>

          <View style={styles.cardBrandsRow}>
            <View style={styles.brandChip}>
              <Text style={styles.visaText}>VISA</Text>
            </View>
            <View style={styles.brandChip}>
              <View style={styles.mcCircles}>
                <View style={[styles.mcDot, { backgroundColor: "#EB001B" }]} />
                <View
                  style={[
                    styles.mcDot,
                    { backgroundColor: "#F79E1B", marginLeft: -5 },
                  ]}
                />
              </View>
            </View>
            <View style={styles.brandChip}>
              <Text style={styles.rupayText}>RuPay</Text>
            </View>
            <Text style={styles.moreText}>+ more</Text>
          </View>
        </TouchableOpacity>

        {/* Pay with UPI Accordion Header */}
        <TouchableOpacity
          style={styles.upiAccordionHeader}
          onPress={() => setUpiExpanded((prev) => !prev)}
          activeOpacity={0.75}
        >
          <View style={styles.rowLeft}>
            <View style={styles.upiLogoLockup}>
              <Text style={styles.upiWordmark}>UPI</Text>
              <UpiTriColorMark size={14} />
            </View>
            <Text style={styles.rowLabel}>Pay with UPI</Text>
          </View>

          <View style={styles.chevronCircle}>
            <Ionicons
              name={upiExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#E3E3E3"
            />
          </View>
        </TouchableOpacity>

        {/* Expanded UPI Apps List */}
        {upiExpanded && (
          <View style={styles.upiAppsContainer}>
            {UPI_APPS.map((app) => {
              const isSelected = selectedMethod === app.value;
              return (
                <TouchableOpacity
                  key={app.id}
                  style={[
                    styles.upiAppRow,
                    isSelected && styles.selectedRowBg,
                  ]}
                  onPress={() => setSelectedMethod(app.value)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.roundBadge,
                      { backgroundColor: app.circleBg },
                    ]}
                  >
                    {app.renderBadgeContent()}
                  </View>

                  <Text style={styles.upiAppLabel}>{app.label}</Text>

                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#8AB4F8"
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Continue Button safely above Android navigation bar */}
      <View style={[styles.footer, { paddingBottom: footerBottomPadding }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => onContinue(selectedMethod)}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131314",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 18,
  },
  backBtn: {
    padding: 4,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#E3E3E3",
  },
  headerEmail: {
    fontSize: 13,
    color: "#9AA0A6",
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  savedMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
    gap: 16,
  },
  miniCardBadge: {
    width: 36,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  miniLogo: {
    width: 24,
    height: 16,
  },
  savedMethodText: {
    flex: 1,
    fontSize: 15,
    color: "#E3E3E3",
    fontWeight: "400",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#2C2D30",
    marginVertical: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9AA0A6",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },
  addCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  selectedRowBg: {
    backgroundColor: "rgba(138, 180, 248, 0.08)",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rowLabel: {
    fontSize: 15,
    color: "#E3E3E3",
    fontWeight: "400",
  },
  cardBrandsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandChip: {
    width: 28,
    height: 18,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  visaText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#1A1F71",
    letterSpacing: -0.3,
  },
  mcCircles: {
    flexDirection: "row",
    alignItems: "center",
  },
  mcDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rupayText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  moreText: {
    fontSize: 11,
    color: "#9AA0A6",
    marginLeft: 2,
  },
  upiAccordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  upiLogoLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 34,
  },
  upiWordmark: {
    fontSize: 11,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#B0B5BA",
    letterSpacing: -0.5,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#28292C",
    alignItems: "center",
    justifyContent: "center",
  },
  upiAppsContainer: {
    paddingLeft: 56,
    paddingRight: 22,
    paddingTop: 4,
  },
  upiAppRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 16,
  },
  roundBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  appLogoImage: {
    width: 28,
    height: 28,
  },
  superMoneyImage: {
    width: 42,
    height: 42,
  },
  phonePeGlyph: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  paytmRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paytmDark: {
    fontSize: 11,
    fontWeight: "900",
    color: "#002970",
    letterSpacing: -0.4,
  },
  paytmLight: {
    fontSize: 11,
    fontWeight: "900",
    color: "#00BAF2",
    letterSpacing: -0.4,
  },
  upiAppLabel: {
    fontSize: 15,
    color: "#E3E3E3",
    fontWeight: "400",
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    backgroundColor: "#131314",
    borderTopWidth: 1,
    borderTopColor: "#232427",
  },
  continueBtn: {
    backgroundColor: "#8AB4F8",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueBtnText: {
    color: "#062E6F",
    fontSize: 15,
    fontWeight: "700",
  },
});