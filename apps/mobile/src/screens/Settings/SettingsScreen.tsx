
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import {
  ArrowLeft,
  UserRound,
  Brain,
  Puzzle,
  BriefcaseBusiness,
  Sparkles,
  ChartNoAxesColumn,
  LifeBuoy,
  UsersRound,
  Mail,
  Sun,
  ChevronDown,
  Paintbrush,
  Settings as SettingsIcon,
  Bell,
  AudioLines,
  ShieldCheck,
  ShieldUser,
  Monitor,
  HardDrive,
  Database,
  Megaphone,
  Bug,
  Info,
  LogOut,
} from "lucide-react-native";

type Props = {
  onBack: () => void;
  onOpenSetting: (name: string) => void;
};

type SettingItem = {
  label: string;
  icon: React.ComponentType<any>;
  value?: string;
  blue?: boolean;
  expandable?: boolean;
};

type SettingGroup = {
  title: string;
  items: SettingItem[];
};

const groups: SettingGroup[] = [
  {
    title: "My ModelNow",
    items: [
      { label: "Personalization", icon: UserRound },
      { label: "Memory", icon: Brain },
      { label: "Plugins", icon: Puzzle },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Workspace",
        icon: BriefcaseBusiness,
        value: "Personal",
      },
      {
        label: "Upgrade plan",
        icon: Sparkles,
        blue: true,
      },
      {
        label: "Usage and limits",
        icon: ChartNoAxesColumn,
      },
      { label: "Trusted contact", icon: LifeBuoy },
      { label: "Parental controls", icon: UsersRound },
      {
        label: "Email",
        icon: Mail,
        value: "Pujitha Marikanti",
      },
    ],
  },
  {
    title: "Appearance",
    items: [
      {
        label: "Appearance",
        icon: Sun,
        expandable: true,
      },
      {
        label: "Accent color",
        icon: Paintbrush,
        value: "Blue",
        expandable: true,
      },
    ],
  },
  {
    title: "General",
    items: [
      { label: "General", icon: SettingsIcon },
      { label: "Notifications", icon: Bell },
      { label: "Voice", icon: AudioLines },
      { label: "Safety", icon: ShieldCheck },
      { label: "Security and login", icon: ShieldUser },
      { label: "Remote control", icon: Monitor },
      { label: "Storage", icon: HardDrive },
      { label: "Privacy center", icon: ShieldCheck },
      { label: "History and data", icon: Database },
      { label: "Ads controls", icon: Megaphone },
      { label: "Report a bug", icon: Bug },
      { label: "About", icon: Info },
    ],
  },
];

export default function SettingsPage({
  onBack,
  onOpenSetting,
}: Props) {
  const handleOpenSetting = (name: string) => {
    if (name === "Email") {
      return;
    }

    if (
      name.trim().toLowerCase() === "logout" ||
      name.trim().toLowerCase() === "log out"
    ) {
      onOpenSetting("Log out");
      return;
    }

    onOpenSetting(name);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={25} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PU</Text>
          </View>

          <Text style={styles.profileName}>
            ModelNow user
          </Text>
        </View>

        {groups.map((group) => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {group.title}
            </Text>

            <View style={styles.card}>
              {group.items.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    onPress={() =>
                      handleOpenSetting(item.label)
                    }
                    style={({ pressed }) => [
                      styles.row,
                      index < group.items.length - 1 &&
                        styles.rowBorder,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <Icon
                      size={23}
                      color={
                        item.blue ? "#315FEA" : "#171717"
                      }
                      strokeWidth={1.9}
                    />

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.rowLabel,
                        item.blue && styles.blueLabel,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item.value ? (
                      <Text
                        numberOfLines={1}
                        style={styles.rowValue}
                      >
                        {item.value}
                      </Text>
                    ) : null}

                    {item.expandable ? (
                      <ChevronDown
                        size={19}
                        color="#737373"
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={() => handleOpenSetting("Log out")}
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.rowPressed,
          ]}
        >
          <LogOut size={22} color="#B42318" />

          <Text style={styles.logoutText}>
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 19,
    fontWeight: "700",
    color: "#171717",
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  profile: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 27,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "500",
  },

  profileName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    marginBottom: 13,
    marginLeft: 4,
    fontSize: 16,
    color: "#858585",
  },

  card: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 27,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  row: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 17,
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D8D8D8",
  },

  rowPressed: {
    backgroundColor: "#F4F6F8",
  },

  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: "#171717",
  },

  rowValue: {
    maxWidth: "43%",
    fontSize: 13,
    color: "#737373",
  },

  blueLabel: {
    color: "#315FEA",
  },

  logout: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 18,
  },

  logoutText: {
    fontSize: 15,
    color: "#B42318",
  },
});

