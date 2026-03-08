import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../../constants/themes";
import { useAppContext } from "../../context/AppContext";
import { commonStyles } from "../../styles/commonStyles";
import { confirmAlert } from "../../utils/alertUtils";
import EmptyState from "../../components/common/EmptyState";
import ScreenHeader from "../../components/common/ScreenHeader";
import SearchBar from "../../components/common/SearchBar";
import UserCard from "../../components/admin/UserCard";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";
import { useToast } from "../../context/ToastContext";

export default function AdminUsersScreen() {
  const { state } = useAppContext();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);

  const syncUsers = useCallback(async () => {
    const list = await adminService.getUsers({ pageSize: 120 });
    // Normalize to the shape expected by UserCard
    setUsers(
      (list || []).map((u) => ({
        id: u.uid,
        nickname: u.nickname,
        email: u.email,
        avatar: u.avatar || "cat",
        isBanned: !!u.banned,
      }))
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await syncUsers();
        } catch {
          // ignore
        }
      })();
    }, [syncUsers])
  );

  const onRefresh = useCallback(() => {
    (async () => {
      try {
        setRefreshing(true);
        await syncUsers();
      } finally {
        setRefreshing(false);
      }
    })();
  }, [syncUsers]);

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

  const toggleBan = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const next = !user.isBanned;
    confirmAlert({
      title: next ? "Ban user?" : "Unban user?",
      message: `${next ? "Ban" : "Unban"} ${user.nickname}?`,
      confirmText: next ? "Ban" : "Unban",
      confirmStyle: next ? "destructive" : "default",
      onConfirm: () => {
        (async () => {
          try {
            if (next) await adminService.banUser({ userId });
            else await adminService.unbanUser({ userId });
            showToast(
              `${user.nickname} is now ${next ? "banned" : "active"}.`,
              { type: "success" }
            );
          } catch (e) {
            showToast(e?.message || "Could not update user status.", {
              type: "error",
            });
          } finally {
            await syncUsers();
          }
        })();
      },
    });
  }, [showToast, syncUsers, users]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        String(u.nickname || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.id || "").toLowerCase().includes(q)
      );
    });
  }, [query, users]);

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Users"
        onBack={router.back}
        rightIcon="log-out-outline"
        onRightPress={confirmLogout}
        rightAccessibilityLabel="Log out"
      />

      <View style={styles.top}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search users (nickname, email, id...)"
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <UserCard user={item} onToggleBan={() => toggleBan(item.id)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No users found"
            message="Try a different search."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: theme.spacing.md,
  },
});
