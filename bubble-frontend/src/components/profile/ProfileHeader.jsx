import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commonStyles } from "../../styles/commonStyles";
import { getAvatarEmoji } from "../../lib/avatars";
import ProfileStats from "./ProfileStats";
import { styles } from "./ProfileHeader.styles";
import { theme } from "../../constants/themes";

export default function ProfileHeader({
  avatar = "cat",
  avatarUrl,
  nickname = "@anonymous",
  bio,
  joinedDate,
  stats = [],
  onAvatarPress,
  onEditPress,
}) {
  const AvatarPressable = onAvatarPress ? TouchableOpacity : View;
  const avatarPressableProps = onAvatarPress
    ? { onPress: onAvatarPress, activeOpacity: 0.8 }
    : {};

  return (
    <View style={[commonStyles.card, styles.card]}>
      {onEditPress ? (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          activeOpacity={0.8}
          accessibilityLabel="Edit profile"
        >
          <Ionicons name="pencil" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      ) : null}

      <AvatarPressable style={styles.avatarButton} {...avatarPressableProps}>
        <View style={styles.avatarCircle}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarEmoji}>{getAvatarEmoji(avatar)}</Text>
          )}
        </View>
        {onAvatarPress ? (
          <Text style={styles.avatarHint}>Tap to change</Text>
        ) : null}
      </AvatarPressable>

      <Text style={styles.nickname}>{nickname}</Text>

      {bio ? (
        <View style={styles.bioRow}>
          <View style={styles.bioLine} />
          <Text style={styles.bio}>{bio}</Text>
          <View style={styles.bioLine} />
        </View>
      ) : null}

      {joinedDate ? <Text style={styles.joined}>Joined {joinedDate}</Text> : null}

      <ProfileStats items={stats} />
    </View>
  );
}
