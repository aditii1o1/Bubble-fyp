import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function ChevronIcon({
  direction = "right",
  color = "#000",
  size = 24,
}) {
  const iconNames = {
    left: "chevron-left",
    right: "chevron-right",
    up: "keyboard-arrow-up",
    down: "keyboard-arrow-down",
  };

  return (
    <MaterialIcons name={iconNames[direction]} size={size} color={color} />
  );
}
