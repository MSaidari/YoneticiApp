import { Platform } from "react-native";

// API URL'ini belirle (Android emulator vs iOS simulator)
const URL = "https://my-json-server.typicode.com/MSaidari/YoneticiApp/";

// ============================================================================
// KULLANICI YÖNETİMİ
// ============================================================================

/**
 * Kullanıcı girişi için email ve password kontrolü
 * @param email - Kullanıcı email'i
 * @param password - Kullanıcı şifresi
 * @returns Kullanıcı verisi veya null
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(URL + "users");
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const users = await response.json();
    const user = users.find(
      (u: any) => u.email === email && u.password === password
    );
    return user || null;
  } catch (error) {
    console.error("Giriş hatası:", error);
    throw error;
  }
};

// ============================================================================
// GENEL CRUD FONKSİYONLARI
// ============================================================================

/**
 * FETCH - GET isteği ile veri al (kullanıcı tabanlı)
 * @param endpoint - API endpoint (örn: "tasks", "domains", "passwords")
 * @param userId - Kullanıcı ID'si (opsiyonel, verilmezse tüm veriler gelir)
 * @returns Response objesi
 */
export const fetchData = async (endpoint: string, userId?: number | string) => {
  try {
    let url = URL + endpoint;
    if (userId) {
      url += `?userId=${userId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`${endpoint} veri alma hatası:`, error);
    throw error;
  }
};

/**
 * CREATE - POST isteği ile yeni veri ekle (otomatik userId eklenir)
 * @param endpoint - API endpoint (örn: "tasks", "domains", "passwords")
 * @param data - Eklenecek veri objesi
 * @param userId - Kullanıcı ID'si (otomatik eklenir)
 * @returns Response objesi
 */
export const createData = async (
  endpoint: string,
  data: any,
  userId?: number | string
) => {
  try {
    const dataWithUser = userId ? { ...data, userId } : data;
    const response = await fetch(URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataWithUser),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`${endpoint} veri ekleme hatası:`, error);
    throw error;
  }
};

/**
 * UPDATE - PUT isteği ile mevcut veriyi güncelle
 * @param endpoint - API endpoint (örn: "tasks", "domains", "passwords")
 * @param id - Güncellenecek verinin ID'si
 * @param data - Güncelleme verisi
 * @returns Response objesi
 */
export const updateData = async (
  endpoint: string,
  id: number | string,
  data: any
) => {
  try {
    const response = await fetch(URL + `${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`${endpoint} veri güncelleme hatası:`, error);
    throw error;
  }
};

/**
 * DELETE - DELETE isteği ile veri sil
 * @param endpoint - API endpoint (örn: "tasks", "domains", "passwords")
 * @param id - Silinecek verinin ID'si
 * @returns Response objesi
 */
export const deleteData = async (endpoint: string, id: number | string) => {
  try {
    const response = await fetch(URL + `${endpoint}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`${endpoint} veri silme hatası:`, error);
    throw error;
  }
};

// ============================================================================
// ÖZEL FONKSİYONLAR (Geriye uyumluluk + Kullanıcı tabanlı)
// ============================================================================

// Users
export const fetchUsers = () => fetchData("users");
export const createUser = (data: {
  email: string;
  password: string;
  name?: string;
}) => createData("users", data);

// Tasks
export const fetchtasks = (userId?: number | string) =>
  fetchData("tasks", userId);
export const addTask = (
  data: {
    title: string;
    description?: string;
    status: "todo" | "progress" | "done";
    priority: "low" | "medium" | "high";
    due_date: string;
  },
  userId?: number | string
) => createData("tasks", data, userId);
export const deletetask = (id: number | string) => deleteData("tasks", id);
export const edittask = (
  id: number | string,
  data: {
    title?: string;
    description?: string;
    status?: "todo" | "progress" | "done";
    priority?: "low" | "medium" | "high";
    due_date?: string;
  }
) => updateData("tasks", id, data);

// Domains
export const fetchdomanins = (userId?: number | string) =>
  fetchData("domains", userId);
export const addDomain = (
  data: {
    domain: string;
    provider: string;
    date: string | any;
  },
  userId?: number | string
) => createData("domains", data, userId);
export const deletedomain = (id: number | string) => deleteData("domains", id);

// Passwords
export const fetchPasswords = (userId?: number | string) =>
  fetchData("passwords", userId);
export const addPassword = (
  data: {
    sunucu: string;
    user_code: string;
    password: string;
    hour_remaining: number | any;
  },
  userId?: number | string
) => createData("passwords", data, userId);
export const deletePassword = (id: number | string) =>
  deleteData("passwords", id);

// Default export
export default edittask;
