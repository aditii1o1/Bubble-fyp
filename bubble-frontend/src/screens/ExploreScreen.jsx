import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import TagChip from "../components/feed/TagChip";
import BubbleCard from "../components/feed/BubbleCard";
import { theme } from "../constants/themes";
import { styles } from "./ExploreScreen.styles";

const logoImage = require("../../assets/logo.png");

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
      reactions: { heart: 245 },
      commentCount: 42,
    },
    {
      id: "e2",
      nickname: "@burntout_coder",
      text: "6 months into my first dev job and the imposter syndrome is real. Everyone seems to know so much more than me.",
      preview: "6 months into my first dev job and the imposter syndrome...",
      tags: ["#tech", "#coding", "#work"],
      reactions: { heart: 189 },
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
      <View style={styles.brandRow}>
        <Image source={logoImage} style={styles.brandLogo} resizeMode="contain" />
      </View>

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

export default ExploreScreen;
