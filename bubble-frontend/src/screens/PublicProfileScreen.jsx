import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import ScreenHeader from "../components/common/ScreenHeader";
import SegmentedTabs from "../components/common/SegmentedTabs";
import EmptyState from "../components/common/EmptyState";
import ProfileHeader from "../components/profile/ProfileHeader";
import PostPreviewCard from "../components/profile/PostPreviewCard";
import RepostPreviewCard from "../components/profile/RepostPreviewCard";
import { styles } from "./PublicProfileScreen.styles";
import { postService } from "../services/postService";
import { repostService } from "../services/repostService";
import { userService } from "../services/userService";
import { useAppContext } from "../context/AppContext";

const DEFAULT_BIO =
  "Sharing thoughts and feelings in my bubble. Be kind and breathe.";

export default function PublicProfileScreen() {
  const { userId, nickname, avatar } = useLocalSearchParams();
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState("posts");
  const [userBubbles, setUserBubbles] = useState([]);
  const [userReposts, setUserReposts] = useState([]);
  const [profileFromDb, setProfileFromDb] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!userId) return;
        const [posts, reposts, prof] = await Promise.all([
          postService.getUserPosts(String(userId), { pageSize: 20 }),
          repostService.getUserReposts(String(userId), { pageSize: 20 }),
          userService.getUserProfile(String(userId)),
        ]);
        if (!alive) return;
        setUserBubbles(Array.isArray(posts) ? posts : []);
        setUserReposts(Array.isArray(reposts) ? reposts : []);
        setProfileFromDb(prof || null);
      } catch (e) {
        // keep UI usable even if Firestore fails
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const profile = useMemo(() => {
    const firstBubble = userBubbles[0];
    return {
      id: userId,
      nickname:
        profileFromDb?.nickname || nickname || firstBubble?.nickname || "@anonymous",
      avatar: profileFromDb?.avatar || avatar || firstBubble?.avatar || "cat",
      avatarUrl: profileFromDb?.avatarUrl || firstBubble?.avatarUrl || null,
      bio: profileFromDb?.bio || DEFAULT_BIO,
      joinedDate: profileFromDb?.joinedDate || "2024",
    };
  }, [avatar, nickname, profileFromDb, userBubbles, userId]);

  const totalReactions = useMemo(() => {
    return userBubbles.reduce((sum, bubble) => {
      const reactions = bubble.reactions || {};
      return sum + Object.values(reactions).reduce((a, b) => a + b, 0);
    }, 0);
  }, [userBubbles]);

  // If Firestore is slow/blocked, still show whatever we already have from the feed.
  const fallbackPosts = useMemo(() => {
    const uid = String(userId || "");
    if (!uid) return [];
    return (state.posts || []).filter((p) => p.userId === uid);
  }, [state.posts, userId]);

  const fallbackReposts = useMemo(() => {
    const uid = String(userId || "");
    if (!uid) return [];
    return (state.reposts || []).filter((r) => r.userId === uid);
  }, [state.reposts, userId]);

  const shownPostsRaw = userBubbles.length ? userBubbles : fallbackPosts;
  const shownReposts = userReposts.length ? userReposts : fallbackReposts;

  // Prefer live in-memory posts when available (reactions/comments update instantly).
  const shownPosts = useMemo(() => {
    const all = state.posts || [];
    return shownPostsRaw.map((p) => all.find((x) => x.id === p.id) || p);
  }, [shownPostsRaw, state.posts]);

  const tabs = useMemo(
    () => [
      { key: "posts", label: `Posts (${shownPosts.length})` },
      { key: "reposts", label: `Reposts (${shownReposts.length})` },
    ],
    [shownPosts.length, shownReposts.length]
  );

  const stats = useMemo(
    () => [
      { label: "Posts", value: shownPosts.length },
      { label: "Reactions", value: totalReactions },
    ],
    [shownPosts.length, totalReactions]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader title="Profile" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProfileHeader
          avatar={profile.avatar}
          avatarUrl={profile.avatarUrl}
          nickname={profile.nickname}
          bio={profile.bio}
          joinedDate={profile.joinedDate}
          stats={stats}
        />

        <SegmentedTabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        <View style={styles.tabContent}>
          {activeTab === "posts" ? (
            shownPosts.length ? (
              shownPosts.map((bubble) => (
                <PostPreviewCard
                  key={bubble.id}
                  bubble={bubble}
                  onPress={() => console.log("Open bubble:", bubble.id)}
                />
              ))
            ) : (
              <EmptyState
                icon="chatbubble-outline"
                title="No posts yet"
                message="This user hasn't shared any bubbles yet."
              />
            )
          ) : shownReposts.length ? (
            shownReposts.map((repost) => (
              <RepostPreviewCard
                key={repost.id}
                repost={repost}
                onPress={() => console.log("Open repost:", repost.originalBubbleId)}
              />
            ))
          ) : (
            <EmptyState
              icon="repeat-outline"
              title="No reposts yet"
              message="This user hasn't reposted any bubbles."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
