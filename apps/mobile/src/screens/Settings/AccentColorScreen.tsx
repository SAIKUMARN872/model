
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type AccentColor =
  | "Blue"
  | "Cyan"
  | "Green"
  | "Lime"
  | "Yellow"
  | "Orange"
  | "Pink"
  | "Magenta"
  | "Purple"
  | "Black";

type AccentColorPopupProps = {
  visible: boolean;
  value: AccentColor;
  onSelect: (color: AccentColor) => void;
  onClose: () => void;
};

const ACCENT_COLORS: Record<AccentColor, string> = {
  Blue: "#3663EB",
  Cyan: "#08B8E8",
  Green: "#08B69A",
  Lime: "#A7D900",
  Yellow: "#FFD43B",
  Orange: "#FF806D",
  Pink: "#ED69AC",
  Magenta: "#D65DD6",
  Purple: "#9B50F5",
  Black: "#000000",
};

const COLOR_OPTIONS = Object.keys(
  ACCENT_COLORS,
) as AccentColor[];

export default function AccentColorPopup({
  visible,
  value,
  onSelect,
  onClose,
}: AccentColorPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      >
        <View style={styles.popupPosition}>
          <Pressable
            style={styles.popup}
            onPress={(event) => event.stopPropagation()}
          >
            {COLOR_OPTIONS.map((color) => (
              <Pressable
                key={color}
                accessibilityRole="button"
                accessibilityLabel={`${color} accent color`}
                onPress={() => onSelect(color)}
                style={styles.option}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor:
                          ACCENT_COLORS[color],
                      },
                    ]}
                  />

                  <Text style={styles.optionText}>
                    {color}
                  </Text>
                </View>

                {value === color && (
                  <Text style={styles.checkmark}>
                    ✓
                  </Text>
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
    width: 280,
    maxWidth: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  checkmark: {
    fontSize: 26,
    fontWeight: "400",
    color: "#111111",
  },
});

