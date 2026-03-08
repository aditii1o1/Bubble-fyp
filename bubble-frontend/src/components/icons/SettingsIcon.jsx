import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function SettingsIcon({ color = "#000", size = 16 }) {
  return <MaterialIcons name="settings" size={size} color={color} />;
}
