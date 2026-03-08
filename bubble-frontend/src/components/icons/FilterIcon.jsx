import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function FilterIcon({ color = "#000", size = 24 }) {
  return <MaterialIcons name="filter-list" size={size} color={color} />;
}
