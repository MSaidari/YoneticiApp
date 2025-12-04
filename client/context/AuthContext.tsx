import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AuthContext: Kullanıcının giriş durumunu GLOBAL olarak yöneten Context
 * 
 * React Context API nedir?
 * - Veriyi component ağacının her yerinden erişilebilir hale getirir
 * - Props drilling'den (her component'e props geçirme) kurtarır
 * - Örnek: Kullanıcı giriş yapınca, tüm uygulama bu durumu bilir
 */

// Kullanıcı bilgileri tipi
type User = {
  id: number;
  email: string;
  name: string;
  password: string;
  role: "admin" | "user";
  permissions?: {
    domains: boolean;
    tasks: boolean;
    passwords: boolean;
  };
};

// AuthContext'in sağlayacağı değerlerin tipi
type AuthContextType = {
  isLoggedIn: boolean;          // Kullanıcı giriş yaptı mı? (true/false)
  showSignup: boolean;          // Signup ekranı gösterilsin mi?
  currentUser: User | null;     // Şu anki kullanıcı bilgileri
  isAdmin: boolean;             // Kullanıcı admin mi?
  login: (user: User) => void;  // Giriş yapma fonksiyonu (kullanıcı bilgisiyle)
  logout: () => void;           // Çıkış yapma fonksiyonu
  goToSignup: () => void;       // Signup ekranına git
  goToLogin: () => void;        // Login ekranına git
};

// Context'i oluştur (başlangıç değerleriyle)
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  showSignup: false,
  currentUser: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  goToSignup: () => {},
  goToLogin: () => {},
});

// AuthProvider'ın alacağı props tipi
type AuthProviderProps = {
  children: ReactNode;  // İçine aldığı child component'ler
};

/**
 * AuthProvider: Tüm uygulamayı sarar ve auth state'ini yönetir
 * 
 * Nasıl çalışır?
 * 1. useState ile isLoggedIn state'ini tutar
 * 2. login() çağrılınca isLoggedIn'i true yapar
 * 3. logout() çağrılınca isLoggedIn'i false yapar
 * 4. Bu değerleri Context.Provider ile tüm child component'lere sunar
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // isLoggedIn state'i: Başlangıçta false (giriş yapılmamış)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // showSignup state'i: Signup ekranı gösterilsin mi? (Başlangıçta false - Login göster)
  const [showSignup, setShowSignup] = useState(false);
  
  // currentUser state'i: Şu anki kullanıcı bilgileri
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Login fonksiyonu: Kullanıcı bilgileriyle giriş yapar
  const login = async (user: User) => {
    console.log("Login - isLoggedIn: true, User:", user.email, "Role:", user.role);
    setCurrentUser(user);     // Kullanıcı bilgilerini kaydet
    setIsLoggedIn(true);      // State'i true yap → App.tsx otomatik Dashboard'a geçer
    
    // AsyncStorage'a kullanıcı bilgisini kaydet (background task için)
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      console.log('✅ Kullanıcı bilgisi AsyncStorage\'a kaydedildi');
    } catch (error) {
      console.error('❌ AsyncStorage kayıt hatası:', error);
    }
  };

  // Admin kontrolü: currentUser'dan hesaplanır
  const isAdmin = currentUser?.role === "admin";

  // Logout fonksiyonu: Kullanıcı çıkış yapınca çağrılır
  const logout = async () => {
    console.log("Logout - isLoggedIn: false");
    setCurrentUser(null);     // Kullanıcı bilgilerini temizle
    setIsLoggedIn(false);     // State'i false yap → App.tsx otomatik Login'e döner
    setShowSignup(false);     // Login ekranına dön
    
    // AsyncStorage'dan kullanıcı bilgisini temizle
    try {
      await AsyncStorage.removeItem('currentUser');
      console.log('✅ AsyncStorage temizlendi');
    } catch (error) {
      console.error('❌ AsyncStorage temizleme hatası:', error);
    }
  };
  
  // Signup ekranına git
  const goToSignup = () => {
    console.log("Signup ekranına geçiliyor");
    setShowSignup(true);
  };
  
  // Login ekranına git
  const goToLogin = () => {
    console.log("Login ekranına geçiliyor");
    setShowSignup(false);
  };

  // Provider ile tüm child component'lere değerleri sun
  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      showSignup, 
      currentUser,
      isAdmin,
      login, 
      logout, 
      goToSignup, 
      goToLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth: AuthContext'e erişmek için custom hook
 * 
 * Kullanımı:
 * const { isLoggedIn, login, logout } = useAuth();
 * 
 * Neden gerekli?
 * - Context'i doğrudan kullanmak yerine hook kullanmak daha temiz
 * - Hata kontrolü ekler (Provider dışında kullanılırsa hata verir)
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Eğer AuthProvider dışında kullanılırsa hata fırlat
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;  // { isLoggedIn, login, logout } döner
};