import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import DonationBanner from "../components/feed/DonationBanner";
import AvatarPicker from "../components/feed/AvatarPicker";
import ReportModal from "../components/feed/ReportModal";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePostsTab from "../components/profile/ProfilePostsTab";
import ProfileRepostsTab from "../components/profile/ProfileRepostsTab";
import ProfileSettingsSection from "../components/profile/ProfileSettingsSection";
import SegmentedTabs from "../components/common/SegmentedTabs";
import { appActions, useAppContext } from "../context/AppContext";
import { confirmAlert } from "../utils/alertUtils";
import { styles } from "./ProfileScreen.styles";
import { userService } from "../services/userService";
import { cacheService } from "../services/cacheService";
import { repostService } from "../services/repostService";
import { postService } from "../services/postService";
import { authService } from "../services/authService";
import { useToast } from "../context/ToastContext";

export default function ProfileScreen() {
  const { state, dispatch } = useAppContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  const email = String(state.user?.email || "").trim().toLowerCase();
  const uid = String(state.user?.uid || "").trim();
  const nickname =
    state.profile.nickname || "@anonymous";
  const avatar = state.profile.avatar || "cat";
  const avatarUrl = state.profile.avatarUrl || null;
  const bio = state.profile.bio;
  const joinedDate = state.profile.joinedDate;

  const userBubbles = useMemo(() => {
    if (!uid) return [];
    const primary = userPosts.length
      ? userPosts
      : (state.posts || []).filter((p) => p.userId === uid);

    // Prefer the in-memory copy (it updates instantly for reactions/comments).
    return primary.map((p) => {
      const live = (state.posts || []).find((x) => x.id === p.id);
      return live || p;
    });
  }, [state.posts, uid, userPosts]);

  const reposts = useMemo(() => {
    if (!uid) return [];
    return state.reposts.filter((r) => r.userId === uid);
  }, [uid, state.reposts]);

  const totalReactions = useMemo(() => {
    return userBubbles.reduce((sum, bubble) => {
      const reactions = bubble.reactions || {};
      return sum + Object.values(reactions).reduce((a, b) => a + b, 0);
    }, 0);
  }, [userBubbles]);

  const stats = useMemo(
    () => [
      { label: "Posts", value: userBubbles.length },
      { label: "Reactions", value: totalReactions },
    ],
    [totalReactions, userBubbles.length]
  );

  const syncProfileData = useCallback(async () => {
    if (!uid) return;
    const [posts, repostsList] = await Promise.all([
      postService.getUserPosts(uid, { pageSize: 20 }),
      repostService.getUserReposts(uid, { pageSize: 20 }),
    ]);
    setUserPosts(Array.isArray(posts) ? posts : []);
    dispatch(appActions.setReposts(Array.isArray(repostsList) ? repostsList : []));
  }, [dispatch, uid]);

  const onRefresh = useCallback(() => {
    (async () => {
      try {
        setRefreshing(true);
        await syncProfileData();
      } finally {
        setRefreshing(false);
      }
    })();
  }, [syncProfileData]);

  React.useEffect(() => {
    (async () => {
      try {
        await syncProfileData();
      } catch {
        // ignore
      }
    })();
  }, [syncProfileData]);

  const handleAvatarSelect = (avatarKey) => {
    dispatch(appActions.setAvatar(avatarKey));
    (async () => {
      try {
        await userService.updateProfile({ avatar: avatarKey, avatarUrl: null });
        await cacheService.saveUser({
          ...state.profile,
          uid: state.user?.uid,
          email,
          role: state.role,
          avatar: avatarKey,
          avatarUrl: null,
        });
      } catch (e) {
        showToast("Could not update avatar. Please try again.", { type: "error" });
      }
    })();
    setShowAvatarPicker(false);
  };

	  const handleDeleteBubble = (bubbleId) => {
	    confirmAlert({
	      title: "Delete Bubble",
	      message: "Are you sure you want to delete this bubble?",
	      confirmText: "Delete",
	      confirmStyle: "destructive",
	      onConfirm: () => {
	        (async () => {
	          try {
	            await postService.deletePost(bubbleId);
	            dispatch(appActions.deletePost(bubbleId));
	            showToast("Bubble deleted.", { type: "success" });
	          } catch (e) {
	            showToast(e?.message || "Could not delete bubble. Try again.", {
	              type: "error",
	            });
	          }
	        })();
	      },
	    });
	  };

	  const handleDeleteRepost = (repostId) => {
	    confirmAlert({
	      title: "Delete Repost",
	      message: "Are you sure you want to delete this repost?",
	      confirmText: "Delete",
	      confirmStyle: "destructive",
	      onConfirm: () => {
	        (async () => {
	          try {
	            await repostService.deleteRepost(repostId);
	            dispatch(appActions.deleteRepost(repostId));
	            showToast("Repost deleted.", { type: "success" });
	          } catch (e) {
	            showToast(e?.message || "Could not delete repost. Try again.", {
	              type: "error",
	            });
	          }
	        })();
	      },
	    });
	  };

  const handleLogout = () => {
    confirmAlert({
      title: "Log Out",
      message: "Are you sure you want to log out?",
      confirmText: "Log Out",
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
  };

  const handleReport = () => setShowReportModal(true);

  const handleReportSubmit = (data) => {
    console.log("Report submitted:", data);
    showToast("Report submitted. Thank you!", { type: "success" });
    setShowReportModal(false);
  };

  const tabs = useMemo(
    () => [
      { key: "posts", label: `My Posts (${userBubbles.length})` },
      { key: "reposts", label: `Reposts (${reposts.length})` },
    ],
    [reposts.length, userBubbles.length]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProfileHeader
          avatar={avatar}
          avatarUrl={avatarUrl}
          nickname={nickname}
          bio={bio}
          joinedDate={joinedDate}
          stats={stats}
          onAvatarPress={() => setShowAvatarPicker(true)}
          onEditPress={() => router.push("/(onboarding)/setup")}
        />

        <DonationBanner />

        <SegmentedTabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        <View style={styles.tabContent}>
          {activeTab === "posts" ? (
            <ProfilePostsTab
              bubbles={userBubbles}
              onPressBubble={(id) => console.log("Open bubble:", id)}
              onDeleteBubble={handleDeleteBubble}
              onCreateBubble={() => router.push("/(tabs)/Create")}
            />
          ) : (
            <ProfileRepostsTab
              reposts={reposts}
              onPressRepost={(id) => console.log("Open repost:", id)}
              onDeleteRepost={handleDeleteRepost}
            />
          )}
        </View>

        <ProfileSettingsSection
          onReportProblem={handleReport}
          onLogout={handleLogout}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <AvatarPicker
        visible={showAvatarPicker}
        selectedAvatar={avatar}
        onSelect={handleAvatarSelect}
        onClose={() => setShowAvatarPicker(false)}
      />

      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <ReportModal
          type="profile"
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
        />
      </Modal>
    </SafeAreaView>
  );
}
