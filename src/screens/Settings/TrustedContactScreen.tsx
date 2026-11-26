
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from "react-native";
import { ArrowLeft, Plus, X, Pencil, Trash2 } from "lucide-react-native";

type TrustedContact = {
  name: string;
  phone: string;
  email: string;
};

type TrustedContactScreenProps = {
  onBack: () => void;
  onAddContact?: () => void;
};

export default function TrustedContactScreen({
  onBack,
}: TrustedContactScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState<TrustedContact | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const openForm = () => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone);
      setEmail(contact.email);
      setEditing(true);
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setEditing(false);
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(false);
  };

  const saveContact = () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      Alert.alert("Name required", "Enter the contact's name.");
      return;
    }

    if (!cleanPhone && !cleanEmail) {
      Alert.alert(
        "Contact details required",
        "Enter a phone number or email address.",
      );
      return;
    }

    if (
      cleanPhone &&
      !/^\+?[\d\s()-]{7,20}$/.test(cleanPhone)
    ) {
      Alert.alert(
        "Invalid phone number",
        "Please check the phone number.",
      );
      return;
    }

    if (
      cleanEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid email address.",
      );
      return;
    }

    setContact({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
    });

    closeForm();

    Alert.alert(
      editing ? "Contact updated" : "Contact saved",
      "The contact details are saved in the current screen.",
    );
  };

  const removeContact = () => {
    Alert.alert(
      "Remove trusted contact?",
      "This will remove the contact from this screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setContact(null);
            setName("");
            setPhone("");
            setEmail("");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
              hitSlop={8}
            >
              <ArrowLeft
                size={28}
                color="#111111"
                strokeWidth={2.2}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              Trusted contact
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Introduction */}
            <Text style={styles.description}>
              Having a trusted contact can make it easier to get
              support from someone who knows you well.
            </Text>

            {/* Safety information */}
            <Text style={styles.safetyText}>
              In the future, if you discuss suicide with modelnow 
              in a way that indicates a serious safety concern,
              we may automatically notify your trusted contact
              so they can check in with you. They must be 18+
              to participate.{" "}
              <Text
                style={styles.learnMore}
                onPress={() => {
                  Alert.alert(
                    "Trusted contact",
                    "Information about eligibility and notifications should be connected to the applicable service policy.",
                  );
                }}
              >
                Learn more
              </Text>
            </Text>

            {/* Saved contact */}
            {contact && !showForm && (
              <View style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.avatarText}>
                      {contact.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {contact.name}
                    </Text>

                    {!!contact.phone && (
                      <Text style={styles.contactDetail}>
                        {contact.phone}
                      </Text>
                    )}

                    {!!contact.email && (
                      <Text style={styles.contactDetail}>
                        {contact.email}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.contactActions}>
                  <Pressable
                    onPress={openForm}
                    style={styles.actionButton}
                    accessibilityRole="button"
                  >
                    <Pencil size={17} color="#315FC5" />
                    <Text style={styles.actionText}>Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={removeContact}
                    style={styles.actionButton}
                    accessibilityRole="button"
                  >
                    <Trash2 size={17} color="#C24141" />
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Add contact button */}
            {!showForm && !contact && (
              <Pressable
                onPress={openForm}
                accessibilityRole="button"
                accessibilityLabel="Add contact"
                style={({ pressed }) => [
                  styles.addContactButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.addContactText}>
                  Add contact
                </Text>

                <Plus
                  size={22}
                  color="#315FC5"
                  strokeWidth={2}
                />
              </Pressable>
            )}

            {/* Add/edit form on the same screen */}
            {showForm && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {editing ? "Edit contact" : "Add contact"}
                  </Text>

                  <Pressable
                    onPress={closeForm}
                    accessibilityRole="button"
                    accessibilityLabel="Close form"
                    hitSlop={8}
                  >
                    <X size={23} color="#555555" />
                  </Pressable>
                </View>

                <Text style={styles.formDescription}>
                  Enter the details of someone you trust.
                </Text>

                <Text style={styles.label}>Full name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor="#999999"
                  autoCapitalize="words"
                  returnKeyType="next"
                  style={styles.input}
                />

                <Text style={styles.label}>Phone number</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999999"
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  style={styles.input}
                />

                <Text style={styles.label}>Email address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="#999999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={styles.input}
                />

                <Text style={styles.formNote}>
                  Enter at least one contact method. Make sure
                  the person agrees to be your trusted contact.
                </Text>

                <Pressable
                  onPress={saveContact}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.saveButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.saveButtonText}>
                    {editing ? "Save changes" : "Save contact"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={closeForm}
                  accessibilityRole="button"
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  container: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
    marginLeft: 6,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
    color: "#777777",
    marginBottom: 22,
  },
  safetyText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
    color: "#777777",
    marginBottom: 32,
  },
  learnMore: {
    textDecorationLine: "underline",
    color: "#777777",
  },
  addContactButton: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 30,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  addContactText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#315FC5",
  },
  buttonPressed: {
    backgroundColor: "#F7F8FC",
    opacity: 0.85,
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#171717",
  },
  formDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777777",
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#171717",
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
  formNote: {
    fontSize: 12,
    lineHeight: 18,
    color: "#777777",
    marginTop: 2,
    marginBottom: 16,
  },
  saveButton: {
    minHeight: 46,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#315FC5",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#315FC5",
  },
  contactCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 14,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#315FC5",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 3,
  },
  contactDetail: {
    fontSize: 13,
    lineHeight: 18,
    color: "#777777",
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 18,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
  },
  actionText: {
    fontSize: 13,
    color: "#315FC5",
    fontWeight: "500",
  },
  removeText: {
    fontSize: 13,
    color: "#C24141",
    fontWeight: "500",
  },
});