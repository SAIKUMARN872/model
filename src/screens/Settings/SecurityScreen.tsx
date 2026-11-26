
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, ChevronRight } from "lucide-react-native";

type SecurityScreenProps = {
  onBack: () => void;
};

const STORAGE_KEY = "modelnow-security-settings-v1";

type SecuritySettings = {
  requireDeviceUnlock: boolean;
  authenticatorEnabled: boolean;
  textMessageEnabled: boolean;
  lockdownEnabled: boolean;
};

const DEFAULT_SETTINGS: SecuritySettings = {
  requireDeviceUnlock: false,
  authenticatorEnabled: false,
  textMessageEnabled: false,
  lockdownEnabled: false,
};

export default function SecurityScreen({
  onBack,
}: SecurityScreenProps) {
  const [settings, setSettings] =
    useState<SecuritySettings>(DEFAULT_SETTINGS);

  const [loaded, setLoaded] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...JSON.parse(saved),
          });
        }
      } catch (error) {
        console.warn("Could not load security settings.", error);
      } finally {
        setLoaded(true);
      }
    };

    void loadSettings();
  }, []);

  const updateSetting = async (
    key: keyof SecuritySettings,
    value: boolean,
  ) => {
    const updated = { ...settings, [key]: value };

    setSettings(updated);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.warn("Could not save security settings.", error);
      Alert.alert("Error", "Could not save this preference.");
    }
  };

  const showInformation = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const openPage = (page: string) => {
    setActivePage(page);
  };

  const goBack = () => {
    if (activePage !== null) {
      setActivePage(null);
    } else {
      onBack();
    }
  };

  const renderRow = (
    title: string,
    value: string | null,
    onPress: () => void,
    last = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.row,
        !last && styles.rowDivider,
      ]}
    >
      <Text style={styles.rowTitle}>{title}</Text>

      <View style={styles.rowRight}>
        {value !== null && (
          <Text style={styles.rowValue}>{value}</Text>
        )}
        <ChevronRight size={19} color="#888888" />
      </View>
    </Pressable>
  );

  const renderSwitchRow = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
  ) => (
    <View style={styles.switchRow}>
      <Text style={styles.rowTitle}>{title}</Text>

      <Switch
        value={value}
        disabled={!loaded}
        onValueChange={onValueChange}
        trackColor={{
          false: "#EDEDED",
          true: "#111111",
        }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#EDEDED"
      />
    </View>
  );

  const renderDescription = (text: string) => (
    <Text style={styles.description}>{text}</Text>
  );

  const renderDetailPage = () => {
    switch (activePage) {
      case "Security keys & passkeys":
        return (
          <>
            <View style={styles.singleCard}>
              {renderRow(
                "Add a passkey",
                "Add",
                () =>
                  showInformation(
                    "Passkeys",
                    "Passkey registration requires secure authentication and backend integration.",
                  ),
                true,
              )}
            </View>

            {renderDescription(
              "Use passkeys or hardware security keys to sign in. These phishing-resistant methods provide stronger protection than passwords.",
            )}
          </>
        );

      case "Authenticator app":
        return (
          <>
            <View style={styles.singleCard}>
              {renderRow(
                "Authenticator app",
                settings.authenticatorEnabled ? "On" : "Off",
                () =>
                  showInformation(
                    "Authenticator app",
                    "Authenticator setup requires server-side multi-factor authentication and verification.",
                  ),
                true,
              )}
            </View>

            {renderDescription(
              "Use an authenticator app to generate verification codes when signing in. Real authentication is not connected yet.",
            )}
          </>
        );

      case "Text message":
        return (
          <>
            <View style={styles.singleCard}>
              {renderRow(
                "Text message",
                settings.textMessageEnabled ? "On" : "Off",
                () =>
                  showInformation(
                    "Text message verification",
                    "SMS verification requires a verified phone number and a secure authentication service.",
                  ),
                true,
              )}
            </View>

            {renderDescription(
              "Receive a verification code by SMS when signing in. Actual text-message verification is not connected yet.",
            )}
          </>
        );

      case "Active sessions":
        return (
          <>
            <View style={styles.singleCard}>
              <View style={styles.row}>
                <Text style={styles.rowTitle}>Current device</Text>
                <Text style={styles.rowValue}>This device</Text>
              </View>
            </View>

            {renderDescription(
              "Your actual account sessions will appear here after ModelNow authentication and session management are connected.",
            )}

            <Pressable
              style={styles.actionButton}
              onPress={() =>
                showInformation(
                  "Active sessions",
                  "Session management requires a connected authentication backend. No sessions have been terminated.",
                )
              }
            >
              <Text style={styles.actionButtonText}>
                Manage sessions
              </Text>
            </Pressable>
          </>
        );

      case "Security history":
        return (
          <View style={styles.singleCard}>
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryTitle}>
                Security history
              </Text>
              <Text style={styles.emptyHistoryText}>
                Security events will appear here when account
                security logging is connected.
              </Text>
            </View>
          </View>
        );

      case "Advanced account security":
        return (
          <>
            <View style={styles.singleCard}>
              {renderRow(
                "Review security options",
                null,
                () =>
                  showInformation(
                    "Advanced account security",
                    "Advanced protection requires backend authentication, monitoring, and account recovery controls.",
                  ),
                true,
              )}
            </View>

            {renderDescription(
              "Additional account protections can be configured after the security service is integrated.",
            )}
          </>
        );

      case "Lockdown mode":
        return (
          <>
            <View style={styles.singleCard}>
              {renderSwitchRow(
                "Lockdown mode",
                settings.lockdownEnabled,
                (value) =>
                  void updateSetting("lockdownEnabled", value),
              )}
            </View>

            {renderDescription(
              "This saves your lockdown preference locally. It does not restrict account access until enforcement is implemented.",
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={goBack}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#111111" />
        </Pressable>

        <Text
          numberOfLines={1}
          style={styles.headerTitle}
        >
          {activePage ?? "Security"}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        key={activePage ?? "security-home"}
        style={styles.scroll}
        contentContainerStyle={
          activePage ? styles.detailContent : styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {activePage ? (
          renderDetailPage()
        ) : (
          <>
            <View style={styles.singleCard}>
              {renderRow(
                "Security keys & passkeys",
                "Add",
                () => openPage("Security keys & passkeys"),
                true,
              )}
            </View>

            {renderDescription(
              "Use passkeys or hardware security keys to sign in. These phishing-resistant methods provide stronger protection than passwords.",
            )}

            <Text style={styles.sectionTitle}>
              Multi Factor Authentication
            </Text>

            <View style={styles.groupCard}>
              {renderRow(
                "Authenticator app",
                "Off",
                () => openPage("Authenticator app"),
              )}

              {renderRow(
                "Text message",
                "Off",
                () => openPage("Text message"),
                true,
              )}
            </View>

            {renderDescription(
              "Require an extra security challenge when logging in. If you are unable to pass this challenge, you will have the option to recover your account.",
            )}

            <Text style={styles.sectionTitle}>Sessions</Text>

            <View style={styles.singleCard}>
              {renderRow(
                "Active sessions",
                "—",
                () => openPage("Active sessions"),
                true,
              )}
            </View>

            {renderDescription(
              "View devices and sessions that have accessed your account. Session management requires account authentication integration.",
            )}

            <View style={styles.unlockCard}>
              {renderSwitchRow(
                "Require device unlock",
                settings.requireDeviceUnlock,
                (value) =>
                  void updateSetting("requireDeviceUnlock", value),
              )}
            </View>

            {renderDescription(
              "Use your screen lock or biometrics to protect access to ModelNow. Actual biometric enforcement requires native device authentication integration.",
            )}

            <View style={styles.singleCard}>
              {renderRow(
                "Security history",
                null,
                () => openPage("Security history"),
                true,
              )}
            </View>

            <Text
              style={[
                styles.sectionTitle,
                styles.advancedTitle,
              ]}
            >
              Advanced security
            </Text>

            <View style={styles.groupCard}>
              {renderRow(
                "Advanced account security",
                null,
                () => openPage("Advanced account security"),
              )}

              {renderRow(
                "Lockdown mode",
                null,
                () => openPage("Lockdown mode"),
                true,
              )}
            </View>
          </>
        )}
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
    height: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    maxWidth: "70%",
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  headerSpacer: {
    width: 46,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },

  detailContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },

  singleCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  groupCard: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#DEDEDE",
  },

  rowTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "400",
    color: "#111111",
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  rowValue: {
    fontSize: 13,
    color: "#929292",
  },

  description: {
    marginTop: 13,
    marginBottom: 30,
    marginHorizontal: 24,
    fontSize: 12,
    lineHeight: 18,
    color: "#858585",
  },

  sectionTitle: {
    marginHorizontal: 24,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#858585",
  },

  unlockCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  switchRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },

  advancedTitle: {
    marginTop: 2,
  },

  emptyHistory: {
    padding: 16,
    gap: 8,
  },

  emptyHistoryTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
  },

  emptyHistoryText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#858585",
  },

  actionButton: {
    marginTop: 16,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
});
