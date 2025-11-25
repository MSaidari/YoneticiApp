import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * AddButton: Floating Action Button (FAB) component'i
 * 
 * Farklı ekranlarda yeniden kullanılabilir ekleme butonu
 * Sağ alt köşede sabit pozisyonda durur
 * 
 * Props:
 * - onPress: Butona tıklandığında çalışacak fonksiyon
 * - label: Buton üzerinde gösterilecek metin (opsiyonel)
 * - icon: İkon adı (varsayılan: "add")
 * - size: Buton boyutu ("small" | "medium" | "large", varsayılan: "medium")
 * - color: Buton rengi (varsayılan: "#6366F1")
 * - bottom: Alt konumu (varsayılan: 20)
 * - right: Sağ konumu (varsayılan: 20)
 * - style: Ek stil (opsiyonel)
 */

interface AddButtonProps {
  onPress: () => void;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: "small" | "medium" | "large";
  color?: string;
  bottom?: number;
  right?: number;
  style?: ViewStyle;
}

export const AddButton: React.FC<AddButtonProps> = ({
  onPress,
  label,
  icon = "add",
  size = "medium",
  color = "#6366F1",
  bottom = 20,
  right = 20,
  style,
}) => {
  // Boyut ayarları
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
          iconSize: 24,
        };
      case "large":
        return {
          width: 72,
          height: 72,
          borderRadius: 36,
          iconSize: 36,
        };
      default: // medium
        return {
          width: 60,
          height: 60,
          borderRadius: 30,
          iconSize: 28,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Eğer label varsa extended FAB (yatay uzun buton)
  const isExtended = !!label;

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: color,
          width: isExtended ? "auto" : sizeStyles.width,
          height: sizeStyles.height,
          borderRadius: sizeStyles.borderRadius,
          paddingHorizontal: isExtended ? 20 : 0,
          bottom,
          right,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={sizeStyles.iconSize} color="#FFFFFF" />
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // FAB: Floating Action Button
  fab: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
