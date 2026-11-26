
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  X,
} from "lucide-react-native";

type ParentalControlsScreenProps = {
  onBack: () => void;
};

export default function ParentalControlsScreen({
  onBack,
}: ParentalControlsScreenProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [memberName, setMemberName] = useState("");

  const handleInvite = () => {
    if (!memberName.trim() || !email.trim()) {
      Alert.alert(
        "Missing information",
        "Enter the family member's name and email address.",
      );
      return;
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!validEmail) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }

    Alert.alert(
      "Ready to connect",
      "The screen is ready for account-linking integration. No invitation has been sent yet.",
    );
  };

  return (
    <View style={styles.container}>
     <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <ArrowLeft size={27} color="#111111" strokeWidth={2.2} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Parental controls</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              Alert.alert(
                "Parental controls",
                "Link family accounts to manage supported safeguards and limits. Account linking and control settings need to be connected to a backend.",
              )
            }
            accessibilityLabel="Parental controls help"
            activeOpacity={0.7}
          >
            <CircleHelp size={25} color="#111111" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Parents and teens can link accounts, giving parents tools to adjust
            certain features, set limits, and add safeguards that work for their
            family.{" "}
            <Text
              style={styles.learnMore}
              onPress={() =>
                Alert.alert(
                  "Learn more",
                  "Family account linking can help parents and teens manage supported safety settings. ModelNow's actual parental-control policies and capabilities must be defined before this feature is launched.",
                )
              }
            >
              Learn more
            </Text>
          </Text>

          {!showAddMember ? (
            <TouchableOpacity
              style={styles.addMemberButton}
              onPress={() => setShowAddMember(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.addMemberText}>Add family member</Text>
              <ChevronRight size={24} color="#858585" strokeWidth={2.4} />
            </TouchableOpacity>
          ) : (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Add family member</Text>

                <TouchableOpacity
                  onPress={() => setShowAddMember(false)}
                  accessibilityLabel="Close form"
                >
                  <X size={23} color="#555555" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Family member's name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#999999"
                value={memberName}
                onChangeText={setMemberName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />

              <Text style={styles.note}>
                Account linking and invitations are not active yet.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleInvite}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddMember(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 88,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 19,
    fontWeight: "700",
    color: "#111111",
  },
  content: {
    paddingHorizontal: 27,
    paddingTop: 8,
    paddingBottom: 32,
  },
  description: {
    fontSize: 17,
    lineHeight: 29,
    color: "#858585",
    fontWeight: "500",
    marginBottom: 58,
  },
  learnMore: {
    color: "#2457C5",
    fontWeight: "600",
  },
  addMemberButton: {
    minHeight: 92,
    borderRadius: 48,
    borderWidth: 1.3,
    borderColor: "#E2E2E2",
    paddingHorizontal: 31,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  addMemberText: {
    fontSize: 18,
    color: "#111111",
    fontWeight: "500",
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 22,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },
  label: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111111",
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777777",
    marginBottom: 18,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cancelButton: {
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#444444",
    fontWeight: "500",
  },
});
