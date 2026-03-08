import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function UserIcon({ color = "#000", size = 24 }) {
  return <MaterialIcons name="person" size={size} color={color} />;
}
