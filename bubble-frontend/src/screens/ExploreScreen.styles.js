import { StyleSheet } from "react-native";
import { theme } from "../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  brandRow: {
    alignItems: "center",
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  brandLogo: {
    height: 34,
    width: 160,
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
