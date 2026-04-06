import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../../constants/themes";
import { useAppContext } from "../../context/AppContext";
import { donationService } from "../../services/donationService";
import { useToast } from "../../context/ToastContext";
import { DONATION_CONFIG } from "../../config/donations";

const PRESET_AMOUNTS = DONATION_CONFIG.presetAmounts || [50, 100, 250, 500];
const MIN_AMOUNT = DONATION_CONFIG.minAmount || 10;
const IS_WEB = Platform.OS === "web";

function extractErrorMessage(error) {
  return (
    String(error?.response?.data?.message || "").trim() ||
    String(error?.message || "").trim() ||
    "Could not complete the Khalti payment."
  );
}

function fallbackStatusFromError(error) {
  const message = extractErrorMessage(error).toLowerCase();
  if (message.includes("cancel")) return "Cancelled";
  return "Failed";
}

function buildResultParams(payload, fallback = {}) {
  const donation = payload?.donation || {};
  const amountValue = Number.isFinite(donation?.totalAmount)
    ? donation.totalAmount
    : donation?.amount;

  return {
    pidx: donation?.pidx || fallback.pidx || "",
    status: donation?.status || fallback.status || "",
    amount: Number.isFinite(amountValue) ? String(amountValue) : "",
    transactionId: donation?.transactionId || "",
    donorName: donation?.donorName || fallback.donorName || "",
    verified: payload?.donation ? "true" : fallback.verified || "false",
    message: fallback.message || "",
  };
}

export default function DonateScreen() {
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState(
    String(state.profile?.nickname || "")
      .trim()
      .replace(/^@/, "")
  );
  const [isLoading, setIsLoading] = useState(false);

  const email = String(state.user?.email || "").trim();
  const amountValue = useMemo(() => {
    const digits = amount.replace(/[^\d]/g, "");
    if (!digits) return null;
    return Number(digits);
  }, [amount]);
  const amountIsValid = amountValue !== null && amountValue >= MIN_AMOUNT;
  const emailIsValid = email.includes("@");
  const donorName = name.trim();
  const nameIsValid = donorName.length >= 2;
  const checkoutEnabled = !IS_WEB && !isLoading && amountIsValid && nameIsValid && emailIsValid;

  const handleDonate = async () => {
    if (IS_WEB) {
      showToast("Khalti checkout is only available on Android or iOS.", {
        type: "error",
      });
      return;
    }
    if (!amountIsValid) {
      showToast(`Minimum donation is NPR ${MIN_AMOUNT}.`, { type: "error" });
      return;
    }
    if (!nameIsValid) {
      showToast("Please enter your full name.", { type: "error" });
      return;
    }
    if (!emailIsValid) {
      showToast("Please sign in with a valid email.", { type: "error" });
      return;
    }

    setIsLoading(true);
    let createdPidx = "";

    try {
      const data = await donationService.initiate({
        amount: amountValue,
        name: donorName,
        email,
      });
      createdPidx = String(data?.pidx || "").trim();
      if (!createdPidx) throw new Error("Khalti did not return a payment id.");
      const paymentUrl = String(data?.paymentUrl || data?.payment_url || "").trim();
      if (!paymentUrl) throw new Error("Khalti did not return a payment URL.");

      router.push({
        pathname: "/donate/checkout",
        params: {
          pidx: createdPidx,
          paymentUrl,
          returnUrl: String(data?.returnUrl || data?.return_url || "").trim(),
          donorName,
          amount: String(amountValue || ""),
        },
      });
    } catch (e) {
      if (createdPidx) {
        try {
          const verification = await donationService.verify({ pidx: createdPidx });
          router.replace({
            pathname: "/donate/result",
            params: buildResultParams(verification, {
              pidx: createdPidx,
              donorName,
              message: extractErrorMessage(e),
            }),
          });
          return;
        } catch {
          router.replace({
            pathname: "/donate/result",
            params: {
              pidx: createdPidx,
              status: fallbackStatusFromError(e),
              verified: "false",
              donorName,
              message: extractErrorMessage(e),
            },
          });
          return;
        }
      }

      showToast(extractErrorMessage(e), { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support Bubble</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.subtitle}>
            Bubble is free and ad-free. Your donation keeps the community alive.
          </Text>

          <View style={styles.notice}>
            <View style={styles.khaltiRow}>
              <View style={styles.khaltiChip}>
                <Text style={styles.khaltiText}>Pay via Khalti</Text>
              </View>
            </View>
            <Text style={styles.noticeText}>
              {IS_WEB
                ? "Open this screen on Android or iOS. Khalti checkout is not available in Bubble's web app."
                : "Bubble opens Khalti's official payment page inside the app and verifies the result with the backend before confirming your donation."}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Choose amount</Text>
          <View style={styles.presetRow}>
            {PRESET_AMOUNTS.map((preset) => {
              const isActive = amount === String(preset);
              return (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => setAmount(String(preset))}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isActive && styles.presetTextActive,
                    ]}
                  >
                    NPR {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Custom amount (NPR)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder={`Minimum NPR ${MIN_AMOUNT}`}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          {!amountIsValid && amountValue !== null ? (
            <Text style={styles.inputError}>Minimum donation is NPR {MIN_AMOUNT}.</Text>
          ) : null}

          <Text style={styles.sectionLabel}>Payer details</Text>
          <Text style={styles.inputLabel}>Full name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          {!nameIsValid && name.length > 0 ? (
            <Text style={styles.inputError}>Please enter your full name.</Text>
          ) : null}

          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyText}>{email || "Unknown email"}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.payButton,
              !checkoutEnabled && styles.payButtonDisabled,
            ]}
            onPress={handleDonate}
            disabled={!checkoutEnabled}
          >
            {isLoading ? (
              <View style={styles.payButtonRow}>
                <ActivityIndicator color={theme.colors.buttonText} size="small" />
                <Text style={[styles.payButtonText, styles.payButtonTextSpaced]}>
                  Preparing checkout...
                </Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>Continue to Khalti</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            Bubble verifies every payment with the backend before marking your donation as completed.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgSoft,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 36,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
    lineHeight: theme.typography.lineHeight.normal * 14,
    marginBottom: theme.spacing.lg,
  },
  notice: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noticeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.lineHeight.normal * 12,
  },
  khaltiRow: {
    marginBottom: theme.spacing.sm,
  },
  khaltiChip: {
    alignSelf: "flex-start",
    backgroundColor: "#5C2D91",
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  khaltiText: {
    color: "#FFFFFF",
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.md,
  },
  presetChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.bgWhite,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  presetChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.accent,
  },
  presetText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
  },
  presetTextActive: {
    color: theme.colors.primary,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.bgWhite,
    marginBottom: theme.spacing.md,
  },
  readonlyField: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.bgSoft,
    marginBottom: theme.spacing.md,
  },
  readonlyText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
  },
  inputError: {
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.error,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  payButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.buttonText,
  },
  payButtonTextSpaced: {
    marginLeft: theme.spacing.sm,
  },
  note: {
    marginTop: theme.spacing.md,
    textAlign: "center",
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
    lineHeight: theme.typography.lineHeight.normal * 12,
  },
});
