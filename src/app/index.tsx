import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
import {
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

type AuthMode = "login" | "signup";
type FieldName = "name" | "email" | "password" | "confirmPassword";
type Errors = Partial<Record<FieldName, string>>;

const COLORS = {
  ink: "#17142B",
  muted: "#6F6A82",
  primary: "#6754D9",
  primaryDark: "#5140C2",
  lavender: "#EEEAFE",
  surface: "#FFFFFF",
  background: "#F7F5FC",
  line: "#E4E0ED",
  error: "#C63E55",
  success: "#287A5E",
};

export default function AuthScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  const copy = useMemo(
    () =>
      mode === "login"
        ? {
            eyebrow: "GOOD TO SEE YOU",
            title: "Welcome back",
            subtitle: "Sign in to pick up right where you left off.",
            button: "Sign in",
          }
        : {
            eyebrow: "YOUR NEXT CHAPTER",
            title: "Create your account",
            subtitle: "A few details and your space is ready.",
            button: "Create account",
          },
    [mode],
  );

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrors({});
    setMessage("");
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function clearError(field: FieldName) {
    if (!errors[field]) return;
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function revealField(y: number) {
    scrollRef.current?.scrollTo({ y, animated: true });
    setTimeout(() => scrollRef.current?.scrollTo({ y, animated: true }), 300);
  }

  function validate() {
    const nextErrors: Errors = {};
    const trimmedEmail = email.trim();

    if (mode === "signup" && name.trim().length < 2) {
      nextErrors.name = "Enter your full name.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    } else if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (mode === "signup" && confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length === 0) {
      setMessage(
        mode === "login"
          ? "Your sign-in form is ready to connect."
          : "Your account form is ready to connect.",
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark} accessibilityElementsHidden>
                <View style={styles.brandDot} />
                <View style={styles.brandBar} />
              </View>
              <Text style={styles.brandName}>Luma</Text>
            </View>

            <View style={styles.hero}>
              <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
              <Text style={styles.title}>{copy.title}</Text>
              <Text style={styles.subtitle}>{copy.subtitle}</Text>
            </View>

            <View style={styles.formCard}>
              <View
                accessibilityLabel="Choose an authentication option"
                style={styles.segmentedControl}
              >
                <ModeButton
                  active={mode === "login"}
                  label="Sign in"
                  onPress={() => changeMode("login")}
                />
                <ModeButton
                  active={mode === "signup"}
                  label="Create account"
                  onPress={() => changeMode("signup")}
                />
              </View>

              {mode === "signup" ? (
                <Field
                  autoComplete="name"
                  error={errors.name}
                  label="Full name"
                  onChangeText={(value) => {
                    setName(value);
                    clearError("name");
                  }}
                  placeholder="Alex Morgan"
                  value={name}
                />
              ) : null}

              <Field
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                keyboardType="email-address"
                label="Email address"
                onChangeText={(value) => {
                  setEmail(value);
                  clearError("email");
                }}
                placeholder="you@example.com"
                value={email}
              />

              <Field
                autoCapitalize="none"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                error={errors.password}
                label="Password"
                onChangeText={(value) => {
                  setPassword(value);
                  clearError("password");
                }}
                onFocus={() => revealField(mode === "signup" ? 480 : 220)}
                onSubmitEditing={mode === "login" ? validate : undefined}
                placeholder="At least 8 characters"
                returnKeyType={mode === "login" ? "done" : "next"}
                secureTextEntry={!showPassword}
                value={password}
                trailing={
                  <Pressable
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => setShowPassword((current) => !current)}
                  >
                    <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                }
              />

              {mode === "signup" ? (
                <Field
                  autoCapitalize="none"
                  autoComplete="new-password"
                  error={errors.confirmPassword}
                  label="Confirm password"
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    clearError("confirmPassword");
                  }}
                  onFocus={() => revealField(720)}
                  onSubmitEditing={validate}
                  placeholder="Repeat your password"
                  returnKeyType="done"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setMessage("Password recovery is ready to connect.")}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              )}

              {message ? (
                <View accessibilityLiveRegion="polite" style={styles.messageBox}>
                  <View style={styles.messageDot} />
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={validate}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>{copy.button}</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </Pressable>

              <Text style={styles.termsText}>
                By continuing, you agree to our{" "}
                <Text style={styles.termsLink}>Terms</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type ModeButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

function ModeButton({ active, label, onPress }: ModeButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active && styles.modeButtonActive,
        pressed && styles.modeButtonPressed,
      ]}
    >
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & {
  error?: string;
  label: string;
  trailing?: React.ReactNode;
};

function Field({ error, label, trailing, style, ...inputProps }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="#A39EAF"
          selectionColor={COLORS.primary}
          style={[styles.input, style]}
          {...inputProps}
        />
        {trailing}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  page: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }],
  },
  brandDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D8D1FF",
  },
  brandBar: {
    width: 15,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "40deg" }],
  },
  brandName: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  hero: { marginTop: 44, marginBottom: 28 },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1.4,
    lineHeight: 43,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    maxWidth: 350,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EEEBF3",
    shadowColor: "#302663",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.lavender,
    padding: 4,
    borderRadius: 16,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  modeButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: "#3E326F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  modeButtonPressed: { opacity: 0.75 },
  modeButtonText: { color: COLORS.muted, fontSize: 14, fontWeight: "700" },
  modeButtonTextActive: { color: COLORS.ink },
  fieldGroup: { marginBottom: 17 },
  label: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputShell: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 15,
    backgroundColor: "#FBFAFD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  inputShellError: { borderColor: COLORS.error, backgroundColor: "#FFF8F9" },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingVertical: 0,
    color: COLORS.ink,
    fontSize: 16,
  },
  showText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
    paddingLeft: 12,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  forgotButton: {
    alignSelf: "flex-end",
    minHeight: 38,
    justifyContent: "center",
    marginTop: -7,
    marginBottom: 8,
  },
  forgotText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#ECF8F3",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 14,
  },
  messageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  messageText: {
    flex: 1,
    color: COLORS.success,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 19,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  buttonArrow: { color: "#FFFFFF", fontSize: 20, lineHeight: 22 },
  termsText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 18,
    paddingHorizontal: 8,
  },
  termsLink: { color: COLORS.ink, fontWeight: "700" },
});
