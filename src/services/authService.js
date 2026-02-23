import AsyncStorage from "@react-native-async-storage/async-storage";
import BACKEND_CONFIG from "../config/backend";
import { apiRequest } from "./api";

export const login = async ({ email, password }) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (response?.token) {
    await AsyncStorage.setItem(BACKEND_CONFIG.tokenStorageKey, response.token);
  }

  return response;
};

export const signup = async ({ nickname, email, password }) => {
  const response = await apiRequest("/auth/signup", {
    method: "POST",
    body: { nickname, email, password },
  });

  if (response?.token) {
    await AsyncStorage.setItem(BACKEND_CONFIG.tokenStorageKey, response.token);
  }

  return response;
};

export const logout = async () => {
  await AsyncStorage.removeItem(BACKEND_CONFIG.tokenStorageKey);
  return true;
};

export const getStoredToken = async () => {
  return AsyncStorage.getItem(BACKEND_CONFIG.tokenStorageKey);
};

export default {
  login,
  signup,
  logout,
  getStoredToken,
};
