import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  X,
  LockKeyhole,
  FolderLock,
  ShieldCheck,
  SlidersHorizontal,
  BookOpen,
  ChevronRight,
  Database,
  Eye,
  Shield,
} from "lucide-react-native";

type PrivacyCenterScreenProps = {
  onBack: () => void;
};

const privacyOptions = [
  {
    title: "Personalized chats & ads",
    message:
      "Review the personalization options available in your privacy settings.",
  },
  {
    title: "Chat privacy",
    message:
      "Manage your chat privacy preferences and available controls.",
  },
  {
    title: "Data use & access",
    message:
      "Learn about your data and the ways you can manage it.",
  },
];

const privacyPrinciples = [
  {
    title: "We don't sell your data",
    description:
      "Your conversations are not sold to advertisers.",
    icon: FolderLock,
  },
  {
    title: "We secure your information",
    description:
      "Security measures help protect your information.",
    icon: ShieldCheck,
  },
  {
    title: "You control your data",
    description:
      "Manage your data and available privacy preferences.",
    icon: SlidersHorizontal,
  },
  {
    title: "Your privacy matters",
    description:
      "Explore the privacy choices available to you.",
    icon: LockKeyhole,
  },
];

const learningCards = [
  {
    title: "How AI learns while protecting privacy",
    category: "Privacy",
    duration: "4 min read",
    color: "#39A9EE",
    icon: Database,
  },
  {
    title: "Introducing advanced AI security",
    category: "Security",
    duration: "5 min read",
    color: "#D99030",
    icon: Shield,
  },
  {
    title: "Understanding your data controls",
    category: "Privacy",
    duration: "3 min read",
    color: "#5B91E8",
    icon: Eye,
  },
  {
    title: "Privacy and responsible AI",
    category: "Learn",
    duration: "4 min read",
    color: "#56B9AE",
    icon: BookOpen,
  },
];

const resources = [
  "Privacy policy",
  "Submit a privacy request",
  "Help Center",
  "How model improvement works",
];

export default function PrivacyCenterScreen({
  onBack,
}: PrivacyCenterScreenProps) {
  const showInfo = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close privacy center"
          onPress={onBack}
          style={styles.closeButton}
        >
          <X size={20} color="#222222" strokeWidth={2} />
        </Pressable>

        {/* Header */}
        <View style={styles.heroIcon}>
          <LockKeyhole
            size={27}
            color="#0877D5"
            strokeWidth={2}
          />
        </View>

        <Text style={styles.mainTitle}>Privacy center</Text>

        <Text style={styles.subtitle}>
          Clear answers about privacy. Simple ways to stay in control.
        </Text>

        {/* Privacy options */}
        <Text style={styles.sectionLabel}>
          Explore your options
        </Text>

        <View style={styles.optionsCard}>
          {privacyOptions.map((option, index) => (
            <View key={option.title}>
              {index > 0 && <View style={styles.divider} />}

              <Pressable
                accessibilityRole="button"
                style={styles.optionRow}
                onPress={() =>
                  showInfo(option.title, option.message)
                }
              >
                <Text style={styles.optionText}>
                  {option.title}
                </Text>

                <ChevronRight
                  size={17}
                  color="#888888"
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Privacy principles */}
        <Text style={styles.approachTitle}>
          Our approach to privacy
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCards}
          decelerationRate="fast"
        >
          {privacyPrinciples.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                style={styles.principleCard}
                onPress={() =>
                  showInfo(item.title, item.description)
                }
              >
                <Icon
                  size={23}
                  color="#285BC9"
                  strokeWidth={1.8}
                />

                <Text style={styles.principleTitle}>
                  {item.title}
                </Text>

                <Text style={styles.principleDescription}>
                  {item.description}
                </Text>

                <Text style={styles.learnMore}>
                  Learn more
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Learning resources */}
        <View style={styles.sectionDivider} />

        <Text style={styles.learnTitle}>Learn and act</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCards}
          decelerationRate="fast"
        >
          {learningCards.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                style={styles.learningCard}
                onPress={() =>
                  showInfo(
                    item.title,
                    `${item.category} · ${item.duration}\n\nLearn about privacy, data protection, and responsible AI.`,
                  )
                }
              >
                <View
                  style={[
                    styles.learningArtwork,
                    { backgroundColor: item.color },
                  ]}
                >
                  <View style={styles.artworkGrid}>
                    {Array.from({ length: 9 }).map((_, index) => (
                      <View
                        key={index}
                        style={styles.artworkCell}
                      />
                    ))}
                  </View>

                  <View style={styles.artworkIcon}>
                    <Icon
                      size={25}
                      color="#FFFFFF"
                      strokeWidth={1.7}
                    />
                  </View>
                </View>

                <Text style={styles.learningCardTitle}>
                  {item.title}
                </Text>

                <View style={styles.learningMeta}>
                  <Text style={styles.categoryText}>
                    {item.category}
                  </Text>

                  <Text style={styles.durationText}>
                    {item.duration}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Helpful resources */}
        <View style={styles.sectionDivider} />

        <Text style={styles.sectionLabel}>
          Helpful resources
        </Text>

        <View style={styles.optionsCard}>
          {resources.map((resource, index) => (
            <View key={resource}>
              {index > 0 && <View style={styles.divider} />}

              <Pressable
                accessibilityRole="button"
                style={styles.optionRow}
                onPress={() =>
                  showInfo(
                    resource,
                    "This resource can be connected to the relevant ModelNow privacy documentation or support page.",
                  )
                }
              >
                <Text style={styles.optionText}>
                  {resource}
                </Text>

                <ChevronRight
                  size={17}
                  color="#888888"
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingTop: 12,
    paddingBottom: 24,
  },

  closeButton: {
    width: 36,
    height: 36,
    marginLeft: 16,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  heroIcon: {
    width: 54,
    height: 54,
    marginLeft: 17,
    marginBottom: 12,
    borderRadius: 27,
    backgroundColor: "#EAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  mainTitle: {
    marginHorizontal: 17,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "600",
    color: "#111111",
  },

  subtitle: {
    marginHorizontal: 17,
    marginTop: 6,
    marginBottom: 22,
    fontSize: 13,
    lineHeight: 19,
    color: "#686868",
  },

  sectionLabel: {
    marginHorizontal: 17,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#777777",
  },

  optionsCard: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  optionRow: {
    minHeight: 48,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionText: {
    flex: 1,
    marginRight: 8,
    fontSize: 13,
    fontWeight: "400",
    color: "#171717",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E3E3E3",
    marginLeft: 14,
  },

  approachTitle: {
    marginHorizontal: 17,
    marginTop: 24,
    marginBottom: 13,
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
  },

  horizontalCards: {
    paddingHorizontal: 16,
    paddingRight: 16,
    gap: 10,
  },

  principleCard: {
    width: 205,
    minHeight: 165,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },

  principleTitle: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    color: "#171717",
  },

  principleDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: "#777777",
  },

  learnMore: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "500",
    color: "#285BC9",
  },

  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 16,
    marginTop: 26,
    marginBottom: 18,
  },

  learnTitle: {
    marginHorizontal: 17,
    marginBottom: 13,
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
  },

  learningCard: {
    width: 205,
  },

  learningArtwork: {
    height: 135,
    borderRadius: 15,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  artworkGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  artworkCell: {
    width: "33.333%",
    height: "33.333%",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  artworkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  learningCardTitle: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: "#171717",
  },

  learningMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 4,
  },

  categoryText: {
    fontSize: 11,
    color: "#555555",
  },

  durationText: {
    fontSize: 11,
    color: "#555555",
  },
});