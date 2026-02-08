import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function ImageIcon({ color = "#8E8E8E", size = 24 }) {
  return <MaterialIcons name="image" size={size} color={color} />;
}
