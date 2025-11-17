import React, { createContext, useState, useContext, ReactNode } from 'react';

/**
 * AuthContext: Kullanıcının giriş durumunu GLOBAL olarak yöneten Context
 * 
 * React Context API nedir?
 * - Veriyi component ağacının her yerinden erişilebilir hale getirir
 * - Props drilling'den (her component'e props geçirme) kurtarır
 * - Örnek: Kullanıcı giriş yapınca, tüm uygulama bu durumu bilir
 */

// AuthContext'in sağlayacağı değerlerin tipi
type AuthContextType = {
  isLoggedIn: boolean;     // Kullanıcı giriş yaptı mı? (true/false)
  showSignup: boolean;     // Signup ekranı gösterilsin mi?
  login: () => void;       // Giriş yapma fonksiyonu
  logout: () => void;      // Çıkış yapma fonksiyonu
  goToSignup: () => void;  // Signup ekranına git
  goToLogin: () => void;   // Login ekranına git
};

// Context'i oluştur (başlangıç değerleriyle)
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  showSignup: false,
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

  // Login fonksiyonu: Kullanıcı giriş yapınca çağrılır
  const login = () => {
    console.log("Login - isLoggedIn: true");
    setIsLoggedIn(true);  // State'i true yap → App.tsx otomatik Dashboard'a geçer
  };

  // Logout fonksiyonu: Kullanıcı çıkış yapınca çağrılır
  const logout = () => {
    console.log("Logout - isLoggedIn: false");
    setIsLoggedIn(false);  // State'i false yap → App.tsx otomatik Login'e döner
    setShowSignup(false);  // Login ekranına dön
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
    <AuthContext.Provider value={{ isLoggedIn, showSignup, login, logout, goToSignup, goToLogin }}>
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