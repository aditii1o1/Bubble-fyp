import { StyleSheet } from "react-native";
import { theme } from "../constants/themes";

export const styles = StyleSheet.create({
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
