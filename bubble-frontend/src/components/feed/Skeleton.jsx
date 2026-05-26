import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./Skeleton.styles";

const { width } = Dimensions.get("window");

const Skeleton = ({ label = "" }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
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
    );
    loop.start();

    return () => {
      loop.stop();
      shimmerAnim.stopAnimation();
    };
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.card}>
      {!!label && (
        <View style={styles.labelRow}>
          <View style={styles.labelDot} />
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}
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
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

export default Skeleton;
