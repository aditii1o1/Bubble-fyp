import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function PlusIcon({ color = "#000", size = 24 }) {
  return <MaterialIcons name="add" size={size} color={color} />;
}
