import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { styles } from "./Skeleton.styles";

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

export default Skeleton;
