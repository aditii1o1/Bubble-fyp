import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { AVATAR_EMOJIS } from "../../../lib/avatars";
import { styles } from "./AvatarPicker.styles";

export default function AvatarPicker({
  visible,
  selectedAvatar,
  onSelect,
  onClose,
  onUploadPress,
  uploadLabel = "Upload Photo",
  uploading = false,
}) {
  const avatarOptions = useMemo(() => Object.entries(AVATAR_EMOJIS), []);
  const [tempAvatar, setTempAvatar] = useState(selectedAvatar);

  useEffect(() => {
    if (visible) setTempAvatar(selectedAvatar);
  }, [selectedAvatar, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Avatar</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {onUploadPress ? (
              <TouchableOpacity
                style={[styles.pickButton, uploading && styles.pickButtonDisabled]}
                onPress={onUploadPress}
                disabled={uploading}
                activeOpacity={0.85}
              >
                <View style={styles.pickButtonRow}>
                  <Ionicons
                    name="image-outline"
                    size={18}
                    color={theme.colors.text}
                    style={styles.pickButtonIcon}
                  />
                  <Text style={styles.pickButtonText}>
                    {uploading ? "Uploading..." : uploadLabel}
                  </Text>
                </View>
                {uploading ? (
                  <ActivityIndicator size="small" color={theme.colors.text} />
                ) : null}
              </TouchableOpacity>
            ) : null}

            <Text style={styles.subtitle}>Select an emoji that represents you</Text>

            <View style={styles.avatarGrid}>
              {avatarOptions.map(([key, emoji]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.avatarOption,
                    tempAvatar === key && styles.avatarOptionSelected,
                  ]}
                  onPress={() => setTempAvatar(key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                  {tempAvatar === key ? (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                onSelect?.(tempAvatar);
                onClose?.();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
