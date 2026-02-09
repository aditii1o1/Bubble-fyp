import { Platform } from "react-native";

// Format time remaining for bubbles
export const formatTimeRemaining = (expiresAt) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { hours: 0, display: "Expired" };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours >= 1) {
    return { hours: diffHours, display: `${diffHours}h left` };
  } else {
    return { hours: 0, display: `${diffMinutes}m left` };
  }
};

// Format relative time (e.g., "2h ago")
export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Format date as MM/DD/YYYY
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Extract preview text (first sentence or truncated)
export const getPreviewText = (text, maxLength = 80) => {
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }
  return firstSentence.substring(0, maxLength).trim() + "...";
};

// Platform-specific styles
export const getPlatformStyles = (iosStyle, androidStyle) => {
  return Platform.OS === "ios" ? iosStyle : androidStyle;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Generate random color for avatars
export const getRandomColor = () => {
  const colors = [
    "#FF8FAB",
    "#FFB5A7",
    "#E0BBE4",
    "#7ED6A6",
    "#FFB347",
    "#1E88E5",
    "#F50057",
    "#FFDEE9",
    "#B5FFFC",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Remove hashtag from tag
export const cleanTag = (tag) => {
  return tag.startsWith("#") ? tag.substring(1) : tag;
};

// Add hashtag to tag
export const formatTag = (tag) => {
  return tag.startsWith("#") ? tag : `#${tag}`;
};

// Debounce function for search/input
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
