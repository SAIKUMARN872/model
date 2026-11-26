
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type AppearanceMode = "System" | "Light" | "Dark";

type AppearancePopupProps = {
  visible: boolean;
  value: AppearanceMode;
  onSelect: (mode: AppearanceMode) => void;
  onClose: () => void;
};

export default function AppearancePopup({
  visible,
  value,
  onSelect,
  onClose,
}: AppearancePopupProps) {
  const options: AppearanceMode[] = ["System", "Light", "Dark"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.popupPosition}>
          <Pressable
            style={styles.popup}
            onPress={(event) => event.stopPropagation()}
          >
            {options.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.option,
                  value === option && styles.selectedOption,
                ]}
                onPress={() => onSelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>

                {value === option && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  popupPosition: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  popup: {
    width: 240,
    maxWidth: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  option: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedOption: {
    backgroundColor: "#F0F4FF",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  selectedOptionText: {
    color: "#2457D6",
    fontWeight: "700",
  },
  checkmark: {
    fontSize: 21,
    fontWeight: "600",
    color: "#2457D6",
  },
});
