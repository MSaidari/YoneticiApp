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
import { fetchUsers, createUser } from "../Components/Api";

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
   * Api.tsx'teki fetchUsers fonksiyonunu kullanır
   */
  const handleLogin = async () => {
    try {
      // Api.tsx'ten fetchUsers ile tüm kullanıcıları al
      const response = await fetchUsers();
      const users = await response.json();
      console.log("Kullanıcılar alındı:", users.length, "kullanıcı");

      // Email ve password kontrolü
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (user) {
        console.log("Login başarılı!", user);
        setError("");
        login();
      } else {
        setError("Email veya şifre hatalı!");
        console.log("Login başarısız - Kullanıcı bulunamadı");
      }
    } catch (err) {
      setError("Bağlantı hatası! API çalışıyor mu?");
      console.error("API Hatası:", err);
    }
  };

  /**
   * handleSignup: Yeni kullanıcı kaydı yapan fonksiyon
   * Api.tsx'teki createUser fonksiyonunu kullanır
   */
  const handleSignup = async () => {
    // Validasyon kontrolü
    if (!email || !password || !confirmPassword) {
      setError("Tüm alanları doldurun!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    if (password.length < 3) {
      setError("Şifre en az 3 karakter olmalı!");
      return;
    }

    try {
      // Api.tsx'ten createUser ile yeni kullanıcı ekle
      await createUser({ email, password });
      console.log("Kayıt başarılı!");
      setError("");
      login(); // Otomatik giriş yap
    } catch (err) {
      setError("Kayıt başarısız!");
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
                            outputRange: [8, 170], // Sol: 8px padding, Sağ: (container genişliği/2) + 8px
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
    width: "50%", // Her tab butonunun genişliği kadar (flex:1 ile eşit paylaşılmış)
    backgroundColor: "#6366F1",
    borderRadius: 2,
    marginBottom: 24,
    marginLeft: -3, // TabContainer'ın padding'ini dengelemek için
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
