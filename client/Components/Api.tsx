import { Platform } from "react-native";

// API URL'ini belirle (Android emulator vs iOS simulator)
const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3001/users" // Android için özel IP
    : "http://localhost:3001/users";

const DOMAIN_API_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:3001/domains" // Android için özel IP
    : "http://localhost:3001/domains";

/**
 * GET isteği ile kullanıcıları al
 * @returns Response objesi
 */
export const fetchUsers = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error("Veri alma hatası:", error);
    throw error;
  }
};

/**
 * POST isteği ile yeni kullanıcı ekle
 * @param data - Eklenecek kullanıcı verisi (email, password)
 * @returns Response objesi
 */
export const createUser = async (data: { email: string; password: string }) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error("Veri gönderme hatası:", error);
    throw error;
  }
};

export const addDomain = async (data: { domain: string; userId: number; provider: string,date: (string|any) }) => {
    try {
      const response = await fetch(DOMAIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error("Veri gönderme hatası:", error);
      throw error;
    }
};
  