
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
} from "react-native";

import {
  ArrowLeft,
  ChevronRight,
  X,
} from "lucide-react-native";

type Props = {
  onBack: () => void;
};

const aboutItems = [
  "Help Center",
  "Terms of Use",
  "Privacy Policy",
];

const openSourceLicenses = [
  {
    name: "React Native",
    license: "MIT License",
  },
  {
    name: "React",
    license: "MIT License",
  },
  {
    name: "Expo",
    license: "MIT License",
  },
  {
    name: "Lucide React Native",
    license: "ISC License",
  },
];

export default function AboutScreen({ onBack }: Props) {
  const [licensesVisible, setLicensesVisible] = useState(false);

  const handleItemPress = (item: string) => {
    if (item === "Licenses") {
      setLicensesVisible(true);
      return;
    }

    // Connect these links to your actual pages when available.
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#171717" />
        </Pressable>

        <Text style={styles.headerTitle}>About</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {aboutItems.map((item) => (
            <Pressable
              key={item}
              onPress={() => handleItemPress(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={styles.rowLabel}>{item}</Text>
              <ChevronRight size={18} color="#737373" />
            </Pressable>
          ))}

          <Pressable
            onPress={() => handleItemPress("Licenses")}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}
          >
            <Text style={styles.rowLabel}>Licenses</Text>
            <ChevronRight size={18} color="#737373" />
          </Pressable>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>
              ModelNow for Android
            </Text>
            <Text style={styles.versionNumber}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={licensesVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLicensesVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Open Source Licenses
              </Text>

              <Pressable
                onPress={() => setLicensesVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close licenses"
              >
                <X size={22} color="#171717" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.licenseList}
              showsVerticalScrollIndicator={false}
            >
              {openSourceLicenses.map((item) => (
                <View key={item.name} style={styles.licenseItem}>
                  <Text style={styles.licenseName}>
                    {item.name}
                  </Text>
                  <Text style={styles.licenseType}>
                    {item.license}
                  </Text>
                </View>
              ))}

              <Text style={styles.licenseNote}>
                This list is a starter list. Verify the installed
                dependencies and their licences before release.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#171717",
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  row: {
    minHeight: 43,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  rowPressed: {
    backgroundColor: "#F5F5F5",
  },
  rowLabel: {
    fontSize: 13,
    color: "#202020",
  },
  versionRow: {
    minHeight: 43,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  versionLabel: {
    fontSize: 12,
    color: "#737373",
  },
  versionNumber: {
    fontSize: 12,
    color: "#737373",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "70%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#171717",
  },
  licenseList: {
    flexShrink: 1,
  },
  licenseItem: {
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  licenseName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#171717",
  },
  licenseType: {
    fontSize: 12,
    color: "#737373",
    marginTop: 3,
  },
  licenseNote: {
    fontSize: 11,
    lineHeight: 16,
    color: "#737373",
    marginTop: 12,
  },
});
