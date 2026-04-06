import React, { useRef, useState } from "react";
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
import { WebView } from "react-native-webview";
import { theme } from "../../constants/themes";

function getParamValue(value) {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}

function normalizeUrlBase(value) {
  return String(value || "")
    .trim()
    .split("?")[0]
    .replace(/\/+$/, "")
    .toLowerCase();
}

function paisaToNprString(value) {
  const amountPaisa = Number(String(value || "").trim());
  if (!Number.isFinite(amountPaisa)) return "";

  const amountNpr = amountPaisa / 100;
  return Number.isInteger(amountNpr) ? String(amountNpr) : amountNpr.toFixed(2);
}

function readCallbackParams(url) {
  try {
    const parsed = new URL(url);
    return {
      pidx: String(parsed.searchParams.get("pidx") || "").trim(),
      status: String(parsed.searchParams.get("status") || "").trim(),
      transactionId: String(
        parsed.searchParams.get("transaction_id") || parsed.searchParams.get("tidx") || ""
      ).trim(),
      amount: paisaToNprString(
        parsed.searchParams.get("total_amount") || parsed.searchParams.get("amount") || ""
      ),
    };
  } catch {
    return {
      pidx: "",
      status: "",
      transactionId: "",
      amount: "",
    };
  }
}

export default function DonateCheckoutScreen() {
  const params = useLocalSearchParams();
  const paymentUrl = getParamValue(params.paymentUrl);
  const returnUrl = getParamValue(params.returnUrl);
  const fallbackPidx = getParamValue(params.pidx);
  const donorName = getParamValue(params.donorName);
  const fallbackAmount = getParamValue(params.amount);

  const handledCallbackRef = useRef(false);
  const [loadError, setLoadError] = useState("");
  const [webViewKey, setWebViewKey] = useState(0);

  const invalidCheckout = !paymentUrl || !fallbackPidx;

  const routeToResult = (payload = {}) => {
    router.replace({
      pathname: "/donate/result",
      params: {
        pidx: payload.pidx || fallbackPidx,
        status: payload.status || "",
        transactionId: payload.transactionId || "",
        donorName,
        amount: payload.amount || fallbackAmount,
        verified: "false",
        message: payload.message || "",
      },
    });
  };

  const handleCloseCheckout = () => {
    routeToResult({
      status: "Cancelled",
      message: "Khalti checkout was closed before Bubble received the final callback.",
    });
  };

  const isReturnCallbackUrl = (url) => {
    const candidateBase = normalizeUrlBase(url);
    if (!candidateBase) return false;

    const expectedBase = normalizeUrlBase(returnUrl);
    if (expectedBase) return candidateBase === expectedBase;

    return candidateBase.endsWith("/payment/callback");
  };

  const handlePossibleCallbackUrl = (url) => {
    if (handledCallbackRef.current || !isReturnCallbackUrl(url)) {
      return false;
    }

    handledCallbackRef.current = true;
    const callbackParams = readCallbackParams(url);
    routeToResult({
      pidx: callbackParams.pidx || fallbackPidx,
      status: callbackParams.status || "Pending",
      transactionId: callbackParams.transactionId,
      amount: callbackParams.amount || fallbackAmount,
    });
    return true;
  };

  if (invalidCheckout) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Checkout is unavailable</Text>
          <Text style={styles.errorText}>
            Bubble could not open the Khalti payment page because the checkout details were
            incomplete.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/donate")}>
            <Text style={styles.primaryButtonText}>Back to Donate</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Khalti checkout did not load</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              handledCallbackRef.current = false;
              setLoadError("");
              setWebViewKey((current) => current + 1);
            }}
          >
            <Text style={styles.primaryButtonText}>Reload Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleCloseCheckout}>
            <Text style={styles.secondaryButtonText}>Close Checkout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCloseCheckout}>
          <Ionicons name="close" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khalti Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Bubble will verify the payment with Khalti after checkout returns to the app.
        </Text>
      </View>

      <View style={styles.webviewWrap}>
        <WebView
          key={webViewKey}
          source={{ uri: paymentUrl }}
          originWhitelist={["*"]}
          javaScriptEnabled
          javaScriptCanOpenWindowsAutomatically
          domStorageEnabled
          mixedContentMode="compatibility"
          setSupportMultipleWindows={false}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
              <Text style={styles.loaderText}>Opening Khalti securely...</Text>
            </View>
          )}
          onShouldStartLoadWithRequest={(request) => !handlePossibleCallbackUrl(request.url)}
          onNavigationStateChange={(navState) => {
            handlePossibleCallbackUrl(navState.url);
          }}
          onError={(event) => {
            const message =
              String(event?.nativeEvent?.description || "").trim() ||
              "Bubble could not load the Khalti payment page.";
            setLoadError(message);
          }}
          onHttpError={(event) => {
            setLoadError(
              `Khalti checkout returned HTTP ${event?.nativeEvent?.statusCode || "error"}.`
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  headerButton: {
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
  notice: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noticeText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    lineHeight: theme.typography.lineHeight.normal * 12,
  },
  webviewWrap: {
    flex: 1,
    overflow: "hidden",
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgWhite,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgWhite,
  },
  loaderText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  errorTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.muted,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal * 14,
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  primaryButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
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
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
