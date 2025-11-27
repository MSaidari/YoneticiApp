import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDomain } from "../Components/Api";

interface DomainAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (domain: any) => void;
}

export const DomainAddModal: React.FC<DomainAddModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [domainName, setDomainName] = useState("");
  const [provider, setProvider] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!domainName.trim()) {
      Alert.alert("Hata", "Domain adı boş olamaz!");
      return;
    }

    if (!provider.trim()) {
      Alert.alert("Hata", "Provider adı boş olamaz!");
      return;
    }

    setLoading(true);
    try {
      await addDomain({
        domain: domainName.trim().toLowerCase(),
        provider: provider.trim(),
        date: expiryDate || new Date().toISOString(),
        userId: 1,
      });
      
      // Parent component'e bildir
      onSave({
        domain: domainName.trim().toLowerCase(),
        provider: provider.trim(),
        date: expiryDate || new Date().toISOString(),
      });

      // Formu temizle
      handleClear();
    } catch (error) {
      Alert.alert("Hata", "Domain eklenirken bir hata oluştu!");
      console.error("Domain ekleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDomainName("");
    setProvider("");
    setExpiryDate("");
  };

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
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Yeni Domain Ekle</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Domain Adı */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Domain Adı *</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="globe-outline"
                      size={20}
                      color="#6366F1"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="örnek: google.com"
                      placeholderTextColor="#94A3B8"
                      value={domainName}
                      onChangeText={setDomainName}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </View>
                </View>

                {/* Provider */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Provider *</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color="#6366F1"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="örnek: GoDaddy, Namecheap"
                      placeholderTextColor="#94A3B8"
                      value={provider}
                      onChangeText={setProvider}
                    />
                  </View>
                </View>

                {/* Expiry Date */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Son Kullanma Tarihi</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6366F1"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="örnek: 2025-12-31"
                      placeholderTextColor="#94A3B8"
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                    />
                  </View>
                  <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    loading && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Kaydediliyor..." : "Kaydet"}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
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
  hint: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
    marginLeft: 4,
  },
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
  saveButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
