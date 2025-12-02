import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * DomainCard: Domain bilgilerini gösteren kart component'i
 * 
 * Props:
 * - id: Domain ID'si
 * - domain: Domain adı (örn: google.com)
 * - provider: Sağlayıcı (örn: GoDaddy)
 * - expiryDate: Son kullanma tarihi
 * - onEdit: Düzenleme butonu fonksiyonu (opsiyonel)
 * - onDelete: Silme butonu fonksiyonu (opsiyonel)
 * - onPress: Kart tıklama fonksiyonu (opsiyonel)
 */

interface DomainCardProps {
  id: number | string;
  domain: string;
  provider: string;
  expiryDate?: string;
  userName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  id,
  domain,
  provider,
  expiryDate,
  userName,
  onEdit,
  onDelete,
}) => {
  /**
   * getDaysUntilExpiry: Son kullanma tarihine kaç gün kaldığını hesaplar
   */
  const getDaysUntilExpiry = () => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  /**
   * getExpiryStatus: Tarihe göre durum rengi ve mesajı döndürür
   */
  const getExpiryStatus = () => {
    const daysLeft = getDaysUntilExpiry();
    
    if (daysLeft === null) {
      return { color: "#64748B", label: "Tarih yok", bgColor: "#F1F5F9" };
    }
    
    if (daysLeft < 0) {
      return { color: "#DC2626", label: "Süresi doldu", bgColor: "#FEE2E2" };
    }
    
    if (daysLeft <= 30) {
      return { color: "#EA580C", label: `${daysLeft} gün kaldı`, bgColor: "#FFEDD5" };
    }
    
    if (daysLeft <= 90) {
      return { color: "#F59E0B", label: `${daysLeft} gün kaldı`, bgColor: "#FEF3C7" };
    }
    
    return { color: "#10B981", label: `${daysLeft} gün kaldı`, bgColor: "#D1FAE5" };
  };

  const expiryStatus = getExpiryStatus();
  const CardContainer = View;

  return (
    <>
      <CardContainer
        style={styles.card}
      >
        {/* Sol tarafta domain icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="globe" size={24} color="#6366F1" />
        </View>

      {/* Orta kısım: Domain adı, provider, tarih */}
      <View style={styles.content}>
        {/* Domain Adı */}
        <Text style={styles.domainName} numberOfLines={1}>
          {domain}
        </Text>

        {/* Provider */}
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={14} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={1}>
            {provider}
          </Text>
        </View>

        {/* Son Kullanma Tarihi */}
        {expiryDate && (
          <View style={styles.expiryContainer}>
            <View
              style={[
                styles.expiryBadge,
                { backgroundColor: expiryStatus.bgColor },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={12}
                color={expiryStatus.color}
              />
              <Text style={[styles.expiryText, { color: expiryStatus.color }]}>
                {expiryStatus.label}
              </Text>
            </View>
          </View>
        )}

        {/* User Attribution: Sadece admin görür */}
      {userName && (
        <View style={styles.userInfoBottom}>
          <Ionicons name="person-outline" size={12} color="#94A3B8" />
          <Text style={styles.userTextBottom}>{userName}</Text>
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
              <Ionicons name="create-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
              activeOpacity={0.6}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      )}


      
    </CardContainer>
    </>
  );
};

const styles = StyleSheet.create({
  // Card: Ana kart container
  card: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  // Content: Orta kısım (domain, provider, tarih)
  content: {
    flex: 1,
    gap: 6,
  },
  domainName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  // Info Row: Provider satırı
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
  // Expiry Container
  expiryContainer: {
    marginTop: 4,
  },
  expiryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // User Info: Kullanıcı bilgisi (admin görünümü)
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  userText: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
  },
  // Action Buttons: Edit/Delete butonları
  actionButtons: {
    flexDirection: "column",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 37,
    height: 37,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  // User Info Bottom: Kullanıcı bilgisi (kartın alt kısmında)
  userInfoBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignSelf: "stretch",
  },
  userTextBottom: {
    fontSize: 11,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});
