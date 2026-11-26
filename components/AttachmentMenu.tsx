
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  Camera,
  Image as ImageIcon,
  Paperclip,
  Globe,
  Telescope,
  Brain,
} from "lucide-react-native";

type AttachmentMenuProps = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onPhotos: () => void;
  onFiles: () => void;
  onWebSearch: () => void;
  onDeepSearch: () => void;
  onThinkHarder: () => void;
};

export default function AttachmentMenu({
  visible,
  onClose,
  onCamera,
  onPhotos,
  onFiles,
  onWebSearch,
  onDeepSearch,
  onThinkHarder,
}: AttachmentMenuProps) {
  const { width, height } = useWindowDimensions();

  const items = [
    { label: "Camera", icon: Camera, action: onCamera },
    { label: "Photos", icon: ImageIcon, action: onPhotos },
    { label: "Files", icon: Paperclip, action: onFiles },
    { label: "Web Search", icon: Globe, action: onWebSearch },
    { label: "Deep Search", icon: Telescope, action: onDeepSearch },
    { label: "Think harder", icon: Brain, action: onThinkHarder },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close attachment menu"
          style={styles.backdrop}
          onPress={onClose}
        />

        <View
          style={[
            styles.menu,
            {
              width: Math.min(width - 32, 360),
              bottom: Math.max(100, height * 0.12),
            },
          ]}
        >
          {items.map(({ label, icon: Icon, action }) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => {
                onClose();
                action();
              }}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.pressedItem,
              ]}
            >
              <View style={styles.iconCircle}>
                <Icon
                  size={22}
                  color="#171717"
                  strokeWidth={1.9}
                />
              </View>

              <Text style={styles.menuLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  menu: {
    position: "absolute",
    left: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 5,
    paddingHorizontal: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },

  menuItem: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 12,
    borderRadius: 16,
  },

  pressedItem: {
    backgroundColor: "#F5F5F5",
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },

  menuLabel: {
    color: "#171717",
    fontSize: 16,
    fontWeight: "500",
  },
});

