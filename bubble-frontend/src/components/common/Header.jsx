// src/components/header/Header.jsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../constants/themes";
import NotificationsPanel from "../feed/NotificationsPanel";
import { useAppContext } from "../../context/AppContext";
import { styles } from "./Header.styles";

const logoImage = require("../../../assets/logo.png");

export default function Header({ onFilterClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { state } = useAppContext();
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleLogoPress = () => {
    console.log("Logo pressed");
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.header}>
      <View style={styles.statusBarSpacing} />

      {/* Logo */}
      <TouchableOpacity style={styles.logoButton} onPress={handleLogoPress}>
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
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
    </LinearGradient>
  );
}
