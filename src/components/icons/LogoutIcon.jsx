import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function LogoutIcon({ color = "#000", size = 16 }) {
  return <MaterialIcons name="logout" size={size} color={color} />;
}
