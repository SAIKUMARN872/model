
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { Phone, ArrowLeft } from "lucide-react-native";

type LoginMode = "main" | "emailOtp" | "phone" | "phoneOtp";

type LoginProps = {
  onLoginSuccess?: () => void;
};

const TEST_OTP = "123456";

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<LoginMode>("main");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const isOtpMode = mode === "emailOtp" || mode === "phoneOtp";

  const heading = {
    main: "Welcome to ModelNow",
    emailOtp: "Check your email",
    phone: "Continue with phone",
    phoneOtp: "Verify your phone",
  }[mode];

  const subtitle = {
    main: "Log in or sign up for free",
    emailOtp: `Enter the verification code for ${email}.`,
    phone: "Enter your phone number to continue.",
    phoneOtp: `Enter the verification code for ${phone}.`,
  }[mode];

  const continueWithEmail = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setEmail(normalizedEmail);
    setOtp("");
    setMode("emailOtp");
  };

  const continueWithPhone = () => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10) {
      Alert.alert("Invalid phone number", "Please enter a valid phone number.");
      return;
    }

    setOtp("");
    setMode("phoneOtp");
  };

  const verifyOtp = () => {
    if (otp.trim().length !== 6) {
      Alert.alert("Invalid code", "Please enter the 6-digit test OTP.");
      return;
    }

    if (otp.trim() !== TEST_OTP) {
      Alert.alert(
        "Incorrect OTP",
        "For development testing, enter 123456."
      );
      return;
    }

    onLoginSuccess?.();
  };

  const backToLogin = () => {
    setOtp("");

    if (mode === "emailOtp") {
      setMode("main");
    } else if (mode === "phoneOtp") {
      setMode("phone");
    } else {
      setMode("main");
    }
  };

  const providerNotConnected = (provider: string) => {
    Alert.alert(
      `${provider} sign-in`,
      `${provider} authentication is not connected yet.`
    );
  };

  const renderOption = (
    label: string,
    onPress: () => void,
    icon: React.ReactNode
  ) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionButton,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.optionIcon}>{icon}</View>
      <Text style={styles.optionText}>{label}</Text>
      <View style={styles.iconBalance} />
    </Pressable>
  );

  return (
    <LinearGradient
      colors={["#B8E6FF", "#FFFFFF", "#E4F4FF"]}
      locations={[0, 0.52, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.brandSection}>
                <Image
                  source={require("../../assets/modelnow-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                  accessibilityLabel="ModelNow logo"
                />

                <Text style={styles.heading}>{heading}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              {mode === "main" && (
                <View style={styles.form}>
                  {renderOption(
                    "Continue with Google",
                    () => providerNotConnected("Google"),
                    <FontAwesome
                      name="google"
                      size={21}
                      color="#4285F4"
                    />
                  )}

                  {renderOption(
                    "Continue with Apple",
                    () => providerNotConnected("Apple"),
                    <FontAwesome
                      name="apple"
                      size={22}
                      color="#171717"
                    />
                  )}

                  {renderOption(
                    "Continue with phone",
                    () => setMode("phone"),
                    <Phone size={21} color="#252525" />
                  )}

                  <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>
                      OR CONTINUE WITH EMAIL
                    </Text>
                    <View style={styles.divider} />
                  </View>

                  <Text style={styles.fieldLabel}>Email</Text>

                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@company.com"
                    placeholderTextColor="#929292"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={continueWithEmail}
                    accessibilityLabel="Email address"
                  />

                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.primaryPressed,
                    ]}
                    onPress={continueWithEmail}
                  >
                    <Text style={styles.primaryButtonText}>
                      Continue with email
                    </Text>
                  </Pressable>
                </View>
              )}

              {mode === "phone" && (
                <View style={styles.form}>
                  <Text style={styles.fieldLabel}>Phone number</Text>

                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#929292"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={continueWithPhone}
                    accessibilityLabel="Phone number"
                  />

                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.primaryPressed,
                    ]}
                    onPress={continueWithPhone}
                  >
                    <Text style={styles.primaryButtonText}>
                      Continue with phone
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={backToLogin}
                    style={styles.backButton}
                  >
                    <ArrowLeft size={17} color="#333333" />
                    <Text style={styles.backText}>Back</Text>
                  </Pressable>
                </View>
              )}

              {isOtpMode && (
                <View style={styles.form}>
                  <Text style={styles.fieldLabel}>Verification code</Text>

                  <TextInput
                    value={otp}
                    onChangeText={(value) =>
                      setOtp(value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#929292"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={6}
                    style={styles.input}
                    accessibilityLabel="Verification code"
                  />

                  <View style={styles.testOtpNotice}>
                    <Text style={styles.testOtpTitle}>
                      Development testing code
                    </Text>
                    <Text style={styles.testOtpCode}>{TEST_OTP}</Text>
                    <Text style={styles.testOtpDescription}>
                      This is a fixed test code. No email or SMS is sent.
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.primaryPressed,
                    ]}
                    onPress={verifyOtp}
                  >
                    <Text style={styles.primaryButtonText}>
                      Verify and continue
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={backToLogin}
                    style={styles.backButton}
                  >
                    <ArrowLeft size={17} color="#333333" />
                    <Text style={styles.backText}>Back</Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.securityRow}>
                <View style={styles.securityIcon}>
                  <Text style={styles.lockSymbol}>▣</Text>
                </View>
                <Text style={styles.securityText}>
                  Secure access to your workspace
                </Text>
              </View>

              <View style={styles.footer}>
                <Text style={styles.legal}>
                  By continuing, you agree to ModelNow's applicable
                </Text>

                <View style={styles.legalRow}>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Terms of Service",
                        "Add your terms page here."
                      )
                    }
                  >
                    <Text style={styles.legalLink}>Terms of Service</Text>
                  </Pressable>

                  <Text style={styles.legal}> and </Text>

                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Privacy Policy",
                        "Add your privacy page here."
                      )
                    }
                  >
                    <Text style={styles.legalLink}>Privacy Policy</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 510,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 110,
    height: 65,
    marginBottom: 15,
  },
  heading: {
    color: "#171717",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#737373",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
  form: {
    width: "100%",
    gap: 12,
  },
  optionButton: {
    minHeight: 51,
    borderWidth: 1,
    borderColor: "#D5E2ED",
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  optionIcon: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBalance: {
    width: 30,
  },
  optionText: {
    flex: 1,
    color: "#242424",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: {
    backgroundColor: "#F0F8FF",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D7E5F0",
  },
  dividerText: {
    color: "#5D8FD9",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  fieldLabel: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: -3,
  },
  input: {
    width: "100%",
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D5E2ED",
    borderRadius: 9,
    paddingHorizontal: 15,
    color: "#171717",
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    minHeight: 53,
    borderRadius: 9,
    backgroundColor: "#0878E8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  primaryPressed: {
    backgroundColor: "#0567C8",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  testOtpNotice: {
    backgroundColor: "#F4F8FF",
    borderWidth: 1,
    borderColor: "#DCE8FF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    gap: 5,
  },
  testOtpTitle: {
    color: "#454F62",
    fontSize: 12,
    fontWeight: "600",
  },
  testOtpCode: {
    color: "#0878E8",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 5,
  },
  testOtpDescription: {
    color: "#687386",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
  },
  backButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: 12,
  },
  backText: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "600",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 25,
  },
  securityIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  lockSymbol: {
    color: "#687C9D",
    fontSize: 14,
  },
  securityText: {
    color: "#687C9D",
    fontSize: 11,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  legal: {
    color: "#687C9D",
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  legalLink: {
    color: "#4E6383",
    fontSize: 10,
    textDecorationLine: "underline",
  },
});
