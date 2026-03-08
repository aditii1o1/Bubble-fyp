import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function XIcon({ color = "#000", size = 24 }) {
  return <MaterialIcons name="close" size={size} color={color} />;
}
