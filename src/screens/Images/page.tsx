
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  StatusBar,
} from "react-native";
import {
  ArrowLeft,
  Flame,
  LayoutTemplate,
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";

type ImagesPageProps = {
  onBack?: () => void;
};

type ImageItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
};

const TRENDING_IMAGES: ImageItem[] = [
  {
    id: "trend-1",
    title: "Dreamy Landscape",
    category: "Digital art",
    imageUrl:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "trend-2",
    title: "Golden Sunset",
    category: "Nature",
    imageUrl:
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "trend-3",
    title: "Mountain Escape",
    category: "Wallpaper",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "trend-4",
    title: "Ocean Mood",
    category: "Photography",
    imageUrl:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80",
  },
];

const TEMPLATES: ImageItem[] = [
  {
    id: "template-1",
    title: "Social Media Post",
    category: "Social media",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "template-2",
    title: "Creative Poster",
    category: "Poster",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "template-3",
    title: "Minimal Wallpaper",
    category: "Wallpaper",
    imageUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "template-4",
    title: "Brand Inspiration",
    category: "Branding",
    imageUrl:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&auto=format&fit=crop&q=80",
  },
];

export default function ImagesPage({ onBack }: ImagesPageProps) {
  const [activeSection, setActiveSection] = useState<
    "home" | "trending" | "templates"
  >("home");

  const [selectedImage, setSelectedImage] =
    useState<ImageItem | null>(null);

  const items =
    activeSection === "trending" ? TRENDING_IMAGES : TEMPLATES;

  const title =
    activeSection === "trending"
      ? "Trending"
      : activeSection === "templates"
        ? "Templates"
        : "Images";

  const goBack = () => {
    if (selectedImage) {
      setSelectedImage(null);
    } else if (activeSection !== "home") {
      setActiveSection("home");
    } else {
      onBack?.();
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#171717" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {selectedImage ? selectedImage.title : title}
        </Text>

        <View style={styles.headerRight}>
          <ImageIcon size={21} color="#525252" />
        </View>
      </View>

      {selectedImage ? (
        <ScrollView contentContainerStyle={styles.detailContent}>
          <Image
            source={{ uri: selectedImage.imageUrl }}
            style={styles.previewImage}
            resizeMode="cover"
          />

          <Text style={styles.detailTitle}>
            {selectedImage.title}
          </Text>

          <Text style={styles.detailCategory}>
            {selectedImage.category}
          </Text>

          <Pressable
            style={styles.generateButton}
            onPress={() => {
              // Connect this action to the image-generation API later.
              setSelectedImage(null);
              setActiveSection("home");
            }}
          >
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>
              Use as inspiration
            </Text>
          </Pressable>

          <Text style={styles.note}>
            Example image preview. Image generation will be connected
            when the backend API is available.
          </Text>
        </ScrollView>
      ) : activeSection === "home" ? (
        <ScrollView
          contentContainerStyle={styles.homeContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Discover images</Text>
          <Text style={styles.subtitle}>
            Explore ideas and find a style for your next creation.
          </Text>

          <Pressable
            style={styles.categoryCard}
            onPress={() => setActiveSection("trending")}
          >
            <View style={styles.categoryIcon}>
              <Flame size={24} color="#EA580C" />
            </View>

            <View style={styles.categoryText}>
              <Text style={styles.categoryTitle}>Trending</Text>
              <Text style={styles.categorySubtitle}>
                Explore popular image ideas
              </Text>
            </View>

            <ChevronRight size={21} color="#737373" />
          </Pressable>

          <Pressable
            style={styles.categoryCard}
            onPress={() => setActiveSection("templates")}
          >
            <View style={styles.categoryIcon}>
              <LayoutTemplate size={24} color="#7C3AED" />
            </View>

            <View style={styles.categoryText}>
              <Text style={styles.categoryTitle}>Templates</Text>
              <Text style={styles.categorySubtitle}>
                Browse ready-made creative styles
              </Text>
            </View>

            <ChevronRight size={21} color="#737373" />
          </Pressable>

          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Trending preview</Text>
            <Pressable onPress={() => setActiveSection("trending")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.imageGrid}>
            {TRENDING_IMAGES.slice(0, 2).map((item) => (
              <Pressable
                key={item.id}
                style={styles.imageCard}
                onPress={() => setSelectedImage(item)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <Text style={styles.imageTitle}>{item.title}</Text>
                <Text style={styles.imageCategory}>
                  {item.category}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Templates preview</Text>
            <Pressable onPress={() => setActiveSection("templates")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.imageGrid}>
            {TEMPLATES.slice(0, 2).map((item) => (
              <Pressable
                key={item.id}
                style={styles.imageCard}
                onPress={() => setSelectedImage(item)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <Text style={styles.imageTitle}>{item.title}</Text>
                <Text style={styles.imageCategory}>
                  {item.category}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.note}>
            These are sample images. Live trending content and
            templates will require a backend connection.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>{title}</Text>
          <Text style={styles.subtitle}>
            {activeSection === "trending"
              ? "Explore sample images while live trends are being connected."
              : "Choose a sample style to preview it."}
          </Text>

          <View style={styles.imageGrid}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.imageCard}
                onPress={() => setSelectedImage(item)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />

                <Text style={styles.imageTitle}>{item.title}</Text>
                <Text style={styles.imageCategory}>
                  {item.category}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.note}>
            {activeSection === "trending"
              ? "Trending order is illustrative, not live popularity data."
              : "These are example templates, not yet connected to a template service."}
          </Text>
        </ScrollView>
      )}
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
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#171717",
    textAlign: "center",
  },
  headerRight: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  homeContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listContent: {
    padding: 18,
    paddingBottom: 40,
  },
  detailContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 25,
    fontWeight: "700",
    color: "#171717",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#737373",
    marginTop: 7,
    marginBottom: 22,
  },
  categoryCard: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#171717",
  },
  categorySubtitle: {
    fontSize: 12,
    color: "#737373",
    marginTop: 5,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageCard: {
    width: "48%",
    marginBottom: 18,
  },
  thumbnail: {
    width: "100%",
    height: 155,
    borderRadius: 13,
    backgroundColor: "#F3F4F6",
  },
  imageTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#171717",
    marginTop: 9,
  },
  imageCategory: {
    fontSize: 12,
    color: "#737373",
    marginTop: 4,
  },
  previewImage: {
    width: "100%",
    height: 380,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#171717",
    marginTop: 18,
  },
  detailCategory: {
    fontSize: 14,
    color: "#737373",
    marginTop: 6,
  },
  generateButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#111111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 24,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: "#737373",
    marginTop: 20,
  },
});
