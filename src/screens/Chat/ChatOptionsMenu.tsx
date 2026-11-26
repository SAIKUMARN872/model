import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Pin,
  Pencil,
  FolderPlus,
  Archive,
  Trash2,
  Share2,
  Search,
  HousePlus,
  Paperclip,
  X,
  type LucideIcon,
} from "lucide-react-native";

export type ChatMenuAction =
  | "pin"
  | "rename"
  | "project"
  | "archive"
  | "delete"
  | "share"
  | "find"
  | "home"
  | "upload";

type ChatOptionsMenuProps = {
  visible: boolean;
  isPinned?: boolean;
  onClose: () => void;
  onAction: (action: ChatMenuAction) => void;
};

type MenuItem = {
  label: string;
  action: ChatMenuAction;
  icon: LucideIcon;
  danger?: boolean;
};

export default function ChatOptionsMenu({
  visible,
  isPinned = false,
  onClose,
  onAction,
}: ChatOptionsMenuProps) {
  const menuItems: MenuItem[] = [
    {
      label: isPinned ? "Unpin chat" : "Pin chat",
      action: "pin",
      icon: Pin,
    },
    {
      label: "Rename",
      action: "rename",
      icon: Pencil,
    },
    {
      label: "Add to project",
      action: "project",
      icon: FolderPlus,
    },
    {
      label: "Share",
      action: "share",
      icon: Share2,
    },
    {
      label: "Find in chat",
      action: "find",
      icon: Search,
    },
    {
      label: "Add to Home",
      action: "home",
      icon: HousePlus,
    },
    {
      label: "Upload files",
      action: "upload",
      icon: Paperclip,
    },
    {
      label: "Archive",
      action: "archive",
      icon: Archive,
    },
    {
      label: "Delete",
      action: "delete",
      icon: Trash2,
      danger: true,
    },
  ];

  const handleAction = (action: ChatMenuAction) => {
    onClose();
    onAction(action);
  };

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
        <Pressable
          style={styles.menu}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Chat options</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close chat options"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <X size={20} color="#555555" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.list}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Pressable
                  key={item.action}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => handleAction(item.action)}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.icon}>
                    <Icon
                      size={19}
                      color={
                        item.danger ? "#DC2626" : "#333333"
                      }
                      strokeWidth={1.8}
                    />
                  </View>

                  <Text
                    style={[
                      styles.label,
                      item.danger && styles.dangerLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 95,
    paddingRight: 14,
  },

  menu: {
    width: 255,
    maxHeight: "78%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    overflow: "hidden",
  },

  header: {
    minHeight: 45,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
    marginBottom: 5,
  },

  list: {
    flexGrow: 0,
  },

  item: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 9,
  },

  icon: {
    width: 34,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
  },

  dangerLabel: {
    color: "#DC2626",
  },

  pressed: {
    backgroundColor: "#F3F4F6",
  },
});