import { Platform } from "react-native";

// API URL'ini belirle (Android emulator vs iOS simulator)

const URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3001/" // Android için özel IP
    : "http://localhost:3001/";


/**
 * GET isteği ile kullanıcıları al
 * @returns Response objesi
 */
export const fetchUsers = async () => {
  try {
    const response = await fetch(URL + "users");
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
    const response = await fetch(URL + "users", {
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
      const response = await fetch(URL + "domains", {
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

//return response objesi
export const fetchtasks = async () => {
  try {
    const response = await fetch(URL + "tasks");
    if( !response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error("Veri alma hatası:", error);
    throw error;
  }
};

/**
 * POST isteği ile yeni görev ekle
 * @param data - Eklenecek görev verisi
 * @returns Response objesi
 */
export const addTask = async (data: {
  title: string;
  description?: string;
  status: "todo" | "progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
}) => {
  try {
    const response = await fetch(URL + "tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error("Görev ekleme hatası:", error);
    throw error;
  }
};
  