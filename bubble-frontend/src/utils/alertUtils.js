import { Alert } from "react-native";

export function confirmAlert({
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  confirmStyle = "default", // "default" | "cancel" | "destructive"
  onConfirm,
}) {
  Alert.alert(title, message, [
    { text: cancelText, style: "cancel" },
    { text: confirmText, style: confirmStyle, onPress: onConfirm },
  ]);
}

