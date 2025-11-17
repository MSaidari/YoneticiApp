import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const AuthScreen = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Animasyon için
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === "signin" ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [activeTab]);

  /**
   * handleLogin: Kullanıcı girişi yapan fonksiyon
   * 
   * Yapılan İşlemler:
   * 1. API URL'ini belirler (Android emulator vs iOS simulator)
   * 2. API'den tüm kullanıcıları alır (GET isteği)
   * 3. Email ve password kontrolü yapar
   * 4. Başarılıysa login() fonksiyonunu çağırır
   */
  const handleLogin = async () => {
    try {
      // API URL Belirleme
      // Android Emulator: localhost çalışmaz, 10.0.2.2 kullanmalıyız
      // 10.0.2.2 → Android emulator'ün host makineye erişmek için kullandığı özel IP
      // iOS Simulator: localhost doğrudan çalışır
      const API_URL =
        Platform.OS === "android"
          ? "http://10.0.2.2:3001/users"  // Android için özel IP
          : "http://localhost:3001/users"; // iOS için localhost

      console.log("API'ye bağlanılıyor:", API_URL);
      
      // API'ye GET İsteği Gönder
      // fetch(): JavaScript'in HTTP istekleri için kullandığı fonksiyon
      // await: İstek tamamlanana kadar bekle (async/await pattern)
      const response = await fetch(API_URL);

      // HTTP Durum Kodu Kontrolü
      // response.ok: HTTP durum kodu 200-299 arasındaysa true
      // Örnek: 200 (OK), 404 (Not Found), 500 (Server Error)
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // JSON Verisini Parse Et
      // response.json(): API'den gelen JSON string'ini JavaScript objesine çevirir
      // db.json'daki users array'ini alır
      const users = await response.json();
      console.log("Kullanıcılar alındı:", users.length, "kullanıcı");

      // Kullanıcı Arama
      // users.find(): Array'de koşulu sağlayan ilk elemanı bulur
      // Email VE password eşleşmesi gerekiyor
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      // Giriş Sonucu Kontrolü
      if (user) {
        // Kullanıcı bulundu → Giriş başarılı
        console.log("Login başarılı!", user);
        setError("");  // Hata mesajını temizle
        login();        // AuthContext'teki login() → isLoggedIn = true → Dashboard'a geç
      } else {
        // Kullanıcı bulunamadı → Email veya şifre yanlış
        setError("Email veya şifre hatalı!");
        console.log("Login başarısız - Kullanıcı bulunamadı");
      }
    } catch (err) {
      // Hata Yakalama
      // Olası hatalar:
      // 1. API çalışmıyor (json-server başlatılmamış)
      // 2. Network hatası
      // 3. Yanlış URL (10.0.2.2 yerine localhost kullanılmış)
      setError("Bağlantı hatası! API çalışıyor mu?");
      console.error("API Hatası:", err);
      console.log("API'ye erişilemiyor. Emulator için 10.0.2.2:3001 kullanın");
    }
  };

  /**
   * handleSignup: Yeni kullanıcı kaydı yapan fonksiyon
   * 
   * Yapılan İşlemler:
   * 1. Form validasyonu (boş alan, şifre eşleşmesi, şifre uzunluğu)
   * 2. API'ye yeni kullanıcı ekler (POST isteği)
   * 3. Başarılıysa otomatik giriş yapar
   */
  const handleSignup = async () => {
    // Validasyon 1: Boş Alan Kontrolü
    // Tüm alanlar dolu mu kontrol et
    if (!email || !password || !confirmPassword) {
      setError("Tüm alanları doldurun!");
      return;  // Fonksiyondan çık, API isteği gönderme
    }

    // Validasyon 2: Şifre Eşleşme Kontrolü
    // Password ve Confirm Password aynı mı?
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    // Validasyon 3: Şifre Uzunluk Kontrolü
    // Minimum 3 karakter (gerçek uygulamada daha fazla olmalı)
    if (password.length < 3) {
      setError("Şifre en az 3 karakter olmalı!");
      return;
    }

    try {
      // API URL Belirleme (Login ile aynı mantık)
      const API_URL =
        Platform.OS === "android"
          ? "http://10.0.2.2:3001/users"  // Android Emulator
          : "http://localhost:3001/users"; // iOS Simulator

      // API'ye POST İsteği Gönder
      // POST: Yeni veri eklemek için kullanılan HTTP metodu
      // GET: Veri okumak için (handleLogin'de kullandık)
      // PUT: Veri güncellemek için
      // DELETE: Veri silmek için
      const response = await fetch(API_URL, {
        method: "POST",  // HTTP metodu: POST (yeni kullanıcı ekle)
        
        // Headers: İstek başlıkları
        // Content-Type: Gönderilen verinin formatını belirtir
        // application/json: JSON formatında veri gönderiyoruz
        headers: {
          "Content-Type": "application/json",
        },
        
        // Body: Gönderilecek veri
        // JSON.stringify(): JavaScript objesini JSON string'ine çevirir
        // { email: "test@test.com" } → '{"email":"test@test.com"}'
        body: JSON.stringify({
          email: email,      // Kullanıcının girdiği email
          password: password, // Kullanıcının girdiği password
          // Not: id otomatik json-server tarafından oluşturulur
        }),
      });

      // Kayıt Sonucu Kontrolü
      if (response.ok) {
        // Kayıt başarılı → db.json'a yeni kullanıcı eklendi
        console.log("Kayıt başarılı!");
        setError("");  // Hata mesajını temizle
        login();        // Otomatik giriş yap (isLoggedIn = true)
      } else {
        // Kayıt başarısız → API hata döndü (örn: duplicate email)
        setError("Kayıt başarısız!");
      }
    } catch (err) {
      // Hata Yakalama
      // API'ye erişim hatası (network, server kapalı vb.)
      setError("Bağlantı hatası!");
      console.error("API Hatası:", err);
    }
  };

  const switchTab = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("../assets/waterfall-9865189_1280.jpg")}
          style={styles.container}
          resizeMode="cover"
        >
          <StatusBar barStyle="light-content" />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.overlay}>
              <View style={styles.card}>
                
                {/* Tab Buttons */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      activeTab === "signin" && styles.tabButtonActive,
                    ]}
                    onPress={() => switchTab("signin")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeTab === "signin" && styles.tabButtonTextActive,
                      ]}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      activeTab === "signup" && styles.tabButtonActive,
                    ]}
                    onPress={() => switchTab("signup")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeTab === "signup" && styles.tabButtonTextActive,
                      ]}
                    >
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Active Indicator Line */}
                <Animated.View
                  style={[
                    styles.activeIndicator,
                    {
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 180], // Adjust based on your button width
                          }),
                        },
                      ],
                    },
                  ]}
                />

                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {activeTab === "signin" ? "Welcome Back" : "Create Account"}
                  </Text>
                  <Text style={styles.subtitle}>
                    {activeTab === "signin"
                      ? "Sign in to continue"
                      : "Sign up to get started"}
                  </Text>
                </View>

                {/* Input Fields */}
                <View style={styles.inputsContainer}>
                  {/* Email Input */}
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={activeTab === "signin" ? "#6366F1" : "#10B981"}
                      style={styles.icon}
                    />
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      editable={true}
                      selectTextOnFocus={true}
                    />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputWrapper}>
                    <AntDesign
                      name="lock"
                      size={20}
                      color={activeTab === "signin" ? "#6366F1" : "#10B981"}
                      style={styles.icon}
                    />
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      editable={true}
                      selectTextOnFocus={true}
                    />
                  </View>

                  {/* Confirm Password Input (Only for Signup) */}
                  {activeTab === "signup" && (
                    <View style={styles.inputWrapper}>
                      <AntDesign
                        name="lock"
                        size={20}
                        color="#10B981"
                        style={styles.icon}
                      />
                      <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={true}
                        selectTextOnFocus={true}
                      />
                    </View>
                  )}

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    activeTab === "signup" && styles.submitButtonSignup,
                  ]}
                  onPress={activeTab === "signin" ? handleLogin : handleSignup}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {activeTab === "signin" ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  tabButtonTextActive: {
    color: "#1E293B",
    fontWeight: "bold",
  },
  activeIndicator: {
    height: 3,
    width: 160,
    backgroundColor: "#6366F1",
    borderRadius: 2,
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
  },
  inputsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    padding: 0,
    minHeight: 20,
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonSignup: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
