import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * TaskAddModal: Görev ekleme/düzenleme modal component'i
 * 
 * Props:
 * - visible: Modal açık/kapalı durumu
 * - onClose: Modal kapatma fonksiyonu
 * - onSave: Görev kaydetme fonksiyonu (görev objesini alır)
 * - editTask: Düzenlenecek görev (opsiyonel - varsa edit modu)
 */

interface TaskAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  editTask?: any; // Düzenlenecek görev objesi (opsiyonel)
}

export const TaskAddModal: React.FC<TaskAddModalProps> = ({
  visible,
  onClose,
  onSave,
  editTask,
}) => {
  // Form state'leri
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  /**
   * useEffect: editTask prop'u değiştiğinde formu doldur
   * - Eğer editTask varsa (edit modu) form alanlarını doldur
   * - Eğer editTask yoksa (add modu) formu temizle
   */
  useEffect(() => {
    if (editTask) {
      // Edit modu: Formu doldur
      setTitle(editTask.title || "");
      setDescription(editTask.description || "");
      setStatus(editTask.status || "todo");
      setPriority(editTask.priority || "medium");
    } else {
      // Add modu: Formu temizle
      handleClear();
    }
  }, [editTask, visible]); // editTask veya visible değişince çalış

  /**
   * handleSave: Form verilerini kontrol edip kaydeder
   * - Edit modunda: Mevcut görevin ID'sini korur
   * - Add modunda: Yeni ID oluşturur
   */
  const handleSave = () => {
    // Validasyon: Başlık boş olamaz
    if (title.trim() === "") {
      alert("Lütfen görev başlığı girin");
      return;
    }

    // Görev objesi oluştur (edit veya add)
    const taskData = {
      id: editTask?.id || Date.now().toString(), // Edit modunda mevcut ID, add modunda yeni ID
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      due_date: editTask?.due_date || new Date().toISOString(), // Edit modunda mevcut tarih, add modunda yeni tarih
    };

    // Parent component'e gönder
    onSave(taskData);

    // Formu temizle
    handleClear();
  };

  /**
   * handleClear: Tüm form alanlarını temizler
   */
  const handleClear = () => {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("medium");
  };

  /**
   * handleClose: Modal'ı kapat ve formu temizle
   */
  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Dış tıklama ile kapatma (overlay) */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          {/* Modal içeriği (tıklanınca kapanmasın) */}
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editTask ? "Görevi Düzenle" : "Yeni Görev Ekle"}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Başlık Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Görev Başlığı *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: API entegrasyonu yap"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Açıklama Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Görev detaylarını girin..."
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Status Seçimi */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Durum</Text>
                  <View style={styles.chipContainer}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        status === "todo" && styles.chipActive,
                      ]}
                      onPress={() => setStatus("todo")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          status === "todo" && styles.chipTextActive,
                        ]}
                      >
                        To Do
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.chip,
                        status === "progress" && styles.chipActive,
                      ]}
                      onPress={() => setStatus("progress")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          status === "progress" && styles.chipTextActive,
                        ]}
                      >
                        In Progress
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.chip,
                        status === "done" && styles.chipActive,
                      ]}
                      onPress={() => setStatus("done")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          status === "done" && styles.chipTextActive,
                        ]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Priority Seçimi */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Öncelik</Text>
                  <View style={styles.chipContainer}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        priority === "low" && styles.chipActiveLow,
                      ]}
                      onPress={() => setPriority("low")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          priority === "low" && styles.chipTextActive,
                        ]}
                      >
                        Düşük
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.chip,
                        priority === "medium" && styles.chipActiveMedium,
                      ]}
                      onPress={() => setPriority("medium")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          priority === "medium" && styles.chipTextActive,
                        ]}
                      >
                        Orta
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.chip,
                        priority === "high" && styles.chipActiveHigh,
                      ]}
                      onPress={() => setPriority("high")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          priority === "high" && styles.chipTextActive,
                        ]}
                      >
                        Yüksek
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer: Butonlar */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {editTask ? "Güncelle" : "Kaydet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Overlay: Arka plan (karartma)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  // Modal Content: Beyaz kutu
  modalContent: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  // Modal Header
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  // Input Group
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  // Chip Container
  chipContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  chipActiveLow: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  chipActiveMedium: {
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },
  chipActiveHigh: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  // Modal Footer
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
