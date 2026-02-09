import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import TagChip from "../components/feed/TagChip";
import BubbleCard from "../components/feed/BubbleCard";
import { theme } from "../constants/theme";

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  const trendingTags = [
    "#mentalhealth",
    "#college",
    "#relationships",
    "#tech",
    "#coding",
    "#motivation",
    "#anxiety",
    "#study",
    "#work",
    "#selfcare",
  ];

  const popularBubbles = [
    {
      id: "e1",
      nickname: "@anxious_student",
      text: "Having my first panic attack during an exam. Professor was understanding but I'm so embarrassed.",
      preview: "Having my first panic attack during an exam...",
      tags: ["#college", "#anxiety", "#mentalhealth"],
      reactions: { heart: 245, bulb: 89, hug: 156 },
      commentCount: 42,
    },
    {
      id: "e2",
      nickname: "@burntout_coder",
      text: "6 months into my first dev job and the imposter syndrome is real. Everyone seems to know so much more than me.",
      preview: "6 months into my first dev job and the imposter syndrome...",
      tags: ["#tech", "#coding", "#work"],
      reactions: { heart: 189, bulb: 67, hug: 98 },
      commentCount: 31,
    },
  ];

  const handleTagSelect = (tag) => {
    setSelectedTag(tag === selectedTag ? null : tag);
  };

  const handleReact = (bubbleId, emoji) => {
    console.log(`Reacted ${emoji} to bubble ${bubbleId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search Bar */}
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

      {/* Trending Tags */}
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
              tag={tag}
              selected={selectedTag === tag}
              onPress={() => handleTagSelect(tag)}
              style={styles.tagChip}
            />
          ))}
        </ScrollView>
      </View>

      {/* Popular Bubbles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Bubbles</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.bubblesList}>
          {popularBubbles.map((bubble) => (
            <BubbleCard key={bubble.id} bubble={bubble} onReact={handleReact} />
          ))}
        </ScrollView>
      </View>

      {/* Tag Suggestions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover More</Text>
        <View style={styles.tagGrid}>
          {[
            "#loneliness",
            "#friendship",
            "#family",
            "#goals",
            "#failure",
            "#success",
          ].map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tagButton}
              onPress={() => handleTagSelect(tag)}
            >
              <Text style={styles.tagButtonText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.spacing.xs,
  },
  tagButton: {
    backgroundColor: theme.colors.bgSoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.xs,
  },
  tagButtonText: {
    color: theme.colors.textDark,
    fontSize: theme.fontSize.sm,
  },
});

export default ExploreScreen;
