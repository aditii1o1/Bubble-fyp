import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { REACTION_OPTIONS } from "../../constants/reactions";
import { styles } from "./ReactionPills.styles";

export default function ReactionPills({
  reactions = {},
  activeReaction = null,
  onReact,
  scroll = true,
}) {
  const Content = (
    <View style={styles.row}>
      {REACTION_OPTIONS.map(({ key, icon }) => {
        const count = (reactions && reactions[key]) || 0;
        const isActive = activeReaction === key;

        return (
          <TouchableOpacity
            key={key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onReact?.(key)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isActive ? icon : `${icon}-outline`}
              size={16}
              color={isActive ? styles.pillIconActive.color : styles.pillIcon.color}
              style={styles.pillIcon}
            />
            {count > 0 ? <Text style={styles.pillCount}>{count}</Text> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!scroll) return Content;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {Content}
    </ScrollView>
  );
}

