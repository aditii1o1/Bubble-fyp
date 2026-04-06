import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "../../constants/themes";
import { donationService } from "../../services/donationService";

function formatAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (Math.round(num) === num) return String(num);
  return num.toFixed(2);
}

function buildResultState(payload, fallback = {}) {
  const donation = payload?.donation || {};
  const amountValue = Number.isFinite(donation?.totalAmount)
    ? donation.totalAmount
    : donation?.amount;

  return {
    status: String(donation?.status || fallback.status || "").trim(),
    pidx: String(donation?.pidx || fallback.pidx || "").trim(),
    transactionId: String(donation?.transactionId || fallback.transactionId || "").trim(),
    donorName: String(donation?.donorName || fallback.donorName || "").trim(),
    amount: formatAmount(amountValue ?? fallback.amount),
    message: String(fallback.message || "").trim(),
  };
}

function isCancelledStatus(value) {
  return ["cancelled", "canceled", "user canceled", "user cancelled"].includes(value);
}

export default function DonateResultScreen() {
  const params = useLocalSearchParams();
  const verified = String(params.verified || "").trim().toLowerCase() === "true";
  const [result, setResult] = useState(() =>
    buildResultState(null, {
      status: params.status,
      pidx: params.pidx,
      transactionId: params.transactionId,
      donorName: params.donorName,
      amount: params.amount,
      message: params.message,
    })
  );
  const [isChecking, setIsChecking] = useState(false);

  const refreshVerification = useCallback(async () => {
    const pidx = String(params.pidx || "").trim();
    if (!pidx) return;

    try {
      setIsChecking(true);
      const payload = await donationService.verify({ pidx });
      setResult((prev) =>
        buildResultState(payload, {
          ...prev,
          pidx,
          message: prev.message,
        })
      );
    } catch (error) {
      setResult((prev) => ({
        ...prev,
        message:
          prev.message ||
          String(error?.response?.data?.message || error?.message || "").trim(),
      }));
    } finally {
      setIsChecking(false);
    }
  }, [params.pidx]);

  useEffect(() => {
    if (verified || !String(params.pidx || "").trim()) return;
    refreshVerification();
  }, [params.pidx, refreshVerification, verified]);

  const normalized = result.status.toLowerCase();
  const success = normalized === "completed" || normalized === "success";
  const pending = normalized === "pending" || normalized === "initiated";
  const cancelled = isCancelledStatus(normalized);

  const subtitle = useMemo(() => {
    if (result.message) return result.message;
    if (success) {
      return `Your donation${result.amount ? ` of NPR ${result.amount}` : ""} was verified successfully.`;
    }
    if (cancelled) {
      return "The payment was cancelled before completion.";
    }
    if (normalized === "refunded") {
      return "This donation was refunded by the payment provider.";
    }
    if (pending) {
      return "Bubble is still checking the latest Khalti status for this payment.";
    }
    return "The donation could not be completed. You can try again when you're ready.";
  }, [cancelled, normalized, pending, result.amount, result.message, success]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View
          style={[
            styles.iconCircle,
            success && styles.iconCircleSuccess,
            !success && !pending && styles.iconCircleError,
          ]}
        >
          {isChecking ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Ionicons
              name={success ? "checkmark" : pending ? "time-outline" : "close"}
              size={28}
              color={
                success
                  ? theme.colors.primary
                  : pending
                  ? theme.colors.text
                  : theme.colors.error
              }
            />
          )}
        </View>

        <Text style={styles.title}>
          {success
            ? "Thank you for your support!"
            : pending
            ? "Payment update received"
            : cancelled
            ? "Payment cancelled"
            : "Payment failed"}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {result.donorName ? <Text style={styles.meta}>Donor: {result.donorName}</Text> : null}
        {result.pidx ? <Text style={styles.meta}>PIDX: {result.pidx}</Text> : null}
        {result.transactionId ? (
          <Text style={styles.meta}>Transaction ID: {result.transactionId}</Text>
        ) : null}
        {result.status ? <Text style={styles.meta}>Status: {result.status}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/Home")}
        >
          <Text style={styles.primaryButtonText}>Back to Bubble</Text>
        </TouchableOpacity>

        {!success ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/donate")}
          >
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        ) : null}

        {result.pidx ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={refreshVerification}
            disabled={isChecking}
          >
            <Text style={styles.secondaryButtonText}>
              {isChecking ? "Checking..." : "Check Status"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgSoft,
    marginBottom: theme.spacing.lg,
  },
  iconCircleSuccess: {
    backgroundColor: theme.colors.accent,
  },
  iconCircleError: {
    backgroundColor: theme.colors.bgSoft,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal * 14,
    marginBottom: theme.spacing.md,
  },
  meta: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  primaryButtonText: {
    color: theme.colors.buttonText,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.bgWhite,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
  },
});
