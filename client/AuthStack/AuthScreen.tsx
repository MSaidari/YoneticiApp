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
import { loginUser, createUser, fetchUsers, updateData } from "../Components/Api";
import { send, EmailJSResponseStatus } from '@emailjs/react-native';
import * as  MailComposer from 'expo-mail-composer';

export const AuthScreen = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  
  // Şifre sıfırlama state'leri
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

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
   * Api.tsx'teki loginUser fonksiyonunu kullanır
   */
  const handleLogin = async () => {
    try {
      // Api.tsx'ten loginUser ile giriş kontrolü yap
      const user = await loginUser(email, password);

      if (user) {
        console.log("Login başarılı!", user);
        setError("");
        login(user); // Kullanıcı bilgilerini AuthContext'e aktar
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
    if (!email || !password || !confirmPassword || !userName) {
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
      // Önce aynı email ile kayıtlı kullanıcı var mı kontrol et
      const usersResponse = await fetchUsers();
      const users = await usersResponse.json();
      const existingUser = users.find((u: any) => u.email === email);

      if (existingUser) {
        setError("Bu email adresi zaten kayıtlı!");
        return;
      }

      // Api.tsx'ten createUser ile yeni kullanıcı ekle
      const response = await createUser({ 
        email, 
        password, 
        name: userName,
        role: "user",  // Yeni kullanıcılar varsayılan olarak 'user' rolü
        permissions: {
          domains: false,
          tasks: false,
          passwords: false
        }
      });
      const userData = await response.json();
      console.log("Kayıt başarılı!");
      setError("");
      // Otomatik giriş yap - yeni kullanıcı bilgileriyle
      const newUser = {
        id: userData.id,
        email: email,
        name: userName,
        password: password,
        role: "user" as const  // Yeni kullanıcılar varsayılan olarak 'user' rolü
      };
      login(newUser);
    } catch (err) {
      setError("Kayıt başarısız!");
      console.error("API Hatası:", err);
    }
  };

  /**
   * sendEmailCode: EmailJS ile React Native'den email gönderme
   */
  const sendEmailCode = async (email: string, code: string, userName: string) => {
    try {
      console.log('📧 EmailJS ile email gönderiliyor...', { email, code, userName });
      
      // EmailJS React Native paketi ile gönder
      await send(
        'service_3opw15v', // EmailJS Service ID'nizi buraya yazın
        'template_vi8z7df', // EmailJS Template ID'nizi buraya yazın
        {
          to_email: email,
          to_name: userName,
          verification_code: code,
          subject: "YonetimApp - Şifre Sıfırlama Kodu",
        },
        {
          publicKey: 'jJcyM6dYafOOHXD7C', // EmailJS Public Key'inizi buraya yazın
        }
      );

      console.log('✅ Email başarıyla gönderildi!');
      return true;

    } catch (error: any) {
      console.error('❌ EmailJS hatası:', error);
      console.log('Hata detayı:', error.text || error.message);
      return false;
    }
  };

  /**
   * handleForgotPassword: Şifremi unuttum butonuna basıldığında çalışır
   */
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError("E-posta adresinizi girin!");
      return;
    }

    // Önce email'in sistemde kayıtlı olup olmadığını kontrol et
    try {
      const usersResponse = await fetchUsers();
      const users = await usersResponse.json();
      const user = users.find((u: any) => u.email === resetEmail);

      if (!user) {
        setError("Bu email adresi sistemde kayıtlı değil!");
        return;
      }

      // 6 haneli doğrulama kodu oluştur
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      // Email göndermeyi dene
      console.log('🚀 Email gönderme işlemi başlatılıyor...');
      const emailSent = await sendEmailCode(resetEmail, code, user.name);
      
      if (emailSent) {
        alert(`✅ Doğrulama kodu ${resetEmail} adresine gönderildi!`);
        console.log(`✅ Email başarıyla gönderildi: ${resetEmail}`);
      } else {
        // Email gönderilemezse konsol mesajı ver
        console.log(`⚠️ Email gönderilemedi - EmailJS ayarlarını kontrol edin`);
        alert(`⚠️ Email gönderilemedi!\n\nGeliştirme kodu: ${code}\n\nKonsolu kontrol edin.`);
      }
      
      setShowForgotPassword(false);
      setShowCodeVerification(true);
      setError("");
      
    } catch (error) {
      setError("Bağlantı hatası occurred!");
      console.error("Email kontrol hatası:", error);
    }
  };

  /**
   * handleVerifyCode: Doğrulama kodunu kontrol eder
   */
  const handleVerifyCode = () => {
    if (!verificationCode) {
      setError("Doğrulama kodunu girin!");
      return;
    }
    
    if (verificationCode !== generatedCode) {
      setError("Doğrulama kodu hatalı!");
      return;
    }
    
    setShowCodeVerification(false);
    setShowPasswordReset(true);
    setError("");
  };

  /**
   * handlePasswordReset: Şifre sıfırlama işlemi
   */
  const handlePasswordReset = async () => {
    if (!newPassword || !newPasswordConfirm) {
      setError("Tüm alanları doldurun!");
      return;
    }
    
    if (newPassword !== newPasswordConfirm) {
      setError("Yeni şifreler eşleşmiyor!");
      return;
    }
    
    if (newPassword.length < 3) {
      setError("Yeni şifre en az 3 karakter olmalı!");
      return;
    }
    
    try {
      // Önce kullanıcıyı bul
      const usersResponse = await fetchUsers();
      const users = await usersResponse.json();
      const user = users.find((u: any) => u.email === resetEmail);

      if (!user) {
        setError("Kullanıcı bulunamadı!");
        return;
      }

      // Şifreyi veritabanında güncelle
      const updateResponse = await updateData("users", user.id, {
        password: newPassword,
      });

      if (updateResponse.ok) {
        alert("Şifre başarıyla değiştirildi!");
        console.log("✅ Şifre veritabanında güncellendi:", { userId: user.id, email: resetEmail });
        
        // Tüm modal'ları kapat ve formu temizle
        resetForgotPasswordStates();
        setError("");
      } else {
        throw new Error("Şifre güncellenemedi");
      }
      
    } catch (err) {
      setError("Şifre değiştirme işlemi başarısız!");
      console.error("Şifre değiştirme hatası:", err);
    }
  };

  /**
   * Şifre sıfırlama state'lerini temizle
   */
  const resetForgotPasswordStates = () => {
    setShowForgotPassword(false);
    setShowCodeVerification(false);
    setShowPasswordReset(false);
    setResetEmail("");
    setVerificationCode("");
    setGeneratedCode("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  const switchTab = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUserName("");
    resetForgotPasswordStates();
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
                      Giriş Yap
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
                      Kayıt Ol
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
                    {activeTab === "signin" ? "Hoş Geldiniz" : "Hesap Oluştur"}
                  </Text>
                  <Text style={styles.subtitle}>
                    {activeTab === "signin"
                      ? "Devam etmek için giriş yapın"
                      : "Başlamak için kayıt olun"}
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
                      placeholder="E-posta"
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
                      placeholder="Şifre"
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
                    <>
                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="#10B981"
                          style={styles.icon}
                        />
                        <TextInput
                          placeholder="Kullanıcı Adı"
                          placeholderTextColor="#94A3B8"
                          style={styles.input}
                          value={userName}
                          onChangeText={setUserName}
                          editable={true}
                          selectTextOnFocus={true}
                        />
                      </View>
                      
                      <View style={styles.inputWrapper}>
                        <AntDesign
                          name="lock"
                          size={20}
                          color="#10B981"
                          style={styles.icon}
                        />
                        <TextInput
                          placeholder="Şifre Onay"
                          placeholderTextColor="#94A3B8"
                          style={styles.input}
                          secureTextEntry
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          editable={true}
                          selectTextOnFocus={true}
                        />
                      </View>
                    </>
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
                    {activeTab === "signin" ? "Giriş Yap" : "Kayıt Ol"}
                  </Text>
                </TouchableOpacity>

                {/* Forgot Password Link (Only for Sign In) */}
                <View style={{ alignItems: "center" }}>
                  {activeTab === "signin" && (
                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={() => {
                      setShowForgotPassword(true);
                      setError("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                  </TouchableOpacity>
                )}
                </View>
                
              </View>
            </View>
          </ScrollView>

          {/* Email Input Modal for Forgot Password */}
          {showForgotPassword && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Şifre Sıfırlama</Text>
                <Text style={styles.modalSubtitle}>
                  E-posta adresinizi girin
                </Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="E-posta"
                  placeholderTextColor="#94A3B8"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                      setError("");
                    }}
                  >
                    <Text style={styles.modalCancelText}>İptal</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.modalConfirmText}>Kod Gönder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Code Verification Modal */}
          {showCodeVerification && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Doğrulama Kodu</Text>
                <Text style={styles.modalSubtitle}>
                  {resetEmail} adresine gönderilen 6 haneli kodu girin
                </Text>
                
                <TextInput
                  style={styles.codeInput}
                  placeholder="123456"
                  placeholderTextColor="#94A3B8"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      resetForgotPasswordStates();
                      setError("");
                    }}
                  >
                    <Text style={styles.modalCancelText}>İptal</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleVerifyCode}
                  >
                    <Text style={styles.modalConfirmText}>Doğrula</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Password Reset Modal */}
          {showPasswordReset && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                <Text style={styles.modalSubtitle}>
                  Yeni şifrenizi belirleyin
                </Text>
                
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Yeni Şifre"
                  placeholderTextColor="#94A3B8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Yeni Şifre Onay"
                  placeholderTextColor="#94A3B8"
                  value={newPasswordConfirm}
                  onChangeText={setNewPasswordConfirm}
                  secureTextEntry
                />
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      resetForgotPasswordStates();
                      setError("");
                    }}
                  >
                    <Text style={styles.modalCancelText}>İptal</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handlePasswordReset}
                  >
                    <Text style={styles.modalConfirmText}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
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
    marginBottom: 12,
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
  quickLoginButton: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981",
    flexDirection: "row",
    justifyContent: "center",
  },
  quickLoginButtonText: {
    color: "#10B981",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    color: "#2563EB", // Küçük mavi renk
    fontSize: 14,
    textDecorationLine: "underline",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  codeInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 8,
    color: "#1F2937",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  modalCancelText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
