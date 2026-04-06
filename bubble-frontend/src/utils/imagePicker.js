import * as ImagePicker from "expo-image-picker";

export async function pickImageFromLibrary({
  allowsEditing = true,
  aspect = [1, 1],
  quality = 0.8,
} = {}) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { cancelled: true, error: "Photo permission is required." };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing,
    aspect,
    quality,
  });

  if (result.canceled) {
    return { cancelled: true };
  }

  const asset = Array.isArray(result.assets) ? result.assets[0] : null;
  if (!asset?.uri) {
    return { cancelled: true, error: "No image selected." };
  }

  const name = asset.fileName || `avatar_${Date.now()}.jpg`;
  const type = asset.mimeType || "image/jpeg";

  return {
    cancelled: false,
    file: { uri: asset.uri, name, type },
  };
}

