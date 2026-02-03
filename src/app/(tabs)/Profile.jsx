import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import AvatarPicker from "../../components/feed/AvatarPicker";
import DonationBanner from "../../components/feed/DonationBanner";
import TagChip from "../../components/feed/TagChip";
import ReportModal from "../../components/feed/ReportModal";
import { getAvatarEmoji } from "../../components/feed/AvatarPicker";
import { formatTimeAgo, getPreviewText } from "../../lib/utils";

// Mock user data - replace with actual user data from Firebase later
const MOCK_USER = {
  id: "user_1",
  nickname: "@gentle_soul",
  email: "user@example.com",
  avatar: "cat",
  joinedDate: "Jan 2024",
  bio: "Just sharing thoughts and feelings in my bubble.",
};

// Mock user bubbles
const MOCK_USER_BUBBLES = [
  {
    id: "1",
    nickname: "@gentle_soul",
    avatar: "cat",
    text: "Sometimes I feel like I'm carrying the weight of the world on my shoulders. Does anyone else ever feel this way? Just needed to let this out into the void.",
    image: null,
    tags: ["anxiety", "mentalhealth", "support"],
    reactions: {
      heart: 12,
      bulb: 5,
      hug: 8,
    },
    comments: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    nickname: "@gentle_soul",
    avatar: "cat",
    text: "Found this old journal from 5 years ago. The dreams I had then seem so naive now, but there's something beautiful about that innocence.",
    image: null,
    tags: ["reflection", "growth", "memories"],
    reactions: {
      heart: 24,
      bulb: 12,
      hug: 7,
    },
    comments: 8,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock user reposts
const MOCK_USER_REPOSTS = [
  {
    id: "repost_1",
    originalBubbleId: "bubble_123",
    originalText:
      "The way leaves fall - they don't fight it, they just let go. There's a lesson in that for all of us.",
    overlayText: "So true! Letting go is an art.",
    timeAgo: "2h ago",
    originalAuthor: "@quiet_observer",
  },
  {
    id: "repost_2",
    originalBubbleId: "bubble_456",
    originalText:
      "We're all figuring it out as we go. You're not alone in this.",
    overlayText: "Needed to hear this today",
    timeAgo: "1d ago",
    originalAuthor: "@midnight_writer",
  },
];

const ProfileScreen = () => {
  const [user, setUser] = useState(MOCK_USER);
  const [userBubbles, setUserBubbles] = useState(MOCK_USER_BUBBLES);
  const [userReposts, setUserReposts] = useState(MOCK_USER_REPOSTS);
  const [activeTab, setActiveTab] = useState("posts");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reportType, setReportType] = useState("profile");

  const fetchUserData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  const handleAvatarSelect = (avatarKey) => {
    setUser((prev) => ({
      ...prev,
      avatar: avatarKey,
    }));
    console.log("Avatar updated to:", avatarKey);
    setShowAvatarPicker(false);
  };

  const handleReport = (data) => {
    console.log("Report submitted:", data);
    Alert.alert(
      "Report Submitted",
      "Thank you for your report. We'll review it shortly.",
      [{ text: "OK" }]
    );
    setShowReportModal(false);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/(auth)/Login"),
      },
    ]);
  };

  const handleReportProfile = () => {
    setReportType("profile");
    setShowReportModal(true);
  };

  const handleDeleteBubble = (bubbleId) => {
    Alert.alert(
      "Delete Bubble",
      "Are you sure you want to delete this bubble?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setUserBubbles((prev) =>
              prev.filter((bubble) => bubble.id !== bubbleId)
            );
          },
        },
      ]
    );
  };

  const handleDeleteRepost = (repostId) => {
    Alert.alert(
      "Delete Repost",
      "Are you sure you want to delete this repost?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setUserReposts((prev) =>
              prev.filter((repost) => repost.id !== repostId)
            );
          },
        },
      ]
    );
  };

  const handleViewBubble = (bubbleId) => {
    // router.push(`/bubble/${bubbleId}`);
    console.log("Navigating to bubble:", bubbleId);
  };

  const handleViewRepost = (originalBubbleId) => {
    // router.push(`/bubble/${originalBubbleId}`);
    console.log("Navigating to original bubble:", originalBubbleId);
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Profile Header - Vertical Layout */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => setShowAvatarPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>
                {getAvatarEmoji(user.avatar)}
              </Text>
            </View>
            <Text style={styles.avatarChangeText}>Tap to change</Text>
          </TouchableOpacity>

          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.joinedText}>Joined {user.joinedDate}</Text>
        </View>

        {/* Donation Banner */}
        <DonationBanner />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "posts" && styles.tabActive]}
            onPress={() => setActiveTab("posts")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "posts" && styles.tabTextActive,
              ]}
            >
              My Posts ({userBubbles.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reposts" && styles.tabActive]}
            onPress={() => setActiveTab("reposts")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reposts" && styles.tabTextActive,
              ]}
            >
              Reposts ({userReposts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "posts" ? (
            userBubbles.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubble-outline"
                  size={48}
                  color={theme.colors.muted}
                />
                <Text style={styles.emptyStateTitle}>No posts yet</Text>
                <Text style={styles.emptyStateText}>
                  Share your first bubble with the community
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push("/(tabs)/Create")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.createButtonText}>Create Bubble</Text>
                </TouchableOpacity>
              </View>
            ) : (
              userBubbles.map((bubble) => (
                <TouchableOpacity
                  key={bubble.id}
                  style={styles.bubbleItem}
                  onPress={() => handleViewBubble(bubble.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.bubbleHeader}>
                    <Text style={styles.bubbleTime}>
                      {formatTimeAgo(bubble.createdAt)}
                    </Text>
                    <TouchableOpacity
                      style={styles.bubbleMenuButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteBubble(bubble.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.bubbleText}>
                    {getPreviewText(bubble.text, 120)}
                  </Text>
                  {bubble.tags && bubble.tags.length > 0 && (
                    <View style={styles.bubbleTags}>
                      {bubble.tags.slice(0, 3).map((tag, index) => (
                        <TagChip key={index} tag={tag} />
                      ))}
                    </View>
                  )}
                  <View style={styles.bubbleStats}>
                    <View style={styles.reactionEmojis}>
                      {bubble.reactions?.heart > 0 && (
                        <View style={styles.reactionItem}>
                          <Text style={styles.reactionEmoji}>❤️</Text>
                          <Text style={styles.reactionCount}>
                            {bubble.reactions.heart}
                          </Text>
                        </View>
                      )}
                      {bubble.reactions?.bulb > 0 && (
                        <View style={styles.reactionItem}>
                          <Text style={styles.reactionEmoji}>💡</Text>
                          <Text style={styles.reactionCount}>
                            {bubble.reactions.bulb}
                          </Text>
                        </View>
                      )}
                      {bubble.reactions?.hug > 0 && (
                        <View style={styles.reactionItem}>
                          <Text style={styles.reactionEmoji}>🤗</Text>
                          <Text style={styles.reactionCount}>
                            {bubble.reactions.hug}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.bubbleStat}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={14}
                        color={theme.colors.muted}
                      />
                      <Text style={styles.bubbleStatText}>
                        {bubble.comments || 0}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : userReposts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="repeat-outline"
                size={48}
                color={theme.colors.muted}
              />
              <Text style={styles.emptyStateTitle}>No reposts yet</Text>
              <Text style={styles.emptyStateText}>
                Repost bubbles you find interesting
              </Text>
            </View>
          ) : (
            userReposts.map((repost) => (
              <TouchableOpacity
                key={repost.id}
                style={styles.repostItem}
                onPress={() => handleViewRepost(repost.originalBubbleId)}
                activeOpacity={0.7}
              >
                <View style={styles.repostHeader}>
                  <Text style={styles.repostOriginalAuthor}>
                    {repost.originalAuthor}
                  </Text>
                  <TouchableOpacity
                    style={styles.repostMenuButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteRepost(repost.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.repostOriginalText}>
                  {getPreviewText(repost.originalText, 100)}
                </Text>
                {repost.overlayText && (
                  <View style={styles.repostOverlay}>
                    <Text style={styles.repostOverlayText}>
                      {repost.overlayText}
                    </Text>
                  </View>
                )}
                <Text style={styles.repostTime}>{repost.timeAgo}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push("/settings/notifications")}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.colors.text}
              />
              <Text style={styles.settingsItemText}>Notifications</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push("/settings/privacy")}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons
                name="shield-outline"
                size={20}
                color={theme.colors.text}
              />
              <Text style={styles.settingsItemText}>Privacy</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push("/settings/help")}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={theme.colors.text}
              />
              <Text style={styles.settingsItemText}>Help & Support</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={handleReportProfile}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={theme.colors.text}
              />
              <Text style={styles.settingsItemText}>Report a Problem</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.colors.error}
              />
              <Text style={[styles.settingsItemText, styles.logoutText]}>
                Log Out
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Avatar Picker Modal */}
      <AvatarPicker
        visible={showAvatarPicker}
        selectedAvatar={user.avatar}
        onSelect={handleAvatarSelect}
        onClose={() => setShowAvatarPicker(false)}
      />

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <ReportModal
          type={reportType}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  // Updated Profile Header with vertical layout
  profileHeader: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxxl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarButton: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    width: 120, // Larger avatar size
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  avatarEmoji: {
    fontSize: 60, // Larger emoji size
  },
  avatarChangeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.primary,
  },
  nickname: {
    fontSize: theme.typography.fontSize.xxl, // Larger font
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  joinedText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.muted,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxxl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.normal * 14,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
  },
  createButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.buttonText,
  },
  bubbleItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  bubbleTime: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
  },
  bubbleMenuButton: {
    padding: theme.spacing.xs,
  },
  bubbleText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.normal * 14,
    marginBottom: theme.spacing.sm,
  },
  bubbleTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.sm,
  },
  bubbleStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reactionEmojis: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
  },
  bubbleStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  bubbleStatText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
  },
  repostItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  repostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  repostOriginalAuthor: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  repostMenuButton: {
    padding: theme.spacing.xs,
  },
  repostOriginalText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.normal * 14,
    marginBottom: theme.spacing.sm,
  },
  repostOverlay: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  repostOverlayText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    fontStyle: "italic",
  },
  repostTime: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
  },
  settingsSection: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  settingsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  settingsItemText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
  },
  logoutItem: {
    borderColor: theme.colors.error + "20",
  },
  logoutText: {
    color: theme.colors.error,
  },
  bottomSpacing: {
    height: theme.spacing.xxxl,
  },
});

export default ProfileScreen;
