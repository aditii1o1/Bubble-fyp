import { StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 182, 193, 0.2)",
  },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 380,
    backgroundColor: theme.colors.bgWhite,
    shadowColor: theme.colors.primaryPink,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primaryPink + "20",
    backgroundColor: theme.colors.bgWhite,
  },
  headerTop: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryPink + "10",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  headerContent: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryPink,
  },
  subtitle: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primaryPink,
  },
  markReadButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primaryPink + "10",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  markReadButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primaryPink,
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryPink + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  emptyText: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primaryPink,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.primaryPink + "80",
    textAlign: "center",
    lineHeight: 20,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primaryPink + "10",
  },
  itemUnread: {
    backgroundColor: theme.colors.primaryPink + "05",
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  emoji: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    marginBottom: 4,
    lineHeight: 20,
  },
  itemTime: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.primaryPink,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryPink,
    marginLeft: 12,
  },
});

