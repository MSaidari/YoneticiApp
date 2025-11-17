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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { style } from "../Styles/style";

export const Login = () => {
  const { login, goToSignup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      // API'den kullanıcıları al
      // Android Emulator için 10.0.2.2, iOS Simulator için localhost
      // Fiziksel cihaz için bilgisayarın IP'sini kullan (örn: 192.168.1.x)
      const API_URL =
        Platform.OS === "android"
          ? "http://10.0.2.2:3001/users" // Android Emulator
          : "http://localhost:3001/users"; // iOS Simulator

      console.log("API'ye bağlanılıyor:", API_URL);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const users = await response.json();
      console.log("Kullanıcılar alındı:", users.length, "kullanıcı");

      // Email ve password kontrolü
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (user) {
        console.log("Login başarılı!", user);
        setError("");
        login(); // AuthContext'teki login() → Dashboard'a geç
      } else {
        setError("Email veya şifre hatalı!");
        console.log("Login başarısız - Kullanıcı bulunamadı");
      }
    } catch (err) {
      setError("Bağlantı hatası! API çalışıyor mu?");
      console.error("API Hatası:", err);
      console.log("API'ye erişilemiyor. Emulator için 10.0.2.2:3001 kullanın");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/waterfall-9865189_1280.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        <View style={{ flexDirection: "row", backgroundColor:"#eaeaea", width:250, height:70,borderRadius:30,elevation:10,marginBottom:-65 }}>

        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: -20,elevation:10,gap:20 }}>
          <TouchableOpacity
            style={styles.topcard}
            onPress={() => {
              goToSignup();
              console.log(
                "Signup butonu tıklandı - Signup ekranına yönlendiriliyor"
              );
            }}
          ></TouchableOpacity>
          <TouchableOpacity
            style={styles.topcard}
            onPress={() => {
              goToSignup();
              console.log(
                "Signup butonu tıklandı - Signup ekranına yönlendiriliyor"
              );
            }}
          ></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#6366F1"
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
              />
            </View>

            <View style={styles.inputWrapper}>
              <AntDesign
                name="lock"
                size={20}
                color="#6366F1"
                style={styles.icon}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                goToSignup();
                console.log(
                  "Signup butonu tıklandı - Signup ekranına yönlendiriliyor"
                );
              }}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  topcard:{
    backgroundColor: "gray", width: 100, height: 50,borderRadius:30,top:5
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  },
  loginButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#64748B",
  },
  signupLink: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "bold",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
