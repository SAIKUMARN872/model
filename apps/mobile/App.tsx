import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ArrowUp,
  AudioLines,
  Mic,
  Plus,
  SquarePen,
  Search,
  Pin,
  Pencil,
  Archive,
  Trash2,
  FolderPlus,
  Copy,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  X,
  Check,
  MoreHorizontal,
  Menu,
  Images,
  CalendarCheck2,
  Library,
  AtSign,
  SlidersHorizontal,
  Radio,
} from "lucide-react-native";

import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Platform,
  Linking,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { COLORS } from "./src/theme/colors";
import PluginsPage from "./src/screens/Plugins/page";
import LibraryPage from "./src/screens/Library/page";
import RemotePage from "./src/screens/Remote/page";
import ImagesPage from "./src/screens/Images/page";
import CustomizePage from "./src/screens/Customize/page";
import ScheduledPage from "./src/screens/Scheduled/page";
import SettingsPage from "./src/screens/Settings/SettingsScreen";
import PersonalizationScreen from "./src/screens/Settings/PersonalizationScreen";
import MemoryScreen from "./src/screens/Settings/MemoryScreen";
import PluginsSettingsScreen from "./src/screens/Plugins/PluginsSettingsScreen";
import UsageLimitsScreen from "./src/screens/Settings/UsageLimitsScreen";
import UpgradePlanScreen from "./src/screens/UpgradePlanScreen";
import PaymentMethodsScreen, {
  type PaymentMethod,
} from "./src/screens/Plans/PaymentMethodsScreen";

import SubscriptionConfirmationScreen from "./src/screens/Plans/SubscriptionConfirmationScreen";
import CheckoutScreen, {
  type PaymentResult,
} from "./src/screens/Plans/CheckoutScreen";
import PaymentResultScreen from "./src/screens/Plans/PaymentResultScreen";
import { openSubscriptionCheckout } from "./src/services/razorpay";
import TrustedContactScreen from "./src/screens/Settings/TrustedContactScreen";
import ParentalControlsScreen from "./src/screens/Settings/ParentalControlsScreen";
import AppearancePopup, {
  type AppearanceMode,
} from "./src/screens/Settings/AppearancePopup";
import AccentColorScreen, {
  type AccentColor,
} from "./src/screens/Settings/AccentColorScreen";
import GeneralScreen from "./src/screens/Settings/GeneralScreen";
import NotificationsScreen from "./src/screens/Settings/NotificationsScreen";
import VoiceScreen from "./src/screens/Settings/VoiceScreen";
import SafetyScreen from "./src/screens/Settings/SafetyScreen";
import SecurityScreen from "./src/screens/Settings/SecurityScreen";
import RemoteScreen from "./src/screens/Settings/RemoteScreen";
import StorageScreen from "./src/screens/Settings/StorageScreen";
import PrivacyCenterScreen from "./src/screens/Settings/PrivacyCenterScreen";
import HistoryAndDataScreen from "./src/screens/Settings/HistoryAndDataScreen";
import AdsControlsScreen from "./src/screens/Settings/AdsControlsScreen";
import ReportBugScreen from "./src/screens/Settings/ReportBugScreen";
import AboutScreen from "./src/screens/Settings/AboutScreen";
import Logout from "./src/screens/Settings/Logout";
import ChatOptionsMenu, {
  type ChatMenuAction,
} from "./src/screens/Chat/ChatOptionsMenu";
import AttachmentMenu from "./components/AttachmentMenu";
import Login from "./src/screens/Login";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

type MessageRole = "user" | "assistant";
type Feedback = "up" | "down" | null;

type ChatMessage = {
  id: number;
  text: string;
  role: MessageRole;
  feedback?: Feedback;
};

type Chat = {
  id: number;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  archived: boolean;
  projectName?: string;
  updatedAt: number;
};

type ActionTarget =
  | { kind: "chat"; chatId: number }
  | { kind: "message"; chatId: number; messageId: number }
  | null;
type PlanId = "plus" | "pro";
type BillingCycle = "monthly" | "yearly";

type PlansStep =
  | "plans"
  | "payment"
  | "checkout"
  | "confirmation"
  | "result";

const MENU_ITEMS = [
  { label: "Plugins", Icon: AtSign },
  { label: "Library", Icon: Library },
  { label: "Scheduled", Icon: CalendarCheck2 },
  { label: "Customize", Icon: SlidersHorizontal },
  { label: "Remote", Icon: Radio },
  { label: "Images", Icon: Images },
];

const UPI_APP_SCHEMES: Partial<Record<PaymentMethod, string[]>> = {
  "Google Pay": ["gpay://upi/pay", "tez://upi/pay", "upi://pay"],
  PhonePe: ["phonepe://pay", "upi://pay"],
  Paytm: ["paytmmp://pay", "upi://pay"],
  "super.money": ["upi://pay"],
  WhatsApp: ["whatsapp://pay", "upi://pay"],
};

const SKY_BLUE = "#315FEA";
const GREEN = "#15803D";
const CHAT_STORAGE_KEY = "modelnow-mobile-chats-v1";
// Replace with a real Razorpay subscription instance ID when backend is connected.
const RAZORPAY_SUBSCRIPTION_ID: string | null = null;
// Replace with your verified Razorpay / Merchant UPI ID for direct UPI intent fallback.
const MERCHANT_UPI_ID = "pujithamarikanti@oksbi";
const createId = () => Date.now() + Math.floor(Math.random() * 1000);

async function openSelectedUpiApp(
  method: PaymentMethod,
  amount: number,
  planName: string
): Promise<boolean> {
  if (method === "Credit or debit card") {
    return true;
  }

  const txnRef = `MN${Date.now()}`;
  const query = [
    `pa=${encodeURIComponent(MERCHANT_UPI_ID)}`,
    `pn=${encodeURIComponent("ModelNow")}`,
    `tr=${txnRef}`,
    `tn=${encodeURIComponent(planName)}`,
    `am=${amount.toFixed(2)}`,
    `cu=INR`,
    `mode=02`,
  ].join("&");

  const schemes = UPI_APP_SCHEMES[method] || ["upi://pay"];

  for (const baseScheme of schemes) {
    try {
      await Linking.openURL(`${baseScheme}?${query}`);
      return true;
    } catch {
      // Try next fallback scheme
    }
  }

  Alert.alert(
    "No UPI app found",
    `Could not open ${method}. Please ensure a UPI app is installed on this device.`
  );
  return false;
}

function generateDemoResponse(prompt: string): string {
  const text = prompt.toLowerCase();

  if (/^(hi|hello|hey)\b/.test(text)) {
    return "Hello! I'm ModelNow's temporary chat assistant. How can I help you today?";
  }

  if (text.includes("html") || text.includes("css") || text.includes("javascript")) {
    return "I can help you work through this web development task. Start by identifying the required layout, the components involved, and the behavior you want. Once the backend is connected, this response will be generated by ModelNow's assistant service.";
  }

  if (text.includes("career") || text.includes("job") || text.includes("resume")) {
    return "Let's break this down into practical steps. Identify your target role, compare its requirements with your current skills, and choose one improvement to work on first. This is a temporary frontend response for testing.";
  }

  if (text.includes("modelnow")) {
    return "ModelNow can use this chat interface for questions, ideas, and work tasks. The current reply is generated locally for UI testing; backend model routing and real AI responses are not connected here yet.";
  }

  return `I received your message:\n\n"${prompt}"\n\nThis is a temporary ModelNow frontend response used to test the chat interface. Real AI responses will be connected through the backend later.`;
}

function MainChatScreen() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [searchMode, setSearchMode] = useState<"none" | "web" | "deep">("none");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [chatOptionsVisible, setChatOptionsVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("");
  const [plansStep, setPlansStep] = useState<PlansStep>("plans");

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("plus");
  const [selectedBilling, setSelectedBilling] =
    useState<BillingCycle>("monthly");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("Google Pay");
  const [paymentResult, setPaymentResult] =
    useState<PaymentResult>("failed");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);

  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const [accentColor, setAccentColor] = useState<AccentColor>("Blue");
  const [accentColorPopupVisible, setAccentColorPopupVisible] = useState(false);
  const [projectVisible, setProjectVisible] = useState(false);
  const [projectValue, setProjectValue] = useState("");

  const [selectTextVisible, setSelectTextVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [appearance, setAppearance] = useState<AppearanceMode>("System");
  const [appearancePopupVisible, setAppearancePopupVisible] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [renameChatId, setRenameChatId] = useState<number | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          if (scrollViewRef.current && scrollViewRef.current.scrollToEnd) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 80);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const messages = activeChat?.messages ?? [];
  const hasMessage = message.trim().length > 0;

  const matchesSearch = (chat: Chat) =>
    chat.title.toLowerCase().includes(searchQuery.trim().toLowerCase());

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setMessage(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    Alert.alert(
      "Microphone error",
      event.message || "Speech recognition could not start."
    );
  });

  const pinnedChats = useMemo(
    () =>
      chats
        .filter((chat) => !chat.archived && chat.pinned && matchesSearch(chat))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chats, searchQuery]
  );

  const recentChats = useMemo(
    () =>
      chats
        .filter((chat) => !chat.archived && matchesSearch(chat))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chats, searchQuery]
  );

  const archivedChats = useMemo(
    () =>
      chats
        .filter((chat) => chat.archived && matchesSearch(chat))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chats, searchQuery]
  );

  const targetChat =
    actionTarget?.kind === "chat"
      ? chats.find((chat) => chat.id === actionTarget.chatId) ?? null
      : null;

  const targetMessage =
    actionTarget?.kind === "message"
      ? chats
          .find((chat) => chat.id === actionTarget.chatId)
          ?.messages.find((item) => item.id === actionTarget.messageId) ?? null
      : null;

  const closeActions = () => setActionTarget(null);

  const closeDrawer = () => {
    Keyboard.dismiss();
    setDrawerVisible(false);
  };

  const goBackToSettings = () => {
    Keyboard.dismiss();
    setDrawerVisible(false);
    setSelectedMenu("Settings");
  };

  const goBackToMenu = () => {
    Keyboard.dismiss();
    setSelectedMenu("");
    setDrawerVisible(true);
  };

  const openMenuItem = (label: string) => {
    Keyboard.dismiss();
    setDrawerVisible(false);

    if (label === "Plans") {
      setPlansStep("plans");
      setPaymentLoading(false);
    }

    setSelectedMenu(label);
  };

  const createNewChat = () => {
    Keyboard.dismiss();
    closeActions();
    setActiveChatId(null);
    setMessage("");
    setSelectedMenu("");
    setDrawerVisible(false);
    setSearchQuery("");
    setSearchVisible(false);
    setShowArchived(false);
  };

  const updateChat = (id: number, updater: (chat: Chat) => Chat) => {
    setChats((previous) =>
      previous.map((chat) => (chat.id === id ? updater(chat) : chat))
    );
  };

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;

    const now = createId();
    const assistantId = now + 1;

    const demoResponse = generateDemoResponse(text);

    const userMessage: ChatMessage = {
      id: now,
      text,
      role: "user",
    };

    const assistantMessage: ChatMessage = {
      id: assistantId,
      text: demoResponse,
      role: "assistant",
    };

    if (activeChatId !== null && activeChat) {
      updateChat(activeChatId, (chat) => ({
        ...chat,
        archived: false,
        title: chat.messages.length === 0 ? text.slice(0, 36) : chat.title,
        messages: [...chat.messages, userMessage, assistantMessage],
        updatedAt: Date.now(),
      }));
    } else {
      const newChat: Chat = {
        id: now,
        title: text.slice(0, 36),
        messages: [userMessage, assistantMessage],
        pinned: false,
        archived: false,
        updatedAt: Date.now(),
      };

      setChats((previous) => [newChat, ...previous]);
      setActiveChatId(newChat.id);
    }

    setMessage("");
    closeActions();
    setTimeout(() => {
      if (scrollViewRef.current && scrollViewRef.current.scrollToEnd) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const openChat = (id: number) => {
    Keyboard.dismiss();
    closeActions();
    setActiveChatId(id);
    setMessage("");
    setSelectedMenu("");
    setDrawerVisible(false);
    setShowArchived(false);
  };

  const togglePin = (id: number) => {
    updateChat(id, (chat) => ({
      ...chat,
      pinned: !chat.pinned,
      updatedAt: Date.now(),
    }));
  };

  const openChatActions = (id: number) => {
    Keyboard.dismiss();
    setActionTarget({ kind: "chat", chatId: id });
  };

  const openMessageActions = (chatId: number, messageId: number) => {
    Keyboard.dismiss();
    setActionTarget({ kind: "message", chatId, messageId });
  };

  const copyText = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      closeActions();
      Alert.alert("Copied", "Text copied to clipboard.");
    } catch {
      Alert.alert("Copy unavailable", "Please select and copy the text.");
    }
  };

  const shareText = async (text: string, title: string) => {
    try {
      await Share.share({
        message: text,
        title,
      });
    } catch {
      Alert.alert("Unable to share", "Please try again.");
    } finally {
      closeActions();
    }
  };

  const handleChatMenuAction = (action: ChatMenuAction) => {
    if (!activeChat) {
      Alert.alert("No active chat", "Open a conversation first.");
      return;
    }

    const chatId = activeChat.id;

    switch (action) {
      case "pin":
        togglePin(chatId);
        break;

      case "rename":
        beginRename(chatId);
        break;

      case "project":
        setActionTarget({ kind: "chat", chatId });
        setProjectValue(activeChat.projectName ?? "");
        setProjectVisible(true);
        break;

      case "archive":
        archiveChat(chatId);
        break;

      case "delete":
        deleteChat(chatId);
        break;

      case "share":
        void shareText(
          activeChat.messages
            .map(
              (item) =>
                `${item.role === "user" ? "You" : "ModelNow"}: ${item.text}`
            )
            .join("\n\n"),
          activeChat.title
        );
        break;

      case "find":
        Alert.alert("Find in chat", "Chat search is not connected yet.");
        break;

      case "home":
        Alert.alert("Add to Home", "The Home shortcut is not connected yet.");
        break;

      case "upload":
        Alert.alert("Upload files", "The file picker is not connected yet.");
        break;
    }
  };

  const beginRename = (id: number) => {
    const chat = chats.find((item) => item.id === id);
    if (!chat) return;

    setRenameChatId(id);
    setRenameValue(chat.title);
    closeActions();
    setRenameVisible(true);
  };

  const saveRenameChat = () => {
    const title = renameValue.trim();

    if (!title) {
      Alert.alert("Enter a title", "Chat title cannot be empty.");
      return;
    }

    if (renameChatId !== null) {
      updateChat(renameChatId, (chat) => ({
        ...chat,
        title: title.slice(0, 80),
        updatedAt: Date.now(),
      }));
    }

    setRenameVisible(false);
    setRenameChatId(null);
  };

  const archiveChat = (id: number) => {
    updateChat(id, (chat) => ({
      ...chat,
      archived: true,
      updatedAt: Date.now(),
    }));

    if (activeChatId === id) {
      setActiveChatId(null);
      setMessage("");
    }

    closeActions();
  };

  const unarchiveChat = (id: number) => {
    updateChat(id, (chat) => ({
      ...chat,
      archived: false,
      updatedAt: Date.now(),
    }));
  };

  const deleteChat = (id: number) => {
    closeActions();

    Alert.alert(
      "Delete chat?",
      "This chat and its messages will be removed from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setChats((previous) => previous.filter((chat) => chat.id !== id));

            if (activeChatId === id) {
              setActiveChatId(null);
              setMessage("");
            }
          },
        },
      ]
    );
  };

  const startAddToProject = () => {
    if (!targetChat) return;

    setProjectValue(targetChat.projectName ?? "");
    closeActions();
    setProjectVisible(true);
  };

  const saveProject = () => {
    const chatId = targetChat?.id ?? activeChatId;
    const name = projectValue.trim();

    if (chatId !== null) {
      updateChat(chatId, (chat) => ({
        ...chat,
        projectName: name || undefined,
        updatedAt: Date.now(),
      }));
    }

    setProjectVisible(false);
  };

  const editUserMessage = () => {
    if (
      actionTarget?.kind !== "message" ||
      !targetMessage ||
      targetMessage.role !== "user"
    ) {
      closeActions();
      return;
    }

    const { chatId, messageId } = actionTarget;

    setMessage(targetMessage.text);

    updateChat(chatId, (chat) => {
      const selectedIndex = chat.messages.findIndex(
        (item) => item.id === messageId
      );

      return {
        ...chat,
        messages:
          selectedIndex < 0
            ? chat.messages
            : chat.messages.slice(0, selectedIndex),
        updatedAt: Date.now(),
      };
    });

    setActiveChatId(chatId);
    closeActions();
  };

  const showSelectableText = (text: string) => {
    setSelectedText(text);
    closeActions();
    setSelectTextVisible(true);
  };

  const setMessageFeedback = (
    chatId: number,
    messageId: number,
    feedback: Feedback
  ) => {
    updateChat(chatId, (chat) => ({
      ...chat,
      messages: chat.messages.map((item) =>
        item.id === messageId
          ? {
              ...item,
              feedback: item.feedback === feedback ? null : feedback,
            }
          : item
      ),
    }));
  };

  const speakText = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: "en-US",
      rate: 0.9,
    });
    closeActions();
  };

  const renderHistory = (items: Chat[], pinned: boolean) => {
    if (items.length === 0) {
      return (
        <Text style={styles.emptyHistory}>
          {searchQuery.trim()
            ? "No matching chats"
            : pinned
            ? "Pinned chats will appear here"
            : showArchived
            ? "No archived chats"
            : "Your recent chats will appear here"}
        </Text>
      );
    }

    return items.map((chat) => (
      <View key={chat.id} style={styles.historyRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openChat(chat.id)}
          onLongPress={() => openChatActions(chat.id)}
          delayLongPress={350}
          style={[
            styles.historyChat,
            activeChatId === chat.id && styles.historyChatSelected,
          ]}
        >
          <Text numberOfLines={1} style={styles.historyChatText}>
            {chat.title}
          </Text>

          {!!chat.projectName && (
            <Text numberOfLines={1} style={styles.projectTag}>
              Project: {chat.projectName}
            </Text>
          )}
        </TouchableOpacity>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={pinned ? "Unpin chat" : "Pin chat"}
          onPress={() => togglePin(chat.id)}
          style={styles.pinButton}
        >
          <Pin
            size={17}
            color={chat.pinned ? SKY_BLUE : "#525252"}
            fill={chat.pinned ? SKY_BLUE : "transparent"}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More chat actions"
          onPress={() => openChatActions(chat.id)}
          style={styles.moreButton}
        >
          <MoreHorizontal size={21} color="#404040" />
        </Pressable>
      </View>
    ));
  };

  const renderPage = () => {
    switch (selectedMenu) {
      case "Plugins":
        return (
          <View style={styles.pageContainer}>
            <PluginsSettingsScreen
              onBack={goBackToMenu}
              onBrowsePlugins={() => openMenuItem("Browse Plugins")}
            />
          </View>
        );

      case "Browse Plugins":
        return (
          <View style={styles.pluginContainer}>
            <PluginsPage onBack={() => openMenuItem("Plugins")} />
          </View>
        );

      case "Images":
        return (
          <View style={styles.pageContainer}>
            <ImagesPage onBack={goBackToMenu} />
          </View>
        );

      case "Safety":
        return (
          <View style={styles.pageContainer}>
            <SafetyScreen onBack={goBackToMenu} />
          </View>
        );

      case "Ads controls":
        return (
          <View style={styles.pageContainer}>
            <AdsControlsScreen onBack={goBackToMenu} />
          </View>
        );

      case "Report a bug":
        return (
          <View style={styles.pageContainer}>
            <ReportBugScreen onBack={goBackToMenu} />
          </View>
        );

      case "Library":
        return (
          <View style={styles.pageContainer}>
            <LibraryPage onBack={goBackToMenu} />
          </View>
        );

      case "Voice":
        return (
          <View style={styles.pageContainer}>
            <VoiceScreen onBack={goBackToMenu} />
          </View>
        );

      case "About":
        return (
          <View style={styles.pageContainer}>
            <AboutScreen onBack={goBackToMenu} />
          </View>
        );

      case "Scheduled":
        return (
          <View style={styles.pageContainer}>
            <ScheduledPage onBack={goBackToMenu} onNewTask={createNewChat} />
          </View>
        );

      case "Security and login":
      case "Security":
        return (
          <View style={styles.pageContainer}>
            <SecurityScreen onBack={goBackToMenu} />
          </View>
        );

      case "Customize":
        return (
          <View style={styles.pageContainer}>
            <CustomizePage
              onBack={goBackToMenu}
              onTrySkill={(skillName) => {
                setMessage(`Help me with ${skillName}.`);
                setSelectedMenu("");
                setDrawerVisible(false);
              }}
            />
          </View>
        );

      case "Notifications":
        return (
          <View style={styles.pageContainer}>
            <NotificationsScreen onBack={goBackToMenu} />
          </View>
        );

      case "Settings Remote":
        return (
          <View style={styles.pageContainer}>
            <RemoteScreen onBack={() => openMenuItem("Settings")} />
          </View>
        );

      case "Storage":
        return (
          <View style={styles.pageContainer}>
            <StorageScreen onBack={goBackToSettings} />
          </View>
        );

      case "Privacy center":
        return (
          <View style={styles.pageContainer}>
            <PrivacyCenterScreen onBack={goBackToMenu} />
          </View>
        );

      case "Remote":
        return (
          <View style={styles.pageContainer}>
            <RemotePage onBack={goBackToMenu} />
          </View>
        );

      case "General":
        return (
          <View style={styles.pageContainer}>
            <GeneralScreen onBack={goBackToMenu} />
          </View>
        );

      case "Parental controls":
        return (
          <View style={styles.pageContainer}>
            <ParentalControlsScreen onBack={() => openMenuItem("Settings")} />
          </View>
        );

      case "Settings":
        return (
          <View style={styles.pageContainer}>
            <SettingsPage
              onBack={goBackToMenu}
              onOpenSetting={(name) => {
                const settingName = name.trim().toLowerCase();

                if (settingName === "logout" || settingName === "log out") {
                  setLogoutPopupVisible(true);
                  return;
                }

                if (settingName === "appearance") {
                  setAppearancePopupVisible(true);
                  return;
                }

                if (settingName === "accent color") {
                  setAccentColorPopupVisible(true);
                  return;
                }

                const settingsRoutes: Record<string, string> = {
                  general: "General",
                  notifications: "Notifications",
                  personalization: "Personalization",
                  memory: "Memory",
                  plugins: "Plugins",
                  "usage and limits": "Usage and limits",
                  "upgrade plans": "Plans",
                  "upgrade plan": "Plans",
                  plans: "Plans",
                  "trusted contact": "Trusted contact",
                  "parental controls": "Parental controls",
                  voice: "Voice",
                  safety: "Safety",
                  security: "Security",
                  "security and login": "Security",
                  storage: "Storage",
                  "privacy center": "Privacy center",
                  "history and data": "History and data",
                  "ads controls": "Ads controls",
                  "report a bug": "Report a bug",
                  about: "About",
                  remote: "Settings Remote",
                  "remote control": "Settings Remote",
                };

                const route = settingsRoutes[settingName];
                if (route) {
                  openMenuItem(route);
                }
              }}
            />
          </View>
        );

      case "Usage and limits":
        return (
          <View style={styles.pageContainer}>
            <UsageLimitsScreen
              onBack={() => openMenuItem("Settings")}
              onAutomaticRecharge={() => openMenuItem("Automatic recharge")}
            />
          </View>
        );

      case "Plans":
        return (
          <View style={styles.plansContainer}>
            {/* Step 1: Plan & Billing Cycle Selection */}
            {plansStep === "plans" && (
              <UpgradePlanScreen
                onBack={() => {
                  setPlansStep("plans");
                  setSelectedMenu("");
                }}
                onUpgrade={(plan, billing) => {
                  setSelectedPlan(plan);
                  setSelectedBilling(billing);
                  setPlansStep("payment");
                }}
              />
            )}

            {/* Step 2: Payment Methods Selection */}
            {plansStep === "payment" && (
              <PaymentMethodsScreen
                planName={
                  selectedPlan === "plus"
                    ? "ModelNow Plus"
                    : "ModelNow Pro"
                }
                onBack={() => setPlansStep("plans")}
                onContinue={(method) => {
                  setSelectedPaymentMethod(method);
                  setPlansStep("checkout");
                }}
              />
            )}

            {/* Step 3: Order Review & Checkout */}
            {plansStep === "checkout" && (
              <CheckoutScreen
                plan={selectedPlan}
                billing={selectedBilling}
                paymentMethod={selectedPaymentMethod}
                isLoading={paymentLoading}
                onBack={() => setPlansStep("payment")}
                onPayNow={async () => {
                  setPaymentLoading(true);

                  try {
                    const planName =
                      selectedPlan === "plus"
                        ? "ModelNow Plus"
                        : "ModelNow Pro";

                    const amount =
                      selectedPlan === "plus"
                        ? selectedBilling === "monthly"
                          ? 699
                          : 6999
                        : selectedBilling === "monthly"
                        ? 1499
                        : 14999;

                    if (RAZORPAY_SUBSCRIPTION_ID) {
                      await openSubscriptionCheckout({
                        subscriptionId: RAZORPAY_SUBSCRIPTION_ID,
                        planName,
                        billing: selectedBilling,
                        paymentMethod: selectedPaymentMethod,
                      });
                      setPaymentResult("success");
                      setPlansStep("confirmation");
                    } else if (
                      selectedPaymentMethod === "Credit or debit card"
                    ) {
                      // Simulate card authorization after CheckoutScreen's card modal submits
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      setPaymentResult("success");
                      setPlansStep("confirmation");
                    } else {
                      // Directly opens the chosen UPI app with valid merchant VPA & intent params
                      const launched = await openSelectedUpiApp(
                        selectedPaymentMethod,
                        amount,
                        planName
                      );
                      if (!launched) {
                        setPaymentLoading(false);
                        return;
                      }

                      // Verify payment status when returning from the external UPI app in test mode
                      Alert.alert(
                        "Confirm UPI Payment",
                        `Did your ₹${amount} payment in ${selectedPaymentMethod} succeed?`,
                        [
                          {
                            text: "Payment Failed / Cancelled",
                            style: "destructive",
                            onPress: () => {
                              setPaymentResult("failed");
                              setPlansStep("result");
                            },
                          },
                          {
                            text: "Yes, Paid",
                            onPress: () => {
                              setPaymentResult("success");
                              setPlansStep("confirmation");
                            },
                          },
                        ]
                      );
                    }
                  } catch (error) {
                    console.error("Subscription checkout error:", error);
                    setPaymentResult("failed");
                    setPlansStep("result");
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
              />
            )}

            {/* Step 4: Final Subscription Confirmation Receipt */}
            {plansStep === "confirmation" && (
              <SubscriptionConfirmationScreen
                plan={selectedPlan}
                billing={selectedBilling}
                paymentMethod={selectedPaymentMethod}
                onBack={() => setPlansStep("checkout")}
                onSubscribe={() => {
                  setPlansStep("plans");
                  setSelectedMenu("");
                }}
              />
            )}

            {/* Payment Failure / Retry Fallback */}
            {plansStep === "result" && (
              <PaymentResultScreen
                result={paymentResult}
                onRetry={() => setPlansStep("checkout")}
                onDone={() => {
                  setPlansStep("plans");
                  setPaymentLoading(false);
                  setSelectedMenu("");
                }}
              />
            )}
          </View>
        );

      case "Automatic recharge":
        return (
          <View style={styles.pageContainer}>
            <View style={styles.placeholderScreen}>
              <Pressable
                onPress={() => openMenuItem("Usage and limits")}
                style={styles.placeholderBack}
              >
                <Text style={styles.placeholderBackText}>
                  ← Back to Usage and limits
                </Text>
              </Pressable>

              <Text style={styles.placeholderTitle}>Automatic recharge</Text>

              <Text style={styles.placeholderDescription}>
                Configure automatic credit recharge here. Payment integration
                will be connected when the backend is ready.
              </Text>
            </View>
          </View>
        );

      case "Personalization":
        return (
          <View style={styles.pageContainer}>
            <PersonalizationScreen
              onBack={() => openMenuItem("Settings")}
              onSave={(settings) => {
                console.log("Personalization settings:", settings);
              }}
            />
          </View>
        );

      case "Memory":
        return (
          <View style={styles.pageContainer}>
            <MemoryScreen
              onBack={() => openMenuItem("Settings")}
              onOpenSetting={(name) => openMenuItem(name)}
            />
          </View>
        );

      case "Trusted contact":
        return (
          <View style={styles.pageContainer}>
            <TrustedContactScreen onBack={() => openMenuItem("Settings")} />
          </View>
        );

      case "History and data":
        return (
          <View style={styles.pageContainer}>
            <HistoryAndDataScreen onBack={goBackToSettings} />
          </View>
        );

      default:
        return (
          <View style={styles.placeholderScreen}>
            <Pressable onPress={goBackToMenu} style={styles.placeholderBack}>
              <Text style={styles.placeholderBackText}>← Back to menu</Text>
            </Pressable>

            <Text style={styles.placeholderTitle}>{selectedMenu}</Text>

            <Text style={styles.placeholderDescription}>
              This ModelNow section will be connected separately.
            </Text>
          </View>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const bottomSpace = isKeyboardVisible
    ? 8
    : Math.max(insets.bottom, Platform.OS === "android" ? 16 : 10);

  const isDarkScreen =
    selectedMenu === "Plugins" ||
    selectedMenu === "Browse Plugins" ||
    selectedMenu === "Plans";

  return (
    <SafeAreaView
      style={[
        styles.screen,
        selectedMenu === "Plans" && styles.plansScreen,
      ]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDarkScreen ? "light-content" : "dark-content"} />

      {selectedMenu !== "" ? (
        renderPage()
      ) : (
        <KeyboardAvoidingView
          style={styles.chatWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open navigation menu"
                onPress={() => {
                  Keyboard.dismiss();
                  setDrawerVisible(true);
                }}
                style={styles.headerButton}
              >
                <View style={styles.menuIcon}>
                  <View style={styles.menuLine} />
                  <View style={styles.menuLine} />
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Get Plus"
                onPress={() => openMenuItem("Plans")}
                style={styles.getPlusButton}
              >
                <Text style={styles.getPlusText}>✦ Get Plus</Text>
              </Pressable>
            </View>

            <View style={styles.headerActions}>
              {messages.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open chat options"
                  onPress={() => setChatOptionsVisible(true)}
                  style={styles.newChatButton}
                >
                  <MoreHorizontal size={24} color="#111111" />
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="New chat"
                onPress={createNewChat}
                style={styles.newChatButton}
              >
                <Plus size={25} color="#111111" strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>

          {/* Chat Content */}
          {messages.length === 0 ? (
            <View style={styles.content}>
              <Image
                source={require("./assets/modelnow-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="ModelNow logo"
              />

              <Text style={styles.title}>How can I help you today?</Text>

              <Text style={styles.subtitle}>
                Ask anything, explore ideas, or get work done.
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.messageList}
              contentContainerStyle={styles.messageContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                if (scrollViewRef.current && scrollViewRef.current.scrollToEnd) {
                  scrollViewRef.current.scrollToEnd({ animated: true });
                }
              }}
            >
              {messages.map((item) => {
                const messageMenuOpen =
                  actionTarget?.kind === "message" &&
                  actionTarget.chatId === activeChatId &&
                  actionTarget.messageId === item.id;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.messageBlock,
                      item.role === "user"
                        ? styles.userMessageBlock
                        : styles.assistantMessageBlock,
                    ]}
                  >
                    <Pressable
                      onLongPress={() => {
                        if (
                          item.role === "user" &&
                          activeChatId !== null
                        ) {
                          openMessageActions(activeChatId, item.id);
                        }
                      }}
                      delayLongPress={350}
                      style={[
                        styles.messageBubble,
                        item.role === "user"
                          ? styles.userBubble
                          : styles.assistantBubble,
                      ]}
                    >
                      <Text selectable style={styles.messageText}>
                        {item.text}
                      </Text>
                    </Pressable>

                    {messageMenuOpen && item.role === "user" && (
                      <View style={styles.inlineMessageActions}>
                        <CompactAction
                          icon={<Copy size={17} color="#262626" />}
                          label="Copy"
                          onPress={() => copyText(item.text)}
                        />

                        <CompactAction
                          icon={<Check size={17} color="#262626" />}
                          label="Select text"
                          onPress={() => showSelectableText(item.text)}
                        />

                        <CompactAction
                          icon={<Pencil size={17} color="#262626" />}
                          label="Edit message"
                          onPress={editUserMessage}
                        />

                        <CompactAction
                          icon={<Share2 size={17} color="#262626" />}
                          label="Share prompt"
                          onPress={() =>
                            shareText(item.text, "ModelNow prompt")
                          }
                        />
                      </View>
                    )}

                    {item.role === "assistant" && activeChatId !== null && (
                      <View style={styles.responseActions}>
                        <Pressable
                          accessibilityLabel="Copy response"
                          onPress={() => copyText(item.text)}
                          style={styles.responseActionButton}
                        >
                          <Copy size={18} color="#525252" />
                        </Pressable>

                        <Pressable
                          accessibilityLabel="Good response"
                          onPress={() =>
                            setMessageFeedback(
                              activeChatId,
                              item.id,
                              "up"
                            )
                          }
                          style={[
                            styles.responseActionButton,
                            item.feedback === "up" && styles.feedbackSelected,
                          ]}
                        >
                          <ThumbsUp
                            size={18}
                            color={
                              item.feedback === "up" ? SKY_BLUE : "#525252"
                            }
                          />
                        </Pressable>

                        <Pressable
                          accessibilityLabel="Bad response"
                          onPress={() =>
                            setMessageFeedback(
                              activeChatId,
                              item.id,
                              "down"
                            )
                          }
                          style={[
                            styles.responseActionButton,
                            item.feedback === "down" && styles.feedbackSelected,
                          ]}
                        >
                          <ThumbsDown
                            size={18}
                            color={
                              item.feedback === "down" ? SKY_BLUE : "#525252"
                            }
                          />
                        </Pressable>

                        <Pressable
                          accessibilityLabel="Read response aloud"
                          onPress={() => speakText(item.text)}
                          style={styles.responseActionButton}
                        >
                          <Volume2 size={18} color="#525252" />
                        </Pressable>

                        <Pressable
                          accessibilityLabel="Share response"
                          onPress={() =>
                            shareText(item.text, "ModelNow response")
                          }
                          style={styles.responseActionButton}
                        >
                          <Share2 size={18} color="#525252" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Input Composer */}
          <View
            style={[
              styles.composerOuter,
              {
                paddingBottom: bottomSpace,
              },
            ]}
          >
            <View style={styles.composer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add attachment"
                onPress={() => {
                  Keyboard.dismiss();
                  setAttachmentMenuVisible(true);
                }}
                style={styles.actionButton}
              >
                <Plus size={26} color="#111111" strokeWidth={2} />
              </Pressable>

              <TextInput
                style={styles.input}
                placeholder={
                  searchMode === "web"
                    ? "Search the web..."
                    : searchMode === "deep"
                    ? "What topic should I research deeply?"
                    : "Message ModelNow"
                }
                placeholderTextColor={COLORS.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={10000}
                returnKeyType="default"
                blurOnSubmit={false}
                textAlignVertical="center"
              />

              <View style={styles.rightActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isListening ? "Stop voice input" : "Start voice input"
                  }
                  onPress={async () => {
                    try {
                      if (isListening) {
                        ExpoSpeechRecognitionModule.stop();
                        return;
                      }

                      const permission =
                        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

                      if (!permission.granted) {
                        Alert.alert(
                          "Microphone permission required",
                          "Please allow microphone access to use voice input."
                        );
                        return;
                      }

                      Keyboard.dismiss();

                      ExpoSpeechRecognitionModule.start({
                        lang: "en-US",
                        interimResults: true,
                        continuous: false,
                      });
                    } catch (error) {
                      Alert.alert(
                        "Microphone error",
                        error instanceof Error
                          ? error.message
                          : "Unable to start speech recognition."
                      );
                    }
                  }}
                  style={styles.micButton}
                >
                  <Mic
                    size={22}
                    color={isListening ? SKY_BLUE : "#111111"}
                    strokeWidth={2}
                  />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    hasMessage ? "Send message" : "Start voice mode"
                  }
                  onPress={() => {
                    if (hasMessage) {
                      sendMessage();
                    } else {
                      Keyboard.dismiss();
                    }
                  }}
                  style={({ pressed }) => [
                    styles.sendButton,
                    pressed && styles.sendPressed,
                  ]}
                >
                  {hasMessage ? (
                    <ArrowUp
                      size={20}
                      color="#FFFFFF"
                      strokeWidth={2.7}
                    />
                  ) : (
                    <AudioLines
                      size={20}
                      color="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Navigation drawer */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
            style={styles.backdrop}
            onPress={closeDrawer}
          />

          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>ModelNow</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search chats"
                onPress={() => {
                  setSearchVisible((previous) => !previous);
                  setSearchQuery("");
                  setShowArchived(false);
                }}
                style={styles.drawerHeaderButton}
              >
                <Search size={23} color="#111111" />
              </Pressable>
            </View>

            {searchVisible && (
              <View style={styles.searchBox}>
                <Search size={18} color="#555555" />

                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search chats"
                  placeholderTextColor="#777777"
                  style={styles.searchInput}
                  autoFocus
                  returnKeyType="search"
                />

                {!!searchQuery && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Text style={styles.clearSearchText}>×</Text>
                  </Pressable>
                )}
              </View>
            )}

            <View style={styles.drawerDivider} />

            <ScrollView
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {MENU_ITEMS.map(({ label, Icon }) => (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.7}
                  onPress={() => openMenuItem(label)}
                  style={[
                    styles.drawerItem,
                    selectedMenu === label && styles.drawerItemSelected,
                  ]}
                >
                  <View style={styles.drawerIconWrap}>
                    <Icon size={21} color="#111111" strokeWidth={1.9} />
                  </View>
                  <Text style={styles.drawerItemText}>{label}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.historyHeader}>
                <Text style={styles.historyHeading}>Pinned</Text>
              </View>

              {!showArchived && renderHistory(pinnedChats, true)}

              <View style={styles.historyHeader}>
                <Text style={styles.historyHeading}>
                  {showArchived ? "Archived chats" : "Recents"}
                </Text>
              </View>

              {showArchived
                ? renderHistory(archivedChats, false)
                : renderHistory(recentChats, false)}

              <Pressable
                onPress={() => setShowArchived((previous) => !previous)}
                style={styles.archivedToggle}
              >
                <Archive size={18} color="#404040" />
                <Text style={styles.archivedToggleText}>
                  {showArchived
                    ? "Show active chats"
                    : "View archived chats"}
                </Text>
              </Pressable>

              {showArchived &&
                archivedChats.map((chat) => (
                  <Pressable
                    key={chat.id}
                    onPress={() => unarchiveChat(chat.id)}
                    style={styles.unarchiveButton}
                  >
                    <Text style={styles.unarchiveText}>
                      Restore "{chat.title}"
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="New chat"
                onPress={createNewChat}
                style={styles.drawerNewChatHighlight}
              >
                <SquarePen size={20} color="#FFFFFF" />
                <Text style={styles.drawerNewChatText}>Chat</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Settings"
                onPress={() => openMenuItem("Settings")}
                style={styles.profileButton}
              >
                <Text style={styles.profileInitials}>PU</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recent-chat action popup */}
      <Modal
        visible={actionTarget?.kind === "chat"}
        transparent
        animationType="fade"
        onRequestClose={closeActions}
      >
        <View style={styles.actionModalRoot}>
          <Pressable style={styles.actionBackdrop} onPress={closeActions} />

          <View style={styles.actionSheet}>
            {!!targetChat && (
              <>
                <Text style={styles.actionSheetTitle} numberOfLines={2}>
                  {targetChat.title}
                </Text>

                <ActionRow
                  icon={<Pin size={18} color="#262626" />}
                  label={targetChat.pinned ? "Unpin chat" : "Pin chat"}
                  onPress={() => {
                    togglePin(targetChat.id);
                    closeActions();
                  }}
                />

                <ActionRow
                  icon={<Pencil size={18} color="#262626" />}
                  label="Rename"
                  onPress={() => beginRename(targetChat.id)}
                />

                <ActionRow
                  icon={<Archive size={18} color="#262626" />}
                  label="Archive"
                  onPress={() => archiveChat(targetChat.id)}
                />

                <ActionRow
                  icon={<FolderPlus size={18} color="#262626" />}
                  label="Add to project"
                  onPress={startAddToProject}
                />

                <ActionRow
                  icon={<Trash2 size={18} color="#DC2626" />}
                  label="Delete"
                  danger
                  onPress={() => deleteChat(targetChat.id)}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Rename chat */}
      <Modal
        visible={renameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameVisible(false)}
      >
        <View style={styles.centerModalRoot}>
          <Pressable
            style={styles.centerModalBackdrop}
            onPress={() => setRenameVisible(false)}
          />

          <View style={styles.formModal}>
            <Text style={styles.formTitle}>Rename chat</Text>

            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Chat name"
              placeholderTextColor="#737373"
              style={styles.formInput}
              autoFocus
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={saveRenameChat}
            />

            <View style={styles.formButtons}>
              <Pressable
                onPress={() => setRenameVisible(false)}
                style={styles.formCancelButton}
              >
                <Text style={styles.formCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={saveRenameChat}
                style={styles.formSaveButton}
              >
                <Text style={styles.formSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add to project */}
      <Modal
        visible={projectVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProjectVisible(false)}
      >
        <View style={styles.centerModalRoot}>
          <Pressable
            style={styles.centerModalBackdrop}
            onPress={() => setProjectVisible(false)}
          />

          <View style={styles.formModal}>
            <Text style={styles.formTitle}>Add to project</Text>

            <Text style={styles.formDescription}>
              Enter an existing or new project name. This is stored locally until
              your project backend is connected.
            </Text>

            <TextInput
              value={projectValue}
              onChangeText={setProjectValue}
              placeholder="Project name"
              placeholderTextColor="#737373"
              style={styles.formInput}
              autoFocus
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={saveProject}
            />

            <View style={styles.formButtons}>
              <Pressable
                onPress={() => setProjectVisible(false)}
                style={styles.formCancelButton}
              >
                <Text style={styles.formCancelText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={saveProject} style={styles.formSaveButton}>
                <Text style={styles.formSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Selectable text */}
      <Modal
        visible={selectTextVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectTextVisible(false)}
      >
        <View style={styles.centerModalRoot}>
          <Pressable
            style={styles.centerModalBackdrop}
            onPress={() => setSelectTextVisible(false)}
          />

          <View style={styles.selectTextModal}>
            <View style={styles.selectTextHeader}>
              <Text style={styles.formTitle}>Select text</Text>

              <Pressable onPress={() => setSelectTextVisible(false)}>
                <X size={22} color="#262626" />
              </Pressable>
            </View>

            <ScrollView style={styles.selectTextScroll}>
              <Text selectable style={styles.selectableMessage}>
                {selectedText}
              </Text>
            </ScrollView>

            <Pressable
              onPress={async () => {
                await Clipboard.setStringAsync(selectedText);
                setSelectTextVisible(false);
                Alert.alert("Copied", "Text copied to clipboard.");
              }}
              style={styles.formSaveButton}
            >
              <Text style={styles.formSaveText}>Copy all text</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Appearance popup */}
      <AppearancePopup
        visible={appearancePopupVisible}
        value={appearance}
        onSelect={(mode) => {
          setAppearance(mode);
          setAppearancePopupVisible(false);
        }}
        onClose={() => setAppearancePopupVisible(false)}
      />

      {/* Chat Options Menu */}
      <ChatOptionsMenu
        visible={chatOptionsVisible}
        isPinned={activeChat?.pinned ?? false}
        onClose={() => setChatOptionsVisible(false)}
        onAction={handleChatMenuAction}
      />

      {/* Attachment Menu */}
      <AttachmentMenu
        visible={attachmentMenuVisible}
        onClose={() => setAttachmentMenuVisible(false)}
        onCamera={async () => {
          try {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
              Alert.alert(
                "Camera permission required",
                "Allow camera access in your device settings to take a photo."
              );
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: false,
              quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
              const asset = result.assets[0];

              setMessage((previous) =>
                previous
                  ? `${previous}\n[Photo captured: ${
                      asset.fileName ?? "camera-photo"
                    }]`
                  : `[Photo captured: ${asset.fileName ?? "camera-photo"}]`
              );

              Alert.alert(
                "Photo captured",
                "The photo was selected on your device. Uploading it to the AI is a separate integration step."
              );
            }
          } catch {
            Alert.alert(
              "Camera error",
              "Unable to open the camera. Please try again."
            );
          }
        }}
        onPhotos={async () => {
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsMultipleSelection: true,
              quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
              const names = result.assets.map(
                (asset, index) =>
                  asset.fileName ?? `selected-photo-${index + 1}`
              );

              setMessage((previous) =>
                `${previous}${previous ? "\n" : ""}[Selected photos: ${names.join(
                  ", "
                )}]`
              );

              Alert.alert(
                "Photos selected",
                `${result.assets.length} photo(s) selected. Sending the actual images to the AI is a separate integration step.`
              );
            }
          } catch {
            Alert.alert(
              "Photos error",
              "Unable to open the photo gallery. Please try again."
            );
          }
        }}
        onFiles={async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({
              type: ["*/*"],
              multiple: true,
              copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets.length > 0) {
              const names = result.assets.map((asset) => asset.name);

              setMessage((previous) =>
                `${previous}${previous ? "\n" : ""}[Selected files: ${names.join(
                  ", "
                )}]`
              );

              Alert.alert(
                "Files selected",
                `${result.assets.length} file(s) selected. Uploading and processing them requires the next integration step.`
              );
            }
          } catch {
            Alert.alert(
              "File picker error",
              "Unable to select files. Please try again."
            );
          }
        }}
        onWebSearch={() => {
          setSearchMode("web");
          setMessage("");
          Keyboard.dismiss();
        }}
        onDeepSearch={() => {
          setSearchMode("deep");
          setMessage("");
          Keyboard.dismiss();
        }}
        onThinkHarder={() => {
          Alert.alert(
            "Think harder",
            "Advanced reasoning is not connected yet."
          );
        }}
      />

      <AccentColorScreen
        visible={accentColorPopupVisible}
        value={accentColor}
        onSelect={(color) => {
          setAccentColor(color);
          setAccentColorPopupVisible(false);
        }}
        onClose={() => setAccentColorPopupVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainChatScreen />
    </SafeAreaProvider>
  );
}

function CompactAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.compactActionRow,
        pressed && styles.actionRowPressed,
      ]}
    >
      {icon}
      <Text style={styles.compactActionLabel}>{label}</Text>
    </Pressable>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed && styles.actionRowPressed,
      ]}
    >
      {icon}
      <Text style={[styles.actionRowLabel, danger && styles.dangerText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  plansScreen: {
    backgroundColor: "#090A0F",
  },
  chatWrapper: {
    flex: 1,
  },
  pluginContainer: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  plansContainer: {
    flex: 1,
    backgroundColor: "#090A0F",
  },
  pageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: 20,
    height: 14,
    justifyContent: "center",
    gap: 4,
  },
  menuLine: {
    width: 18,
    height: 2.2,
    borderRadius: 2,
    backgroundColor: "#111111",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  getPlusButton: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  getPlusText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  newChatButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoImage: {
    width: 140,
    height: 64,
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 16,
  },
  messageBlock: {
    maxWidth: "100%",
  },
  userMessageBlock: {
    alignSelf: "flex-end",
    maxWidth: "88%",
    alignItems: "flex-end",
  },
  assistantMessageBlock: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: COLORS.surface,
  },
  assistantBubble: {
    backgroundColor: "transparent",
    paddingHorizontal: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  inlineMessageActions: {
    width: 200,
    marginTop: 6,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-end",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  compactActionRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  compactActionLabel: {
    flex: 1,
    color: "#262626",
    fontSize: 13,
    fontWeight: "600",
  },
  responseActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  responseActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackSelected: {
    backgroundColor: "#EFF6FF",
  },
  composerOuter: {
    paddingHorizontal: 12,
    paddingTop: 6,
    backgroundColor: COLORS.background,
  },
  composer: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    minHeight: 38,
    maxHeight: 100,
    paddingHorizontal: 6,
    paddingVertical: 6,
    margin: 0,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 4,
  },
  micButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SKY_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  sendPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },
  drawer: {
    width: "82%",
    maxWidth: 340,
    height: "100%",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 48 : 32,
    paddingHorizontal: 16,
    paddingBottom: 8,
    elevation: 12,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    gap: 8,
  },
  drawerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: -0.5,
  },
  drawerHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  searchBox: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    color: "#111111",
    fontSize: 14,
  },
  clearSearchText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#555555",
    paddingHorizontal: 4,
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D1D5DB",
    marginBottom: 10,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingBottom: 12,
  },
  drawerItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  drawerItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  drawerIconWrap: {
    width: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  drawerItemText: {
    fontSize: 16,
    color: "#111111",
    fontWeight: "600",
  },
  historyHeader: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  historyHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666666",
  },
  emptyHistory: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    lineHeight: 18,
    color: "#666666",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyChat: {
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyChatSelected: {
    backgroundColor: "#F1F5F9",
  },
  historyChatText: {
    fontSize: 14,
    color: "#171717",
    fontWeight: "500",
  },
  projectTag: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  pinButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  archivedToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  archivedToggleText: {
    color: "#404040",
    fontSize: 13,
    fontWeight: "600",
  },
  unarchiveButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    marginBottom: 4,
  },
  unarchiveText: {
    fontSize: 13,
    color: "#334155",
  },
  drawerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  drawerNewChatHighlight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 130,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: SKY_BLUE,
  },
  drawerNewChatText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileInitials: {
    width: 34,
    height: 34,
    lineHeight: 34,
    overflow: "hidden",
    borderRadius: 17,
    textAlign: "center",
    color: "#FFFFFF",
    backgroundColor: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  placeholderScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  placeholderBack: {
    alignSelf: "flex-start",
    paddingVertical: 10,
  },
  placeholderBackText: {
    fontSize: 15,
    color: "#0284C7",
    fontWeight: "700",
  },
  placeholderTitle: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  placeholderDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  actionModalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  actionBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  actionSheet: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    maxWidth: 320,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 16,
    marginBottom: 40,
  },
  actionSheetTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#171717",
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  actionRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionRowPressed: {
    backgroundColor: "#F1F5F9",
  },
  actionRowLabel: {
    flex: 1,
    color: "#262626",
    fontSize: 14,
    fontWeight: "600",
  },
  dangerText: {
    color: "#DC2626",
  },
  centerModalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  centerModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  formModal: {
    width: "100%",
    maxWidth: 400,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    elevation: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },
  formDescription: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "#525252",
  },
  formInput: {
    minHeight: 44,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#171717",
    fontSize: 14,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  formCancelButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  formCancelText: {
    color: "#262626",
    fontSize: 13,
    fontWeight: "700",
  },
  formSaveButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: SKY_BLUE,
  },
  formSaveText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  selectTextModal: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "75%",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    elevation: 10,
  },
  selectTextHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  selectTextScroll: {
    maxHeight: 280,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  selectableMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: "#171717",
  },
});