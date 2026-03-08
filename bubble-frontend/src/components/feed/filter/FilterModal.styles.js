import { StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    position: "absolute",
    top: "10%",
    left: 20,
    right: 20,
    maxHeight: "80%",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    maxHeight: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface2,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  hashIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  },
  clearSearch: {
    fontSize: 24,
    color: theme.colors.muted,
    padding: 4,
  },

  selectedTagsContainer: {
    marginBottom: 16,
  },
  selectedTagsTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  selectedTagsScroll: {
    flexDirection: "row",
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  selectedTagText: {
    color: theme.colors.buttonText,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    marginRight: 6,
  },
  removeIcon: {
    marginLeft: 2,
  },

  tagsSection: {
    flex: 1,
    marginBottom: 20,
  },
  tagsSectionTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  tagListContainer: {
    maxHeight: 200,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  tagButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
  },
  tagTextSelected: {
    color: theme.colors.buttonText,
  },
  checkIcon: {
    marginLeft: 6,
  },

  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    width: "100%",
  },
  noResults: {
    color: theme.colors.muted,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  noResultsSubtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: "center",
  },

  actions: {
    flexDirection: "row",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  clearButton: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    color: theme.colors.muted,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
});
