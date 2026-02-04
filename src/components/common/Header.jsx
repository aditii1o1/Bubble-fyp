// src/components/header/Header.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import NotificationsPanel from "../feed/NotificationsPanel";

export default function Header({ onFilterClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Mock unread count

  const handleLogoPress = () => {
    console.log("Logo pressed");
  };

  return (
    <View style={styles.header}>
      {/* Status bar spacing */}
      <View style={styles.statusBarSpacing} />

      {/* Logo */}
      <TouchableOpacity style={styles.logoButton} onPress={handleLogoPress}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>○</Text>
          <Text style={styles.logoText}>Bubble</Text>
        </View>
      </TouchableOpacity>

      {/* Right Side Actions */}
      <View style={styles.rightActions}>
        {/* Notification Button */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setShowNotifications(true)}
        >
          <View style={styles.notificationWrapper}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.primaryPink}
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity style={styles.filterButton} onPress={onFilterClick}>
          <Ionicons
            name="filter-outline"
            size={24}
            color={theme.colors.primaryPink}
          />
        </TouchableOpacity>
      </View>

      {/* Notifications Panel */}
      <NotificationsPanel
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        unreadCount={unreadCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0,
    paddingBottom: 14,
    ...theme.shadow.small,
    zIndex: 100,
  },
  statusBarSpacing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0,
  },
  logoButton: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    fontSize: 32,
    color: theme.colors.primaryPink,
    fontWeight: "300",
    lineHeight: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.primaryPink,
    letterSpacing: -0.5,
    fontFamily: theme.fonts.bold,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: theme.colors.primaryPink + "10", // More pink background
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: theme.colors.primaryPink + "10", // More pink background
  },
  notificationWrapper: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.primaryPink,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.bgWhite,
    shadowColor: theme.colors.primaryPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontFamily: theme.fonts.bold,
  },
});
