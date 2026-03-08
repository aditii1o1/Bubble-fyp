import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { theme } from "../../constants/themes";
import { styles } from "./ToastHost.styles";

export default function ToastHost({ toast, onHide }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (!toast) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      opacity.setValue(0);
      translateY.setValue(-10);
    };
  }, [opacity, toast, translateY]);

  if (!toast) return null;

  const bg =
    toast.type === "error"
      ? theme.colors.errorRed
      : toast.type === "success"
        ? theme.colors.successGreen || theme.colors.primaryPink
        : theme.colors.textDark;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: bg, opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.text} numberOfLines={3}>
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
}

