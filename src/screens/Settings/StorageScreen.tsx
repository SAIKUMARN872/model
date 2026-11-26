import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { ArrowLeft, ChevronRight } from "lucide-react-native";

type StorageScreenProps = {
  onBack: () => void;
};

export default function StorageScreen({
  onBack,
}: StorageScreenProps) {
  const openFiles = () => {
    Alert.alert("Files", "Storage used by files: 378 MB");
  };

  const openImages = () => {
    Alert.alert("Images", "Storage used by images: 134 MB");
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backArea}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <ArrowLeft
            size={22}
            color="#111111"
            strokeWidth={2}
          />
        </Pressable>

        <Text style={styles.headerTitle}>Storage</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Storage usage */}
        <View style={styles.usageSection}>
          <Text style={styles.usageText}>
            512 MB of 512 MB used
          </Text>

          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 512,
              now: 512,
            }}
          >
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Storage categories */}
        <View style={styles.storageCard}>
          <Pressable
            onPress={openFiles}
            style={styles.storageRow}
            accessibilityRole="button"
            accessibilityLabel="Files, 378 MB"
          >
            <Text style={styles.rowTitle}>Files</Text>

            <View style={styles.rowRight}>
              <Text style={styles.rowSize}>378 MB</Text>
              <ChevronRight
                size={19}
                color="#858585"
                strokeWidth={2}
              />
            </View>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={openImages}
            style={styles.storageRow}
            accessibilityRole="button"
            accessibilityLabel="Images, 134 MB"
          >
            <Text style={styles.rowTitle}>Images</Text>

            <View style={styles.rowRight}>
              <Text style={styles.rowSize}>134 MB</Text>
              <ChevronRight
                size={19}
                color="#858585"
                strokeWidth={2}
              />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  backArea: {
    position: "absolute",
    left: 16,
    top: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },

  headerTitle: {
    position: "absolute",
    top: 76,
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  usageSection: {
    marginHorizontal: 8,
    marginBottom: 28,
  },

  usageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 12,
  },

  progressTrack: {
    height: 12,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#E8E8E8",
    overflow: "hidden",
  },

  progressFill: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#080808",
  },

  storageCard: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  storageRow: {
    minHeight: 62,
    paddingLeft: 20,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#171717",
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  rowSize: {
    fontSize: 14,
    fontWeight: "400",
    color: "#929292",
  },

  divider: {
    height: 1,
    backgroundColor: "#DEDEDE",
  },
});