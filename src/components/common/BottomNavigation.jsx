// components/common/BottomTabNav.jsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/themes"; // Fixed import

const BottomTabNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: "home",
    },
    {
      id: "explore",
      label: "Explore",
      icon: "explore",
    },
    {
      id: "create",
      label: "Create",
      icon: "add-circle",
      isCreate: true,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "person",
    },
  ];

  return (
    <View style={styles.nav}>
      <View style={styles.navInner}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCreate) {
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.createButton}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.createIconContainer}>
                  <MaterialIcons
                    name={tab.icon}
                    size={28}
                    color={theme.colors.white}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={
                  isActive ? theme.colors.primaryPink : theme.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? theme.colors.primaryPink
                      : theme.colors.textMuted,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.bgWhite,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    zIndex: 100,
    shadowColor: theme.colors.primaryPink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    paddingBottom: 20,
  },
  navInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    paddingHorizontal: theme.spacing.sm,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    fontFamily: theme.fontFamily.regular,
    marginTop: 2,
  },
  createButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  createIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryPink,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primaryPink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default BottomTabNav;
