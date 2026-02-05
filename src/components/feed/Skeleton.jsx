import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { theme } from "../../constants/themes";

const { width } = Dimensions.get("window");

const Skeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.meta}>
          <View style={[styles.line, styles.lineShort]} />
          <View style={[styles.line, styles.lineVeryShort]} />
        </View>
      </View>
      <View style={[styles.line, styles.lineFull]} />
      <View style={[styles.line, styles.lineMedium]} />
      <View style={[styles.line, styles.lineSmall]} />
      <View style={styles.tags}>
        <View style={styles.tag} />
        <View style={styles.tag} />
      </View>

      {/* Shimmer Overlay */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface2,
  },
  meta: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  line: {
    height: 12,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  lineShort: {
    width: "60%",
  },
  lineVeryShort: {
    width: "40%",
  },
  lineFull: {
    width: "100%",
    height: 16,
  },
  lineMedium: {
    width: "90%",
    height: 16,
  },
  lineSmall: {
    width: "70%",
    height: 16,
  },
  tags: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  tag: {
    width: 60,
    height: 24,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.round,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});

export default Skeleton;
