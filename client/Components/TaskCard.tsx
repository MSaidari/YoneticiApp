import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * TaskCard: Tekrar kullanılabilir görev kartı component'i
 * 
 * Bu component farklı ekranlarda kullanılabilir (TaskListScreen, Dashboard vb.)
 * Props ile veri alır ve görsel olarak gösterir
 */

// TypeScript Interface: Component'in alacağı props'ların tiplerini tanımlar
interface TaskCardProps {
  // Zorunlu props (required)
  id: number | string; // Görevin benzersiz ID'si
  title: string; // Görev başlığı
  status: "todo" | "progress" | "done"; // Görevin durumu (sadece bu 3 değerden biri olabilir)
  priority: "low" | "medium" | "high"; // Görevin önceliği (sadece bu 3 değerden biri olabilir)

  // Opsiyonel props (optional) - ? işareti ile tanımlanır
  createdAt?: string; // Oluşturma tarihi (olmayabilir)
  onEdit?: () => void; // Edit butonuna basıldığında çalışacak fonksiyon (olmayabilir)
  onDelete?: () => void; // Delete butonuna basıldığında çalışacak fonksiyon (olmayabilir)
  onPress?: () => void; // Kart tıklandığında çalışacak fonksiyon (olmayabilir)
}

/**
 * TaskCard Component
 * 
 * Kullanım Örneği:
 * <TaskCard
 *   id={1}
 *   title="API Entegrasyonu"
 *   description="Backend'i bağla"
 *   status="progress"
 *   priority="high"
 *   createdAt="2025-11-20"
 *   onEdit={() => console.log("Edit")}
 *   onDelete={() => console.log("Delete")}
 * />
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  status,
  priority,
  createdAt,
  onEdit,
  onDelete,
  onPress,
}) => {
  /**
   * getStatusInfo: Duruma göre badge bilgilerini döndürür
   * Switch-case ile status'a göre renk ve label belirler
   */
  const getStatusInfo = (status: "todo" | "progress" | "done") => {
    switch (status) {
      case "todo":
        return {
          label: "To Do",
          color: "#64748B",
          backgroundColor: "#F1F5F9",
        };
      case "progress":
        return {
          label: "In Progress",
          color: "#3B82F6",
          backgroundColor: "#DBEAFE",
        };
      case "done":
        return {
          label: "Done",
          color: "#10B981",
          backgroundColor: "#D1FAE5",
        };
      default:
        // Eğer geçersiz bir status gelirse varsayılan değer döndür
        return {
          label: "Unknown",
          color: "#64748B",
          backgroundColor: "#F1F5F9",
        };
    }
  };

  /**
   * getPriorityColor: Önceliğe göre renk döndürür
   * Sol taraftaki renkli çizgi için kullanılır
   */
  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "#10B981"; // Yeşil
      case "medium":
        return "#F59E0B"; // Turuncu
      case "high":
        return "#EF4444"; // Kırmızı
    }
  };

  const statusInfo = getStatusInfo(status);
  const priorityColor = getPriorityColor(priority);

  /**
   * Card Container: Eğer onPress prop'u varsa TouchableOpacity, yoksa View kullan
   * Bu sayede kart tıklanabilir veya tıklanamaz yapılabilir
   */
  const CardContainer =  View;

  return (
    <CardContainer
      style={styles.taskCard}
    >
      {/* Sol tarafta öncelik göstergesi (renkli çizgi) */}
      <View
        style={[styles.priorityIndicator, { backgroundColor: priorityColor }]}
      />

      {/* Card içeriği */}
      <View style={styles.cardContent}>
        {/* Üst kısım: Başlık + Durum badge'i */}
        <View style={styles.cardHeader}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {title}
          </Text>
          {/* Durum badge'i (To Do, In Progress, Done) */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.backgroundColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Alt kısım: Tarih + Edit/Delete iconları */}
        <View style={styles.cardFooter}>
          {/* Tarih (varsa göster) */}
          {createdAt ? (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
              <Text style={styles.dateText}>
                {new Date(createdAt).toLocaleDateString("tr-TR")}
              </Text>
            </View>
          ) : (
            <View /> // Boş View (spacing için)
          )}

          {/* Action butonları (onEdit veya onDelete prop'u varsa göster) */}
          {(onEdit || onDelete) && (
            <View style={styles.actionButtons}>
              {/* Edit butonu (onEdit prop'u varsa göster) */}
              {onEdit && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onEdit}
                  activeOpacity={0.6}
                >
                  <Ionicons name="create-outline" size={18} color="#64748B" />
                </TouchableOpacity>
              )}
              {/* Delete butonu (onDelete prop'u varsa göster) */}
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
        </View>
      </View>
    </CardContainer>
  );
};

// Styles: Component'e özgü stiller
const styles = StyleSheet.create({
  // Task Card: Ana kart container'ı
  taskCard: {
    flexDirection: "row", // Sol çizgi + içerik yan yana
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden", // Border radius için gerekli
  },
  // Priority Indicator: Sol taraftaki renkli çizgi
  priorityIndicator: {
    width: 4, // Çizgi kalınlığı
  },
  // Card Content: Sağ taraftaki içerik
  cardContent: {
    flex: 1,
    padding: 16,
  },
  // Card Header: Başlık + Durum badge'i
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginRight: 8,
  },
  // Status Badge: Durum göstergesi (To Do, In Progress, Done)
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  // Task Description: Görev açıklaması
  taskDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  // Card Footer: Tarih + Action butonları
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  // Action Buttons: Edit/Delete butonları
  actionButtons: {
    flexDirection: "row",
    gap: 8,
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
        