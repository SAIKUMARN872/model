
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";

type GeneralScreenProps = {
  onBack: () => void;
};

export default function GeneralScreen({
  onBack,
}: GeneralScreenProps) {
  const [nickname, setNickname] = useState("");
  const [language, setLanguage] = useState("English");
  const [visualAnswers, setVisualAnswers] = useState("Default");
  const [fastAnswers, setFastAnswers] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [librarySearch, setLibrarySearch] = useState(true);

  const [activeDropdown, setActiveDropdown] = useState<
    "language" | "visual" | null
  >(null);

  const [referencePhotos, setReferencePhotos] = useState(false);

  const showReferencePhotos = () => {
    setReferencePhotos(true);
    Alert.alert(
      "Reference photos",
      "Photo selection will be connected in a future integration step.",
    );
  };

  const renderDropdown = (
    title: "language" | "visual",
    value: string,
    options: string[],
    onSelect: (item: string) => void,
  ) => (
    <Modal
      visible={activeDropdown === title}
      transparent
      animationType="fade"
      onRequestClose={() => setActiveDropdown(null)}
    >
      <Pressable
        style={styles.dropdownBackdrop}
        onPress={() => setActiveDropdown(null)}
      >
        <View style={styles.dropdown}>
          {options.map((option) => (
            <Pressable
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                onSelect(option);
                setActiveDropdown(null);
              }}
            >
              <Text style={styles.dropdownText}>{option}</Text>

              {value === option && (
                <Text style={styles.dropdownCheck}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={23} color="#111111" />
        </Pressable>

        <Text style={styles.headerTitle}>General</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Nickname</Text>

        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="Choose nickname"
          placeholderTextColor="#858585"
          style={styles.nicknameInput}
          maxLength={40}
          returnKeyType="done"
        />

        <Pressable
          style={[styles.card, styles.languageCard]}
          onPress={() => setActiveDropdown("language")}
        >
          <Text style={styles.rowTitle}>App language</Text>

          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{language}</Text>
            <ChevronDown size={17} color="#888888" />
          </View>
        </Pressable>

        <View style={styles.referenceSection}>
          <Pressable
            style={[styles.card, styles.standardCard]}
            onPress={showReferencePhotos}
          >
            <Text style={styles.rowTitle}>Reference photos</Text>

            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>Add</Text>
              <ChevronRight size={17} color="#888888" />
            </View>
          </Pressable>

          <Text style={styles.description}>
            These photos help ModelNow create images that look more
            like you.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Intelligence</Text>

        <Pressable
          style={[styles.card, styles.visualCard]}
          onPress={() => setActiveDropdown("visual")}
        >
          <Text style={styles.rowTitle}>Visual answers</Text>

          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{visualAnswers}</Text>
            <ChevronDown size={17} color="#888888" />
          </View>
        </Pressable>

        <View style={[styles.card, styles.fastCard]}>
          <Text style={styles.rowTitle}>Fast answers</Text>

          <Switch
            value={fastAnswers}
            onValueChange={setFastAnswers}
            trackColor={{
              false: "#D1D1D1",
              true: "#111111",
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D1D1D1"
            style={styles.switch}
          />
        </View>

        <Text style={styles.description}>
          ModelNow can use general knowledge to give fast, in-depth
          answers. These aren't personalized and don't use memory.
        </Text>

        <View style={[styles.card, styles.searchCard]}>
          <View style={styles.toggleRow}>
            <Text style={styles.rowTitle}>Web search</Text>

            <Switch
              value={webSearch}
              onValueChange={setWebSearch}
              trackColor={{
                false: "#D1D1D1",
                true: "#111111",
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D1D1"
              style={styles.switch}
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.toggleRow}>
            <Text style={styles.rowTitle}>Library search</Text>

            <Switch
              value={librarySearch}
              onValueChange={setLibrarySearch}
              trackColor={{
                false: "#D1D1D1",
                true: "#111111",
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D1D1"
              style={styles.switch}
            />
          </View>
        </View>
      </ScrollView>

      {renderDropdown(
        "language",
        language,
        ["English", "Telugu", "Hindi", "Spanish", "French"],
        setLanguage,
      )}

      {renderDropdown(
        "visual",
        visualAnswers,
        ["Default", "On", "Off"],
        setVisualAnswers,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },

  headerSpacer: {
    width: 42,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#858585",
    marginLeft: 14,
    marginBottom: 7,
  },

  nicknameInput: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 27,
    paddingHorizontal: 17,
    fontSize: 15,
    color: "#111111",
    marginBottom: 22,
  },

  card: {
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 22,
    paddingHorizontal: 17,
    backgroundColor: "#FFFFFF",
  },

  languageCard: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  standardCard: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowTitle: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "400",
    flexShrink: 1,
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  rowValue: {
    fontSize: 14,
    color: "#888888",
  },

  referenceSection: {
    marginBottom: 22,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: "#858585",
    marginHorizontal: 14,
    marginTop: 9,
  },

  visualCard: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  fastCard: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switch: {
    transform: [{ scale: 0.85 }],
  },

  searchCard: {
    marginTop: 22,
    paddingHorizontal: 0,
    borderRadius: 22,
    overflow: "hidden",
  },

  toggleRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 17,
  },

  rowDivider: {
    height: 1,
    backgroundColor: "#E3E3E3",
  },

  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  dropdown: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 5,
    elevation: 12,
  },

  dropdownOption: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  dropdownText: {
    fontSize: 15,
    color: "#111111",
  },

  dropdownCheck: {
    fontSize: 17,
    color: "#111111",
  },
});
