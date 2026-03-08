import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { styles } from "./SplashScreen.styles";
export default function SplashScreen() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [floatAnim, pulseAnim]);

  const bubbleStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -12],
          }),
        },
        {
          scale: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          }),
        },
      ],
      opacity: pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
      }),
    }),
    [floatAnim, pulseAnim]
  );

  const shimmerStyle = useMemo(
    () => ({
      opacity: pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 0.6],
      }),
      transform: [
        {
          scale: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.2],
          }),
        },
      ],
    }),
    [pulseAnim]
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
      <Animated.View style={[styles.bubble, bubbleStyle]}>
        <View style={styles.innerBubble} />
        <Text style={styles.logoText}>Bubble</Text>
      </Animated.View>
      <Text style={styles.tagline}>Breathe. Share. Heal.</Text>
    </View>
  );
}
