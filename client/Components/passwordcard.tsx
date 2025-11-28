import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';

/**
 * PasswordCard: Destek şifre bilgilerini gösteren kart component'i
 * 
 * Kütüphaneler:
 * - React: Component yapısı ve useState hook'u için
 * - react-native: View, Text, TouchableOpacity, StyleSheet gibi temel componentler
 * - @expo/vector-icons: Ionicons icon seti
 * - expo-clipboard: Panoya kopyalama işlemi için
 * 
 * Özellikler:
 * - Şifre görünürlük toggle'ı (göz ikonu ile)
 * - Sunucu, user_code ve şifre için kopyalama butonu
 * - Kalan saat bilgisi gösterimi (renkli badge ile)
 * 
 * Props:
 * - id: Şifre ID'si
 * - server: Sunucu/Servis adı (örn: "google.com Admin Panel")
 * - user_code: Kullanıcı kodu
 * - password: Şifre
 * - hour: Kalan saat sayısı
 * - onEdit: Düzenleme butonu fonksiyonu (opsiyonel)
 * - onDelete: Silme butonu fonksiyonu (opsiyonel)
 * - onPress: Kart tıklama fonksiyonu (opsiyonel)
 */

interface PasswordCardProps {
  id: number | string;
  server: string;
  user_code: string;
  password: string;
  hour: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  id,
  server,
  user_code,
  password,
  hour,
  onEdit,
  onDelete,
  onPress,
}) => {
  // Şifre görünürlük durumu (gizli/göster)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  /**
   * handleCopyToClipboard: Verilen metni panoya kopyalar
   * @param text - Kopyalanacak metin
   * @param label - Kullanıcıya gösterilecek etiket (örn: "Sunucu", "Şifre")
   */
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      Alert.alert("Hata", "Kopyalama işlemi başarısız oldu");
    }
  };

  /**
   * getHourStyle: Kalan saate göre renk döndürür
   * 24+ saat: Yeşil
   * 12-24 saat: Sarı
   * 0-12 saat: Kırmızı (kritik)
   */
  const getHourStyle = () => {
    if (hour >= 24) {
      return { color: "#10B981", backgroundColor: "#D1FAE5" }; // Yeşil
    } else if (hour >= 12) {
      return { color: "#F59E0B", backgroundColor: "#FEF3C7" }; // Sarı
    } else {
      return { color: "#EF4444", backgroundColor: "#FEE2E2" }; // Kırmızı
    }
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

      {/* Orta kısım: Sunucu, user_code, şifre, kalan saat */}
      <View style={styles.content}>
        {/* Sunucu Adı */}
        <View style={styles.infoRow}>
          <Ionicons name="server-outline" size={14} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={1}>
            {server}
          </Text>
          <TouchableOpacity
            onPress={() => handleCopyToClipboard(server, "Sunucu")}
            style={styles.copyButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="copy-outline" size={18} color="#64748B" />
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
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>

          {/* Şifre Kopyala */}
          <TouchableOpacity
            onPress={() => handleCopyToClipboard(password, "Şifre")}
            style={styles.copyButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="copy-outline" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Kalan Saat */}
        <View style={styles.hourContainer}>
          <Ionicons name="time-outline" size={14} color={getHourStyle().color} />
          <View style={[styles.hourBadge, { backgroundColor: getHourStyle().backgroundColor }]}>
            <Text style={[styles.hourText, { color: getHourStyle().color }]}>
              {hour <= 0 ? "Süresi Doldu" : `${hour} saat kaldı`}
            </Text>
          </View>
        </View>
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
  // Content: Orta kısım (sunucu, user_code, password, hour)
  content: {
    flex: 1,
    gap: 8,
  },
  // Info Row: Sunucu, user_code ve şifre satırları
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
    padding: 8,
  },
  eyeButton: {
    padding: 8,
  },
  // Hour: Kalan saat container ve badge
  hourContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  hourBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hourText: {
    fontSize: 12,
    fontWeight: "600",
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
