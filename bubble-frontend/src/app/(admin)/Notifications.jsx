import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import ScreenHeader from "../../components/common/ScreenHeader";
import { useToast } from "../../context/ToastContext";
import { confirmAlert } from "../../utils/alertUtils";
import { broadcastService } from "../../services/broadcastService";
import { adminService } from "../../services/adminService";
import { useAppContext } from "../../context/AppContext";
import { moderationService } from "../../services/moderationService";

function formatDateTime(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default function AdminNotificationsScreen() {
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(() => {
    (async () => {
      try {
        setIsLoadingHistory(true);
        const list = await broadcastService.getBroadcasts({ pageSize: 25 });
        setHistory(Array.isArray(list) ? list : []);
      } catch (e) {
        showToast(e?.message || "Could not load history.", { type: "error" });
      } finally {
        setIsLoadingHistory(false);
      }
    })();
  }, [showToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const send = useCallback(() => {
    const t = String(title || "").trim();
    const m = String(message || "").trim();
    if (!m) {
      showToast("Write a message first.", { type: "error" });
      return;
    }

    (async () => {
      const check = await moderationService.checkText(`${t} ${m}`);
      if (!check.ok) {
        showToast(`This word is blocked: "${check.word}"`, { type: "error" });
        return;
      }

      confirmAlert({
        title: "Send notification?",
        message: "This will add an in-app notification for all users.",
        confirmText: "Send",
        onConfirm: () => {
          (async () => {
            try {
              setIsSending(true);
              const users = await adminService.getUsers({ pageSize: 300 });
              await broadcastService.sendBroadcastToUsers({
                title: t || "Announcement",
                message: m,
                users,
                createdByUid: state.user?.uid,
                createdByEmail: state.user?.email,
              });
              setTitle("");
              setMessage("");
              showToast("Notification sent.", { type: "success" });
              loadHistory();
            } catch (e) {
              showToast(
                e?.message ||
                  "Could not send (check Firestore rules for /broadcasts and /users/*/notifications).",
                { type: "error" }
              );
            } finally {
              setIsSending(false);
            }
          })();
        },
      });
    })();
  }, [loadHistory, message, showToast, state.user?.email, state.user?.uid, title]);

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader title="Send Notifications" onBack={router.back} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Broadcast (In‑App)</Text>
          <Text style={styles.helper}>
            These are in-app notifications (not device push notifications).
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title (optional)"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write your announcement here..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={[styles.textArea, { minHeight: 90 }]}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, isSending && styles.btnDisabled]}
            onPress={send}
            disabled={isSending}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {isSending ? "Sending..." : "Send Notification"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>History</Text>
            <TouchableOpacity
              onPress={loadHistory}
              disabled={isLoadingHistory}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionText, isLoadingHistory && styles.disabledText]}>
                {isLoadingHistory ? "Refreshing..." : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helper}>Previous messages sent by admins.</Text>

          {history.length ? (
            <View style={styles.list}>
              {history.map((b) => (
                <View key={b.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{b.title}</Text>
                  <Text style={styles.cardMessage}>{b.message}</Text>
                  <Text style={styles.cardMeta}>
                    {formatDateTime(b.createdAt)}
                    {b.createdByEmail ? ` • ${b.createdByEmail}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helper}>No notifications sent yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  helper: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textArea: {
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    minHeight: 140,
    textAlignVertical: "top",
  },
  primaryBtn: {
    marginTop: theme.spacing.md,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryPink,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.md,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
  disabledText: {
    opacity: 0.6,
  },
  list: {
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  cardMessage: {
    marginTop: 6,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
