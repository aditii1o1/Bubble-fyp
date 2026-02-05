import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const { width } = Dimensions.get("window");

const AVATAR_EMOJIS = {
  cat: "😸",
  dog: "🐶",
  panda: "🐼",
  rabbit: "🐰",
  fox: "🦊",
  bear: "🐻",
  penguin: "🐧",
  owl: "🦉",
  dolphin: "🐬",
  unicorn: "🦄",
  butterfly: "🦋",
  koala: "🐨",
  sloth: "🦥",
  raccoon: "🦝",
  default: "👤",
};

export const getAvatarEmoji = (avatarKey) => {
  return AVATAR_EMOJIS[avatarKey] || AVATAR_EMOJIS.default;
};

const AvatarPicker = ({ visible, selectedAvatar, onSelect, onClose }) => {
  const avatarOptions = Object.entries(AVATAR_EMOJIS);

  const handleSelect = (avatarKey) => {
    onSelect(avatarKey);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Avatar</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.subtitle}>
              Select an emoji that represents you
            </Text>

            <View style={styles.avatarGrid}>
              {avatarOptions.map(([key, emoji]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === key && styles.avatarOptionSelected,
                  ]}
                  onPress={() => handleSelect(key)}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                  {selectedAvatar === key && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                onSelect(selectedAvatar);
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    maxHeight: "70%",
    marginTop: "auto",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.lg,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.accent,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  selectedIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.buttonText,
  },
});

export default AvatarPicker;
