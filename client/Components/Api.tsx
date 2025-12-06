import { Platform } from "react-native";

// API URL'ini belirle (Android emulator vs iOS simulator)
const URL =
  "https://my-json-server.typicode.com/MSaidari/ProjeYonetici/"; // GitHub repo: ProjeYonetici

// "https://my-json-server.typicode.com/MSaidari/YoneticiApp/"
// "android"
//    Platform.OS === "android"
//    ? "http://10.0.2.2:3001/" // Android için özel IP
//    : "http://localhost:3001/";"============================================================================
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
 * fetchDataWithUserInfo - Veriyi kullanıcı bilgileriyle birlikte getirir
 * @param endpoint - API endpoint
 * @param userId - Kullanıcı ID (admin için undefined olabilir)
 * @param isAdmin - Admin kullanıcı mı?
 * @param hasPermission - Kullanıcının bu veriye erişim yetkisi var mı?
 * @returns Kullanıcı bilgileriyle zenginleştirilmiş veri
 */
export const fetchDataWithUserInfo = async (
  endpoint: string,
  userId?: number | string,
  isAdmin: boolean = false,
  hasPermission: boolean = false
) => {
  try {
    // Admin ise veya yetki varsa tüm verileri getir, yoksa sadece kullanıcınınkileri
    const shouldFetchAll = isAdmin || hasPermission;
    const dataResponse = await fetchData(endpoint, shouldFetchAll ? undefined : userId);
    const data = await dataResponse.json();
    
    // Eğer yetki varsa ama admin değilse, kullanıcı bilgisi EKLEMEDEN dön
    if (hasPermission && !isAdmin) {
      return data;
    }
    
    // Eğer admin değilse ve yetki yoksa, direkt dön
    if (!isAdmin) {
      return data;
    }
    
    // SADECE Admin ise, kullanıcı bilgilerini ekle
    const usersResponse = await fetchData("users");
    const users = await usersResponse.json();
    
    // Her veriye kullanıcı bilgisini ekle
    const enrichedData = data.map((item: any) => {
      const user = users.find((u: any) => u.id == item.userId);
      return {
        ...item,
        userName: user?.name || "Bilinmeyen Kullanıcı"
      };
    });
    
    return enrichedData;
  } catch (error) {
    console.error(`${endpoint} veri alma hatası:`, error);
    throw error;
  }
};

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
 * UPDATE - PATCH isteği ile mevcut veriyi güncelle
 * @param endpoint - API endpoint (örn: "tasks", "domains", "passwords")
 * @param id - Güncellenecek verinin ID'si
 * @param data - Güncelleme verisi (sadece değişen alanlar)
 * @returns Response objesi
 */
export const updateData = async (
  endpoint: string,
  id: number | string,
  data: any
) => {
  try {
    const response = await fetch(URL + `${endpoint}/${id}`, {
      method: "PATCH",
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
  role?: string;
  permissions?: {
    domains: boolean;
    tasks: boolean;
    passwords: boolean;
  };
}) => createData("users", data);
export const updateUserPermissions = (
  userId: number | string,
  permissions: {
    domains?: boolean;
    tasks?: boolean;
    passwords?: boolean;
  }
) => updateData("users", userId, { permissions });

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
    createdAt: string;
  },
  userId?: number | string
) => createData("passwords", data, userId);
export const deletePassword = (id: number | string) =>
  deleteData("passwords", id);

// Notes
export const fetchNotes = (userId?: number | string) =>
  fetchData("notes", userId);
export const addNote = (
  data: {
    title: string;
    content: string;
    createdAt: string;
  },
  userId?: number | string
) => createData("notes", data, userId);
export const updateNote = (
  id: number | string,
  data: {
    title?: string;
    content?: string;
  }
) => updateData("notes", id, data);
export const deleteNote = (id: number | string) => deleteData("notes", id);

// Default export
export default edittask;
