import React, { useEffect, useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../constants/themes";
import { router } from "expo-router";
import Header from "../components/common/Header";
import BubbleCard from "../components/feed/BubbleCard";
import Skeleton from "../components/feed/Skeleton";
import FilterModal from "../components/feed/FilterModal";
import { appActions, useAppContext } from "../context/AppContext";
import { styles } from "./HomeScreen.styles";
import { postService } from "../services/postService";
import { cacheService } from "../services/cacheService";
import { reactionService } from "../services/reactionService";
import { userService } from "../services/userService";
import { TAGS } from "../constants/tags";
import { useToast } from "../context/ToastContext";
import { notificationService } from "../services/notificationService";

const MIN_FEED_REFRESH_INTERVAL_MS = 600;
const AUTHOR_PROFILE_REFRESH_MS = 5 * 60 * 1000;

const HomeScreen = () => {
  const { state, dispatch } = useAppContext();
  const { showToast } = useToast();
  const bubbles = state.posts;
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(8)).current;
  const latestPostsRef = useRef(state.posts);
  const isFetchingRef = useRef(false);
  const lastNetworkFetchAtRef = useRef(0);
  const authorProfileFetchesRef = useRef(new Map());

  useEffect(() => {
    latestPostsRef.current = state.posts;
  }, [state.posts]);

  useEffect(() => {
    const uid = state.user?.uid;
    if (!uid) return;

    dispatch(
      appActions.updatePostsAuthor(uid, {
        nickname: state.profile.nickname || "@anonymous",
        avatar: state.profile.avatar || "cat",
        avatarUrl: state.profile.avatarUrl || null,
      })
    );
  }, [
    dispatch,
    state.profile.avatar,
    state.profile.avatarUrl,
    state.profile.nickname,
    state.user?.uid,
  ]);

  useEffect(() => {
    const posts = Array.isArray(bubbles) ? bubbles : [];
    if (!posts.length) return;

    let cancelled = false;
    const now = Date.now();
    const seen = new Set();
    const authorIds = [];

    posts.forEach((post) => {
      const userId = String(post?.userId || "").trim();
      if (!userId || seen.has(userId)) return;
      seen.add(userId);

      const lastFetchedAt = authorProfileFetchesRef.current.get(userId) || 0;
      if (now - lastFetchedAt < AUTHOR_PROFILE_REFRESH_MS) return;

      authorProfileFetchesRef.current.set(userId, now);
      authorIds.push(userId);
    });

    if (!authorIds.length) return;

    (async () => {
      const profiles = await Promise.all(
        authorIds.map(async (userId) => {
          try {
            return await userService.getUserProfile(userId);
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      profiles.forEach((profile) => {
        if (!profile?.id) return;
        dispatch(appActions.setAuthorProfile(profile));
        dispatch(
          appActions.updatePostsAuthor(profile.id, {
            nickname: profile.nickname,
            avatar: profile.avatar,
            avatarUrl: profile.avatarUrl || null,
          })
        );
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [bubbles, dispatch]);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
      fade.stopAnimation();
      rise.stopAnimation();
    };
  }, [fade, rise]);

  const fetchBubbles = useCallback(async ({ forceNetwork = false, showSpinner = true } = {}) => {
    if (isFetchingRef.current) return;
    if (
      forceNetwork &&
      Date.now() - lastNetworkFetchAtRef.current < MIN_FEED_REFRESH_INTERVAL_MS
    ) {
      return;
    }

    isFetchingRef.current = true;
    let latestPosts = latestPostsRef.current;
    const hadLivePosts = latestPosts.length > 0;

    try {
      // Cache first
      if (!forceNetwork && latestPosts.length === 0) {
        const cached = await cacheService.getPosts();
        if (Array.isArray(cached) && cached.length > 0) {
          const now = Date.now();
          latestPosts = cached.filter((p) => {
            const exp = p?.expiresAt;
            if (!exp) return true;
            const t = new Date(exp).getTime();
            if (!Number.isFinite(t)) return true;
            return t > now;
          });
          dispatch(
            appActions.setPosts(latestPosts)
          );
        }
      }

      if (!forceNetwork && hadLivePosts && !refreshing) {
        setIsLoading(false);
        return;
      }

      if (showSpinner && latestPosts.length === 0) {
        setIsLoading(true);
      }
      const posts = await postService.getFeed({ pageSize: 20 });
      latestPosts = posts;
      lastNetworkFetchAtRef.current = Date.now();
      dispatch(appActions.setPosts(posts));
      await cacheService.savePosts(posts.slice(0, 20));
    } catch (e) {
      const status = e?.response?.status;
      if (status !== 401 && status !== 403) {
        console.error("Fetch feed error:", e);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }

    if (!state.user?.uid) return;

    try {
      const myMap = await reactionService.getMyReactionsForPosts({
        postIds: (latestPosts || []).map((p) => p.id),
        uid: state.user.uid,
      });
      dispatch(appActions.setMyReactions(myMap));
    } catch (e) {
      const status = e?.response?.status;
      if (status !== 401 && status !== 403) {
        console.error("Fetch reactions error:", e);
      }
    }
  }, [dispatch, refreshing, state.user?.uid]);

  useEffect(() => {
    fetchBubbles();
  }, [fetchBubbles]);

  useFocusEffect(
    useCallback(() => {
      void fetchBubbles({ forceNetwork: true, showSpinner: false });
    }, [fetchBubbles])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchBubbles({ forceNetwork: true, showSpinner: false });
  }, [fetchBubbles]);

  const handleReact = (bubbleId, emoji) => {
    const uid = state.user?.uid;
    if (!uid) {
      showToast("Please sign in to react.", { type: "error" });
      return;
    }

    // Optimistic UI update
    dispatch(appActions.toggleReaction(bubbleId, emoji));

    (async () => {
      try {
        const result = await reactionService.togglePostReaction({
          postId: bubbleId,
          uid,
          reactionKey: emoji,
        });
        dispatch(appActions.setPostReactions(bubbleId, result.reactions));
        dispatch(appActions.setMyReaction(bubbleId, result.myReaction));

        // Notify the owner when a reaction is added (not removed).
        if (result.myReaction) {
          const post = (state.posts || []).find((p) => p.id === bubbleId);
          const toUid = post?.userId;
          if (toUid && toUid !== uid) {
            await notificationService.createNotification({
              toUid,
              type: "reaction",
              text: `${state.profile.nickname || "@someone"} reacted to your bubble`,
              fromNickname: state.profile.nickname || "@someone",
              fromUserId: uid,
              postId: bubbleId,
              eventKey: `reaction:${uid}:${bubbleId}`,
            });
          }
        }
      } catch (e) {
        // Revert on failure
        dispatch(appActions.toggleReaction(bubbleId, emoji));
        showToast(e?.message || "Could not react. Try again.", { type: "error" });
      }
    })();
  };

  const handleViewProfile = (bubble) => {
    if (!bubble?.userId) {
      return;
    }
    const authorProfile = state.authorProfiles?.[bubble.userId] || null;
    router.push({
      pathname: "/profile/[userId]",
      params: {
        userId: bubble.userId,
        nickname: authorProfile?.nickname || bubble.nickname,
        username: authorProfile?.username || "",
        avatar: authorProfile?.avatar || bubble.avatar,
        avatarUrl: authorProfile?.avatarUrl || bubble.avatarUrl || "",
      },
    });
  };

  const handleFilterApply = (filterData) => {
    console.log("Applying filter:", filterData);
    setSelectedTags(filterData.tags || []);
    setShowFilterModal(false);
  };

  const handleFilterClear = () => {
    setSelectedTags([]);
  };

  const filteredBubbles = useMemo(() => {
    if (selectedTags.length === 0) {
      return bubbles.filter((b) => {
        const exp = b?.expiresAt;
        if (!exp) return true;
        const t = new Date(exp).getTime();
        if (!Number.isFinite(t)) return true;
        return t > Date.now();
      });
    }

    return bubbles
      .filter((bubble) => bubble.tags.some((tag) => selectedTags.includes(tag)))
      .filter((b) => {
        const exp = b?.expiresAt;
        if (!exp) return true;
        const t = new Date(exp).getTime();
        if (!Number.isFinite(t)) return true;
        return t > Date.now();
      });
  }, [bubbles, selectedTags]);

  const availableTags = useMemo(() => {
    const set = new Set(TAGS || []);
    (bubbles || []).forEach((post) => {
      (post?.tags || []).forEach((t) => {
        const tag = String(t || "").trim();
        if (tag) set.add(tag);
      });
    });
    return Array.from(set);
  }, [bubbles]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={{ flex: 1 }}>
        <Header onFilterClick={() => setShowFilterModal(true)} />

        {selectedTags.length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersScrollContent}
            >
              {selectedTags.map((tag) => (
                <View key={tag} style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterTagText}>#{tag}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTags(selectedTags.filter((t) => t !== tag));
                    }}
                    style={styles.removeTagButton}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleFilterClear}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: rise }] }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primaryPink]}
                tintColor={theme.colors.primaryPink}
              />
            }
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} />)
            ) : filteredBubbles.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No bubbles found</Text>
                <Text style={styles.emptyStateText}>
                  {selectedTags.length > 0
                    ? "Try changing your filters or creating a new bubble"
                    : "Be the first to create a bubble!"}
                </Text>
                {selectedTags.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={handleFilterClear}
                  >
                    <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredBubbles.map((bubble) => (
                bubble?.isPending ? (
                  <Skeleton key={bubble.id} label="Posting your bubble..." />
                ) : (
                  <BubbleCard
                    key={bubble.id}
                    bubble={bubble}
                    onReact={handleReact}
                    onViewProfile={handleViewProfile}
                  />
                )
              ))
            )}
          </ScrollView>
        </Animated.View>

        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleFilterApply}
          onClear={handleFilterClear}
          tags={availableTags}
          selectedTags={selectedTags}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
