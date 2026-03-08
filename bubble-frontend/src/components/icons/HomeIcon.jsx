import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeIcon({ color = "#000", size = 24 }) {
  return <MaterialIcons name="home" size={size} color={color} />;
}
