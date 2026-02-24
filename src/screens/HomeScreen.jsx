// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../constants/themes";
import Header from "../components/common/Header";
import BubbleCard from "../components/feed/BubbleCard";
import Skeleton from "../components/feed/Skeleton";
import FilterModal from "../components/feed/FilterModal";
import { getFeed } from "../services/postService";
import { mockBubbles, mockTags } from "../data/mockData";

const normalizeFeedResponse = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.posts)
    ? payload.posts
    : [];

  return list.map((item, index) => ({
    ...item,
    id: item?.id || `post_${index}`,
    text: item?.text || "",
    nickname: item?.nickname || "@anonymous",
    avatar: item?.avatar || "cat",
    tags: Array.isArray(item?.tags) ? item.tags : [],
    reactions: item?.reactions || {},
    expiresAt:
      item?.expiresAt ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const HomeScreen = () => {
  const [bubbles, setBubbles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter state - only tags now
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchBubbles = useCallback(async ({ isRefresh = false } = {}) => {
    if (!isRefresh) {
      setIsLoading(true);
    }

    try {
      const response = await getFeed();
      const feed = normalizeFeedResponse(response);
      setBubbles(feed.length > 0 ? feed : mockBubbles);
    } catch (error) {
      if (__DEV__) {
        console.log("Feed request failed, falling back to mock data:", error);
      }
      setBubbles(mockBubbles);
    } finally {
      setIsLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchBubbles();
  }, [fetchBubbles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBubbles({ isRefresh: true });
  }, [fetchBubbles]);

  const handleReact = (bubbleId, emoji) => {
    console.log(`Reacted to bubble ${bubbleId} with ${emoji}`);
    // Update bubble reactions in state
    setBubbles((prev) =>
      prev.map((bubble) =>
        bubble.id === bubbleId
          ? {
              ...bubble,
              reactions: {
                ...bubble.reactions,
                [emoji]: (bubble.reactions[emoji] || 0) + 1,
              },
            }
          : bubble
      )
    );
  };

  const handleViewProfile = (bubble) => {
    console.log("View profile:", bubble.nickname);
    // Navigate to profile screen
  };

  const handleFilterApply = (filterData) => {
    console.log("Applying filter:", filterData);
    setSelectedTags(filterData.tags || []);
    setShowFilterModal(false);
  };

  const handleFilterClear = () => {
    setSelectedTags([]);
  };

  // Filter bubbles by selected tags
  const filteredBubbles = useMemo(() => {
    if (selectedTags.length === 0) {
      return bubbles;
    }

    return bubbles.filter((bubble) =>
      (bubble.tags || []).some((tag) => selectedTags.includes(tag))
    );
  }, [bubbles, selectedTags]);

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
      fetchBubbles();
    }, [fetchBubbles])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with notification button */}
      <Header onFilterClick={() => setShowFilterModal(true)} />

      {/* Active Filters Bar */}
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

      {/* Content */}
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
          // Show skeletons while loading
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
          // Show bubbles
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

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        tags={mockTags}
        selectedTags={selectedTags}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.bgSoft,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  activeFiltersScrollContent: {
    flexGrow: 1,
    paddingRight: 8,
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primaryPink + "20",
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterTagText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primaryPink,
    marginRight: 4,
  },
  removeTagButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primaryPink,
    alignItems: "center",
    justifyContent: "center",
  },
  removeTagText: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    color: "white",
    lineHeight: 14,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 4,
  },
  clearAllText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  clearFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primaryPink,
    borderRadius: 20,
  },
  clearFiltersButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: theme.fonts.bold,
  },
});

export default HomeScreen;
