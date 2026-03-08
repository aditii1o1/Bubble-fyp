import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function HeartIcon({
  color = "#FF8FAB",
  size = 16,
  filled = false,
}) {
  return (
    <MaterialIcons
      name={filled ? "favorite" : "favorite-border"}
      size={size}
      color={color}
    />
  );
}
