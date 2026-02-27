import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import TagChip from "../components/feed/TagChip";
import BubbleCard from "../components/feed/BubbleCard";
import { theme } from "../constants/themes";
import { mockBubbles, mockTags } from "../data/mockData";
import { getFeed } from "../services/postService";

const normalizeExploreFeed = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.posts)
    ? payload.posts
    : [];

  return list.map((item, index) => ({
    ...item,
    id: item?.id || `explore_${index}`,
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

const sanitizeTag = (tag) => tag.replace(/^#/, "").toLowerCase();

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  const fetchExploreFeed = useCallback(async ({ isRefresh = false } = {}) => {
    if (!isRefresh) {
      setIsLoading(true);
    }

    try {
      const response = await getFeed({ sort: "trending" });
      const normalized = normalizeExploreFeed(response);
      setBubbles(normalized.length > 0 ? normalized : mockBubbles);
    } catch (error) {
      if (__DEV__) {
        console.log("Explore request failed, using fallback:", error);
      }
      setBubbles(mockBubbles);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreFeed();
  }, [fetchExploreFeed]);

  const trendingTags = useMemo(() => {
    const sourceTags = mockTags.slice(0, 10);
    return sourceTags.map((tag) => `#${tag}`);
  }, []);

  const filteredBubbles = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    const normalizedSelectedTag = selectedTag
      ? sanitizeTag(selectedTag)
      : null;

    return bubbles.filter((bubble) => {
      const bubbleText = bubble.text.toLowerCase();
      const bubbleTags = (bubble.tags || []).map((tag) =>
        sanitizeTag(String(tag))
      );

      const matchesSearch =
        !search ||
        bubbleText.includes(search) ||
        bubbleTags.some((tag) => tag.includes(search));

      const matchesTag =
        !normalizedSelectedTag ||
        bubbleTags.includes(normalizedSelectedTag);

      return matchesSearch && matchesTag;
    });
  }, [bubbles, searchQuery, selectedTag]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag === selectedTag ? null : tag);
  };

  const handleReact = () => {};

  const onRefresh = () => {
    setRefreshing(true);
    fetchExploreFeed({ isRefresh: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={theme.colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bubbles..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons
              name="close"
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Tags</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
        >
          {trendingTags.map((tag) => (
            <TagChip
              key={tag}
              tag={sanitizeTag(tag)}
              selected={selectedTag === tag}
              onPress={() => handleTagSelect(tag)}
              style={styles.tagChip}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Feed</Text>
          {selectedTag && (
            <TouchableOpacity onPress={() => setSelectedTag(null)}>
              <Text style={styles.seeAll}>Clear Tag</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.bubblesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primaryPink]}
            />
          }
        >
          {isLoading ? (
            <Text style={styles.placeholderText}>Loading explore feed...</Text>
          ) : filteredBubbles.length === 0 ? (
            <Text style={styles.placeholderText}>
              No bubbles match your search yet.
            </Text>
          ) : (
            filteredBubbles.map((bubble) => (
              <BubbleCard key={bubble.id} bubble={bubble} onReact={handleReact} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgWhite,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textDark,
    paddingVertical: theme.spacing.xs,
  },
  section: {
    backgroundColor: theme.colors.bgWhite,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textDark,
  },
  seeAll: {
    color: theme.colors.primaryPink,
    fontSize: theme.fontSize.sm,
  },
  tagsScroll: {
    marginHorizontal: -theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  tagChip: {
    marginRight: theme.spacing.sm,
  },
  bubblesList: {
    maxHeight: 600,
  },
  placeholderText: {
    textAlign: "center",
    color: theme.colors.textMuted,
    paddingVertical: theme.spacing.xl,
    fontFamily: theme.fontFamily.regular,
  },
});
