import {
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const Signup = () => {
  const { login, goToLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    // Validasyon
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
      // Yeni kullanıcı ekle
      const API_URL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3001/users'
        : 'http://localhost:3001/users';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        console.log("Kayıt başarılı!");
        setError("");
        login(); // Kayıt olduktan sonra giriş yap
      } else {
        setError("Kayıt başarısız!");
      }
    } catch (err) {
      setError("Bağlantı hatası!");
      console.error("API Hatası:", err);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground 
          style={styles.container} 
          source={require("../assets/waterfall-9865189_1280.jpg")}
          resizeMode="cover"
        >
          <StatusBar barStyle="light-content" />

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.overlay}>
              
              <View style={styles.card}>
                
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Sign up to get started</Text>
                </View>

                {/* Input Fields */}
                <View style={styles.inputsContainer}>
                  
                  {/* Email Input */}
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#10B981"
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
                      color="#10B981"
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

                  {/* Confirm Password Input */}
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

                  {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                  ) : null}
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => {
                    goToLogin();
                    console.log("Login ekranına dönülüyor");
                  }}>
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
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
  signupButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#64748B",
  },
  loginLink: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "bold",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
