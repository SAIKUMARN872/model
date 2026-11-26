
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

type Props = {
  visible: boolean;
  onLogout: () => void;
  onCancel: () => void;
};

export default function Logout({
  visible,
  onLogout,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Log out</Text>
            <Text style={styles.questionMark}>?</Text>
          </View>

          <Text style={styles.message}>
            You will need to sign back in to keep using ModelNow.
          </Text>

          <Pressable
            onPress={onLogout}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <Text style={styles.logoutButtonText}>Log out</Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
            ]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  dialog: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 23,
    paddingTop: 24,
    paddingBottom: 15,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 12,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#171717",
  },

  questionMark: {
    fontSize: 23,
    fontWeight: "800",
    color: "#171717",
  },

  message: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555D69",
    textAlign: "center",
    marginBottom: 22,
  },

  logoutButton: {
    width: "100%",
    height: 48,
    borderRadius: 25,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButtonPressed: {
    backgroundColor: "#333333",
  },

  logoutButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  cancelButton: {
    minHeight: 42,
    paddingHorizontal: 24,
    marginTop: 5,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonPressed: {
    backgroundColor: "#F2F2F2",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
  },
});
