import { StyleSheet, Platform, StatusBar } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0,
    paddingBottom: 14,
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
  },
  logoImage: {
    height: 34,
    width: 140,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: theme.colors.bgWhite + "AA",
    marginRight: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: theme.colors.bgWhite + "AA",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
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
