// Time formatting utilities
import AsyncStorage from "@react-native-async-storage/async-storage";

export const formatTimeRemaining = (expiresAt) => {
  if (!expiresAt) {
    return {
      hours: 24,
      minutes: 0,
      display: "24h",
    };
  }

  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffMs = expiration - now;

  if (diffMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      display: "Expired",
    };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return {
      hours: diffHours,
      minutes: diffMinutes,
      display: `${diffHours}h ${diffMinutes}m`,
    };
  }

  return {
    hours: 0,
    minutes: diffMinutes,
    display: `${diffMinutes}m`,
  };
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";

  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return past.toLocaleDateString();
  }
};

export const getPreviewText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Validation helpers
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateNickname = (nickname) => {
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(nickname);
};

// Array utilities
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// String utilities
export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateString = (str, maxLength) => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};

// Storage helpers (for AsyncStorage)
export const storage = {
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  },

  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error reading data:", error);
      return null;
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
    }
  },
};

// Date helpers
export const formatDate = (date, format = "short") => {
  const d = new Date(date);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return d.toLocaleDateString("en-US", options);
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  } else if (diffHours < 168) {
    return `${Math.floor(diffHours / 24)}d ago`;
  } else {
    return formatDate(date);
  }
};

// Number formatting
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};
