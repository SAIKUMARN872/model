
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import {
  ArrowLeft,
  File,
  FileCode,
  FileText,
  Grid2X2,
  Heart,
  Image as ImageIcon,
  List,
  MoreVertical,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react-native";

const STORAGE_KEY = "modelnow-library-items-v2";

const COLORS = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceLight: "#F5F5F5",
  border: "#E5E5E5",
  text: "#111111",
  muted: "#666666",
  accent: "#222222",
  accentLight: "#222222",
  danger: "#D32F2F",
  white: "#FFFFFF",
};

type LibraryCategory =
  | "Suggested"
  | "Favorites"
  | "Folders"
  | "Images"
  | "All";

type LibraryItemType = "code" | "text" | "image";

type LibraryItem = {
  id: string;
  name: string;
  type: LibraryItemType;
  category: LibraryCategory;
  uri: string;
  mimeType?: string | null;
  size?: number;
  createdAt: number;
  favorite?: boolean;
};

type LibraryPageProps = {
  onBack?: () => void;
};

const TABS: LibraryCategory[] = [
  "Suggested",
  "Favorites",
  "Folders",
  "Images",
  "All",
];

const getFileType = (
  name: string,
  mimeType?: string | null
): LibraryItemType => {
  const lowerName = name.toLowerCase();

  if (
    mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(lowerName)
  ) {
    return "image";
  }

  if (
    /\.(js|jsx|ts|tsx|html|css|json|py|java|cpp|c|sql|xml|sh)$/i.test(
      lowerName
    )
  ) {
    return "code";
  }

  return "text";
};

const getFileExtension = (name: string) => {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
};

const formatFileSize = (bytes?: number) => {
  if (bytes === undefined || bytes === null || bytes < 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const ensureLibraryDirectory = async (): Promise<string> => {
  const documentDirectory = FileSystem.documentDirectory;

  if (!documentDirectory) {
    throw new Error("App document storage is unavailable.");
  }

  const directory = `${documentDirectory}library/`;
  const directoryInfo = await FileSystem.getInfoAsync(directory);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, {
      intermediates: true,
    });
  }

  return directory;
};

const getPermanentFileUri = async (
  sourceUri: string,
  originalName: string
): Promise<string> => {
  const directory = await ensureLibraryDirectory();
  const safeName = originalName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
  const extension = getFileExtension(safeName);
  const baseName = extension
    ? safeName.slice(0, -(extension.length + 1))
    : safeName;

  const uniqueName = `${Date.now()}-${makeId()}-${baseName || "file"}${
    extension ? `.${extension}` : ""
  }`;

  const destinationUri = `${directory}${uniqueName}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  return destinationUri;
};

const isAppLibraryFile = (uri: string) => {
  const documentDirectory = FileSystem.documentDirectory;

  return documentDirectory
    ? uri.startsWith(`${documentDirectory}library/`)
    : false;
};

const LibraryPage: React.FC<LibraryPageProps> = ({ onBack }) => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] =
    useState<LibraryCategory>("Suggested");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed: LibraryItem[] = JSON.parse(saved);
          setItems(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error("Failed to load Library items:", error);
        Alert.alert(
          "Unable to load Library",
          "Your saved Library items could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadItems();
  }, []);

  const saveItems = async (updatedItems: LibraryItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (activeTab === "Favorites") {
      result = result.filter((item) => item.favorite);
    } else if (activeTab === "Images") {
      result = result.filter((item) => item.type === "image");
    } else if (activeTab === "Suggested") {
      result = result
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6);
    } else if (activeTab === "Folders") {
      result = [];
    }

    const query = searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [items, activeTab, searchQuery]);

  const uploadFiles = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const newItems: LibraryItem[] = [];
      const copiedUris: string[] = [];

      try {
        for (const asset of result.assets) {
          const permanentUri = await getPermanentFileUri(
            asset.uri,
            asset.name
          );

          copiedUris.push(permanentUri);

          const fileInfo = await FileSystem.getInfoAsync(permanentUri);
          const size =
            fileInfo.exists && "size" in fileInfo
              ? fileInfo.size
              : asset.size;

          const type = getFileType(asset.name, asset.mimeType);

          newItems.push({
            id: makeId(),
            name: asset.name,
            type,
            category: type === "image" ? "Images" : "All",
            uri: permanentUri,
            mimeType: asset.mimeType,
            size,
            createdAt: Date.now(),
            favorite: false,
          });
        }

        await saveItems([...newItems, ...items]);
        setActiveTab("All");
        setSearchQuery("");

        Alert.alert(
          "Upload complete",
          `${newItems.length} ${
            newItems.length === 1 ? "file has" : "files have"
          } been saved to your Library.`
        );
      } catch (error) {
        await Promise.all(
          copiedUris.map(async (uri) => {
            try {
              await FileSystem.deleteAsync(uri, { idempotent: true });
            } catch {
              // Continue cleaning up remaining copied files.
            }
          })
        );

        throw error;
      }
    } catch (error) {
      console.error("Library upload failed:", error);
      Alert.alert(
        "Upload failed",
        "The selected files could not be saved. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFavorite = async (item: LibraryItem) => {
    try {
      const updatedItems = items.map((current) =>
        current.id === item.id
          ? { ...current, favorite: !current.favorite }
          : current
      );

      await saveItems(updatedItems);
    } catch (error) {
      console.error("Failed to update favorite:", error);
      Alert.alert("Error", "Could not update this favorite.");
    }
  };

  const performDelete = async (item: LibraryItem) => {
    try {
      await saveItems(items.filter((current) => current.id !== item.id));

      if (isAppLibraryFile(item.uri)) {
        try {
          await FileSystem.deleteAsync(item.uri, { idempotent: true });
        } catch (error) {
          console.error("Could not remove stored file:", error);
        }
      }

      setSelectedItems((current) =>
        current.filter((id) => id !== item.id)
      );
    } catch (error) {
      console.error("Failed to delete Library item:", error);
      Alert.alert("Error", "Could not delete this item.");
    }
  };

  const deleteItem = (item: LibraryItem) => {
    Alert.alert(
      "Delete item",
      `Are you sure you want to delete "${item.name}" from your Library?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void performDelete(item),
        },
      ]
    );
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  };

  const deleteSelectedItems = () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      "Delete selected items",
      `Delete ${selectedItems.length} selected items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                const toDelete = items.filter((item) =>
                  selectedItems.includes(item.id)
                );

                await saveItems(
                  items.filter((item) => !selectedItems.includes(item.id))
                );

                await Promise.all(
                  toDelete.map(async (item) => {
                    if (!isAppLibraryFile(item.uri)) return;

                    try {
                      await FileSystem.deleteAsync(item.uri, {
                        idempotent: true,
                      });
                    } catch (error) {
                      console.error("Failed to delete stored file:", error);
                    }
                  })
                );

                setSelectedItems([]);
                setSelectionMode(false);
              } catch (error) {
                console.error("Failed to delete selected items:", error);
                Alert.alert("Error", "Could not delete the selected items.");
              }
            })();
          },
        },
      ]
    );
  };

  const renderFileIcon = (item: LibraryItem, size = 25) => {
    const color = COLORS.text;

    if (item.type === "image") {
      return <ImageIcon size={size} color={color} />;
    }

    if (item.type === "code") {
      return <FileCode size={size} color={color} />;
    }

    return <FileText size={size} color={color} />;
  };

  const renderItem = ({ item }: { item: LibraryItem }) => {
    const selected = selectedItems.includes(item.id);

    return (
      <Pressable
        style={[
          isGridView ? styles.gridCard : styles.listCard,
          selected && styles.selectedCard,
        ]}
        onPress={() => {
          if (selectionMode) {
            toggleItemSelection(item.id);
          } else if (item.type === "image") {
            Alert.alert(item.name, "This image is saved in your Library.");
          } else {
            Alert.alert(
              item.name,
              `Saved file\n\n${formatFileSize(item.size)}`
            );
          }
        }}
        onLongPress={() => {
          setSelectionMode(true);
          toggleItemSelection(item.id);
        }}
      >
        {isGridView ? (
          <>
            <View style={styles.gridPreview}>
              {item.type === "image" ? (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.fileIconLarge}>
                  {renderFileIcon(item, 36)}
                </View>
              )}

              {selectionMode ? (
                <View
                  style={[
                    styles.selectionBadge,
                    selected && styles.selectionBadgeActive,
                  ]}
                >
                  <Text style={styles.selectionBadgeText}>
                    {selected ? "✓" : ""}
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={styles.cardMenuButton}
                  onPress={() => {
                    Alert.alert(item.name, "Choose an action", [
                      {
                        text: item.favorite
                          ? "Remove from favorites"
                          : "Add to favorites",
                        onPress: () => void toggleFavorite(item),
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteItem(item),
                      },
                      { text: "Cancel", style: "cancel" },
                    ]);
                  }}
                >
                  <MoreVertical size={18} color={COLORS.text} />
                </Pressable>
              )}
            </View>

            <View style={styles.cardDetails}>
              <Text style={styles.fileName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.fileMeta}>
                {formatFileSize(item.size)}
              </Text>

              <View style={styles.cardBottomRow}>
                <Text style={styles.fileDate}>
                  {formatDate(item.createdAt)}
                </Text>

                <Pressable
                  onPress={() => void toggleFavorite(item)}
                  hitSlop={8}
                  style={styles.favoriteButton}
                >
                  <Heart
                    size={17}
                    color={item.favorite ? COLORS.text : COLORS.muted}
                    fill={item.favorite ? COLORS.text : "transparent"}
                  />
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            {item.type === "image" ? (
              <Image
                source={{ uri: item.uri }}
                style={styles.listImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.listFileIcon}>
                {renderFileIcon(item)}
              </View>
            )}

            <View style={styles.listDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={styles.fileMeta}>
                {formatFileSize(item.size)} · {formatDate(item.createdAt)}
              </Text>
            </View>

            <Pressable
              onPress={() => void toggleFavorite(item)}
              hitSlop={8}
              style={styles.favoriteButton}
            >
              <Heart
                size={19}
                color={item.favorite ? COLORS.text : COLORS.muted}
                fill={item.favorite ? COLORS.text : "transparent"}
              />
            </Pressable>

            <Pressable
              onPress={() => deleteItem(item)}
              hitSlop={8}
              style={styles.deleteButton}
            >
              <Trash2 size={18} color={COLORS.muted} />
            </Pressable>
          </>
        )}
      </Pressable>
    );
  };

  const renderEmptyState = () => {
    if (activeTab === "Folders") {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <File size={30} color={COLORS.text} />
          </View>
          <Text style={styles.emptyTitle}>Folders</Text>
          <Text style={styles.emptyDescription}>
            Organize your saved files into folders.
          </Text>
          <Text style={styles.emptyHint}>
            Folder creation will be available in a future update.
          </Text>
        </View>
      );
    }

    if (activeTab === "Favorites") {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Heart size={30} color={COLORS.text} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyDescription}>
            Tap the heart on an item to save it here.
          </Text>
        </View>
      );
    }

    if (activeTab === "Images") {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <ImageIcon size={30} color={COLORS.text} />
          </View>
          <Text style={styles.emptyTitle}>No images yet</Text>
          <Text style={styles.emptyDescription}>
            Upload images to keep them in your Library.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <File size={30} color={COLORS.text} />
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? "No matching items" : "Your Library is empty"}
        </Text>
        <Text style={styles.emptyDescription}>
          {searchQuery
            ? "Try a different search term."
            : "Upload documents, images, and code files to get started."}
        </Text>

        {!searchQuery ? (
          <Pressable
            style={styles.emptyUploadButton}
            onPress={() => void uploadFiles()}
          >
            <Upload size={17} color={COLORS.white} />
            <Text style={styles.emptyUploadText}>Upload files</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onBack}
            hitSlop={8}
          >
            <ArrowLeft size={22} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Library</Text>
            <Text style={styles.headerSubtitle}>
              Your saved files and resources
            </Text>
          </View>

          <Pressable
            style={styles.uploadButton}
            onPress={() => void uploadFiles()}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Upload size={18} color={COLORS.white} />
            )}
            <Text style={styles.uploadButtonText}>
              {isUploading ? "Saving" : "Upload"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Search size={19} color={COLORS.muted} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search your Library..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />

          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <X size={18} color={COLORS.muted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => {
                    setActiveTab(tab);
                    setSelectionMode(false);
                    setSelectedItems([]);
                  }}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.activeTabText]}
                  >
                    {tab}
                  </Text>

                  {tab === "All" ? (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{items.length}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.contentHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {activeTab === "Suggested" ? "Recently added" : activeTab}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </Text>
          </View>

          <View style={styles.viewControls}>
            {selectionMode ? (
              <>
                <Pressable
                  style={styles.viewButton}
                  onPress={deleteSelectedItems}
                  disabled={selectedItems.length === 0}
                >
                  <Trash2
                    size={19}
                    color={
                      selectedItems.length ? COLORS.danger : COLORS.muted
                    }
                  />
                </Pressable>

                <Pressable
                  style={styles.viewButton}
                  onPress={() => {
                    setSelectionMode(false);
                    setSelectedItems([]);
                  }}
                >
                  <X size={19} color={COLORS.text} />
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.viewButton, isGridView && styles.activeViewButton]}
                  onPress={() => setIsGridView(true)}
                >
                  <Grid2X2
                    size={19}
                    color={isGridView ? COLORS.text : COLORS.muted}
                  />
                </Pressable>

                <Pressable
                  style={[styles.viewButton, !isGridView && styles.activeViewButton]}
                  onPress={() => setIsGridView(false)}
                >
                  <List
                    size={20}
                    color={!isGridView ? COLORS.text : COLORS.muted}
                  />
                </Pressable>
              </>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.text} />
            <Text style={styles.loadingText}>Loading your Library...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            key={isGridView ? "grid" : "list"}
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={isGridView ? 2 : 1}
            contentContainerStyle={styles.itemsContainer}
            columnWrapperStyle={isGridView ? styles.gridRow : undefined}
            showsVerticalScrollIndicator={false}
            extraData={{ items, selectedItems, selectionMode, activeTab }}
          />
        )}

        {selectionMode && selectedItems.length > 0 ? (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionBarText}>
              {selectedItems.length} selected
            </Text>

            <Pressable
              onPress={deleteSelectedItems}
              style={styles.selectionDeleteButton}
            >
              <Trash2 size={17} color={COLORS.white} />
              <Text style={styles.selectionDeleteText}>Delete selected</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default LibraryPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },

  uploadButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  uploadButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  searchContainer: {
    marginHorizontal: 16,
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },

  tabsWrapper: {
    marginTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    gap: 6,
  },

  activeTab: {
    borderBottomColor: COLORS.text,
  },

  tabText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
  },

  activeTabText: {
    color: COLORS.text,
    fontWeight: "700",
  },

  countBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  countText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "600",
  },

  contentHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  viewControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },

  activeViewButton: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },

  gridRow: {
    justifyContent: "space-between",
    gap: 12,
  },

  gridCard: {
    flex: 1,
    maxWidth: "49%",
    marginBottom: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },

  selectedCard: {
    borderColor: COLORS.text,
    borderWidth: 2,
  },

  gridPreview: {
    height: 125,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  fileIconLarge: {
    width: 65,
    height: 65,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  cardMenuButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  selectionBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 25,
    height: 25,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  selectionBadgeActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },

  selectionBadgeText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  cardDetails: {
    paddingHorizontal: 11,
    paddingTop: 11,
    paddingBottom: 10,
  },

  fileName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  fileMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  cardBottomRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fileDate: {
    color: COLORS.muted,
    fontSize: 10,
  },

  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },

  listCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 75,
    padding: 11,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    gap: 11,
  },

  listImage: {
    width: 49,
    height: 49,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },

  listFileIcon: {
    width: 49,
    height: 49,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  listDetails: {
    flex: 1,
    justifyContent: "center",
  },

  deleteButton: {
    padding: 5,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingBottom: 65,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 9,
  },

  emptyHint: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 8,
  },

  emptyUploadButton: {
    marginTop: 20,
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.text,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emptyUploadText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  selectionBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectionBarText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  selectionDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
  },

  selectionDeleteText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
});
