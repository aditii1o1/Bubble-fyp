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
import { TAGS } from "../constants/tags";
import { useToast } from "../context/ToastContext";
import { notificationService } from "../services/notificationService";
import { LinearGradient } from "expo-linear-gradient";

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

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, [fade, rise]);

  const fetchBubbles = useCallback(async () => {
    try {
      // Cache first
      if (state.posts.length === 0) {
        const cached = await cacheService.getPosts();
        if (Array.isArray(cached) && cached.length > 0) {
          const now = Date.now();
          dispatch(
            appActions.setPosts(
              cached.filter((p) => {
                const exp = p?.expiresAt;
                if (!exp) return true;
                const t = new Date(exp).getTime();
                if (!Number.isFinite(t)) return true;
                return t > now;
              })
            )
          );
        }
      }

      if (state.posts.length > 0 && !refreshing) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const posts = await postService.getFeed({ pageSize: 20 });
      dispatch(appActions.setPosts(posts));
      await cacheService.savePosts(posts.slice(0, 20));

      // Load my reactions
      if (state.user?.uid) {
        const myMap = await reactionService.getMyReactionsForPosts({
          postIds: posts.map((p) => p.id),
          uid: state.user.uid,
        });
        dispatch(appActions.setMyReactions(myMap));
      }
    } catch (e) {
      console.error("Fetch feed error:", e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, refreshing, state.posts.length, state.user?.uid]);

  useEffect(() => {
    fetchBubbles();
  }, [fetchBubbles]);

  useFocusEffect(
    useCallback(() => {
      let unsub = null;
      try {
        unsub = postService.subscribeFeed({
          pageSize: 20,
          onNext: async (items) => {
            dispatch(appActions.setPosts(items));
            try {
              await cacheService.savePosts(items.slice(0, 20));
            } catch {
              // ignore
            }
            setIsLoading(false);
            setRefreshing(false);
          },
        });
      } catch {
        // ignore
      }
      return () => {
        if (unsub) unsub();
      };
    }, [dispatch])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBubbles();
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
    router.push({
      pathname: "/profile/[userId]",
      params: {
        userId: bubble.userId,
        nickname: bubble.nickname,
        avatar: bubble.avatar,
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

      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
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
                <BubbleCard
                  key={bubble.id}
                  bubble={bubble}
                  onReact={handleReact}
                  onViewProfile={handleViewProfile}
                />
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
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;
