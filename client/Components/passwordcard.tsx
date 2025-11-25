import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * PasswordCard: Şifre bilgilerini gösteren kart component'i
 * 
 * Props:
 * - id: Şifre ID'si
 * - server: Sunucu/Servis adı (örn: "google.com Admin Panel")
 * - username: Kullanıcı adı
 * - password: Şifre
 * - createdAt: Oluşturma tarihi (opsiyonel)
 * - onEdit: Düzenleme butonu fonksiyonu (opsiyonel)
 * - onDelete: Silme butonu fonksiyonu (opsiyonel)
 * - onPress: Kart tıklama fonksiyonu (opsiyonel)
 */

interface PasswordCardProps {
  id: number | string;
  server: string;
  username: string;
  password: string;
  hour: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  id,
  server,
  username,
  password,
  createdAt,
  onEdit,
  onDelete,
  onPress,
}) => {
  // Şifre görünürlük durumu (gizli/göster)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  /**
   * handleCopyPassword: Şifreyi panoya kopyalar
   */
  const handleCopyPassword = () => {
    // React Native'de Clipboard API kullanılır
    // import { Clipboard } from 'react-native'; gerekir
    console.log("Şifre kopyalandı:", password);
    // Clipboard.setString(password);
    // Alert.alert("Başarılı", "Şifre panoya kopyalandı");
  };

  /**
   * handleCopyUsername: Kullanıcı adını panoya kopyalar
   */
  const handleCopyUsername = () => {
    console.log("Kullanıcı adı kopyalandı:", username);
    // Clipboard.setString(username);
    // Alert.alert("Başarılı", "Kullanıcı adı panoya kopyalandı");
  };

  // Card Container: Eğer onPress varsa TouchableOpacity, yoksa View
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Sol tarafta servis icon'u */}
      <View style={styles.iconContainer}>
        <Ionicons name="key" size={24} color="#6366F1" />
      </View>

      {/* Orta kısım: Servis adı, kullanıcı adı, şifre */}
      <View style={styles.content}>
        {/* Servis Adı */}
        <Text style={styles.serverName} numberOfLines={1}>
          {server}
        </Text>

        {/* Kullanıcı Adı */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={1}>
            {username}
          </Text>
          <TouchableOpacity
            onPress={handleCopyUsername}
            style={styles.copyButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="copy-outline" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Şifre */}
        <View style={styles.infoRow}>
          <Ionicons name="lock-closed-outline" size={14} color="#64748B" />
          <Text style={styles.passwordText} numberOfLines={1}>
            {isPasswordVisible ? password : "••••••••"}
          </Text>
          
          {/* Şifre Görünürlük Toggle */}
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={16}
              color="#64748B"
            />
          </TouchableOpacity>

          {/* Şifre Kopyala */}
          <TouchableOpacity
            onPress={handleCopyPassword}
            style={styles.copyButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="copy-outline" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Tarih (varsa) */}
        {createdAt && (
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
            <Text style={styles.dateText}>
              {new Date(createdAt).toLocaleDateString("tr-TR")}
            </Text>
          </View>
        )}
      </View>

      {/* Sağ tarafta action butonları */}
      {(onEdit || onDelete) && (
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
              activeOpacity={0.6}
            >
              <Ionicons name="create-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
              activeOpacity={0.6}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  // Card: Ana kart container
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "flex-start",
  },
  // Icon Container: Sol taraftaki icon
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  // Content: Orta kısım (servis, username, password)
  content: {
    flex: 1,
    gap: 8,
  },
  serverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  // Info Row: Username ve Password satırları
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
  },
  passwordText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    fontFamily: "monospace", // Şifre için monospace font
  },
  // Buttons: Copy, Eye butonları
  copyButton: {
    padding: 4,
  },
  eyeButton: {
    padding: 4,
  },
  // Date
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  // Action Buttons: Edit/Delete butonları
  actionButtons: {
    flexDirection: "column",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
});
