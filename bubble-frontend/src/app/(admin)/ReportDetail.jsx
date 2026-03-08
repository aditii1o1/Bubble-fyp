import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "../../constants/themes";
import { useAppContext } from "../../context/AppContext";
import { commonStyles } from "../../styles/commonStyles";
import { confirmAlert } from "../../utils/alertUtils";
import EmptyState from "../../components/common/EmptyState";
import ScreenHeader from "../../components/common/ScreenHeader";
import ReportInfoCard from "../../components/admin/reportDetail/ReportInfoCard";
import ReportPeopleCard from "../../components/admin/reportDetail/ReportPeopleCard";
import ReportContentCard from "../../components/admin/reportDetail/ReportContentCard";
import ReportActions from "../../components/admin/reportDetail/ReportActions";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { commentService } from "../../services/commentService";
import { useToast } from "../../context/ToastContext";

export default function AdminReportDetailScreen() {
  const { reportId } = useLocalSearchParams();
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [report, setReport] = useState(null);
  const [reporter, setReporter] = useState(null);
  const [reportedUser, setReportedUser] = useState(null);

  const refresh = useCallback(async () => {
    if (!reportId) return;

    const r = await adminService.getReportById(String(reportId));
    setReport(r);

    if (r?.reporterId) {
      const u = await userService.getUserProfile(r.reporterId);
      setReporter(u ? { ...u, id: u.uid, isBanned: !!u.banned } : null);
    } else {
      setReporter(null);
    }

    if (r?.reportedUserId) {
      const u = await userService.getUserProfile(r.reportedUserId);
      setReportedUser(u ? { ...u, id: u.uid, isBanned: !!u.banned } : null);
    } else {
      setReportedUser(null);
    }
  }, [reportId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await refresh();
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);

  const target = useMemo(() => {
    if (!report) return null;
    return { text: report.targetText };
  }, [report]);

  const confirmLogout = useCallback(() => {
    confirmAlert({
      title: "Log out",
      message: "Are you sure you want to log out of admin?",
      confirmText: "Log out",
      confirmStyle: "destructive",
      onConfirm: () => {
        (async () => {
          try {
            await authService.logout();
          } finally {
            router.replace("/(auth)/Login");
          }
        })();
      },
    });
  }, []);

  const onResolve = useCallback(() => {
    if (!report) return;
    confirmAlert({
      title: "Mark resolved?",
      message: "Mark this report as resolved?",
      confirmText: "Resolve",
      onConfirm: () => {
        (async () => {
          try {
            await adminService.resolveReport({ reportId: report.id, actionTaken: "resolved" });
            await refresh();
            showToast("Report marked as resolved.", { type: "success" });
          } catch (e) {
            showToast(e?.message || "Something went wrong", { type: "error" });
          }
        })();
      },
    });
  }, [refresh, report, showToast]);

  const onDeleteContent = useCallback(() => {
    if (!report) return;

    const contentLabel = report.targetType === "post" ? "post" : "comment";
    confirmAlert({
      title: `Delete ${contentLabel}?`,
      message: "This deletes the content and marks the report as deleted.",
      confirmText: "Delete",
      confirmStyle: "destructive",
      onConfirm: () => {
        (async () => {
          try {
            if (report.targetType === "post") {
              await postService.deletePost(report.targetId);
            } else {
              await commentService.deleteComment({
                postId: report.targetPostId,
                commentId: report.targetId,
              });
            }
            await adminService.markReportDeleted({ reportId: report.id, actionTaken: "deleted" });
            await refresh();
            showToast(`Deleted ${contentLabel}.`, { type: "success" });
          } catch (e) {
            showToast(e?.message || "Something went wrong", { type: "error" });
          }
        })();
      },
    });
  }, [refresh, report, showToast]);

  const onToggleBan = useCallback(() => {
    if (!reportedUser) return;
    const next = !reportedUser.isBanned;
    confirmAlert({
      title: next ? "Ban user?" : "Unban user?",
      message: `${next ? "Ban" : "Unban"} ${reportedUser.nickname}?`,
      confirmText: next ? "Ban" : "Unban",
      confirmStyle: next ? "destructive" : "default",
      onConfirm: () => {
        (async () => {
          try {
            if (next) await adminService.banUser({ userId: reportedUser.id });
            else await adminService.unbanUser({ userId: reportedUser.id });
            await refresh();
            showToast(
              `${reportedUser.nickname} is now ${next ? "banned" : "active"}.`,
              { type: "success" }
            );
          } catch (e) {
            showToast(e?.message || "Something went wrong", { type: "error" });
          }
        })();
      },
    });
  }, [refresh, reportedUser, showToast]);

  if (!report) {
    return (
      <SafeAreaView style={commonStyles.screen}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader
          title="Report"
          onBack={router.back}
          rightIcon="log-out-outline"
          onRightPress={confirmLogout}
          rightAccessibilityLabel="Log out"
        />
        <EmptyState
          icon="alert-circle-outline"
          title="Report not found"
          message="It may have been deleted."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Report Detail"
        onBack={router.back}
        rightIcon="log-out-outline"
        onRightPress={confirmLogout}
        rightAccessibilityLabel="Log out"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ReportInfoCard report={report} />
        </View>
        <View style={styles.section}>
          <ReportPeopleCard
            report={report}
            reporter={reporter}
            reportedUser={reportedUser}
          />
        </View>
        <View style={styles.section}>
          <ReportContentCard report={report} target={target} />
        </View>
        <View>
          <ReportActions
            onResolve={onResolve}
            onToggleBan={onToggleBan}
            banLabel={reportedUser?.isBanned ? "Unban User" : "Ban User"}
            banDisabled={!reportedUser}
            onDeleteContent={onDeleteContent}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
});
