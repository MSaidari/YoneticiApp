import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { fetchtasks, addTask,fetchPasswords, deletePassword, fetchDataWithUserInfo } from "../Components/Api";
import { PasswordCard } from "../Components/passwordcard";
import { useAuth } from "../context/AuthContext";
import { AddButton } from "../Components/addmodal";
import { PasswordAddModal } from "./PasswordAddModal";

export const SupportPassword = () => {
  // Auth Context'ten kullanıcı bilgilerini al
  const { currentUser, isAdmin } = useAuth();
  
  // State'ler:
  // passwords: API'den çekilen şifrelerin listesi
  const [passwords, setPasswords] = useState([]);
  
  // loading: Veriler yüklenirken gösterilecek
  const [loading, setLoading] = useState(true);
  
  // error: Hata durumunda mesaj göstermek için
  const [error, setError] = useState("");
  
  // Modal state'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPassword, setEditingPassword] = useState<any>(null);
  

  /**
   * handleFetchPasswords: API'den şifreleri çeker
   * - fetchPasswords() fonksiyonunu çağırır (Api.tsx'ten)
   * - Response'u JSON'a parse eder
   * - passwords state'ine set eder
   * - Loading ve error state'lerini yönetir
   */
  const handleFetchpassword = async () => {
    try {
      setLoading(true); // Yükleme başladı
      setError(""); // Önceki hataları temizle
      
      // Admin ise veya yetki varsa tüm şifreleri + kullanıcı bilgisi getir
      const userId = currentUser?.id === 0 ? undefined : currentUser?.id;
      const hasPermission = currentUser?.permissions?.passwords || false;
      const passwordsData = await fetchDataWithUserInfo("passwords", userId, isAdmin, hasPermission);
      
      // State'e kaydet
      setPasswords(passwordsData);
      
      console.log("Şifreler başarıyla yüklendi:", passwordsData.length, "şifre");
    } catch (error) {
      console.error("Şifreleri alma hatası:", error);
      setError("Şifreler yüklenirken bir hata oluştu");
    } finally {
      // Her durumda loading'i false yap (try veya catch'ten sonra)
      setLoading(false);
    }
  };

  /**
   * useFocusEffect: Ekran her açıldığında çalışır
   * - handleFetchpassword() fonksiyonunu çağırır
   * - Dashboard'dan dönüldüğünde veya ilk açılışta veri yeniler
   */
  useFocusEffect(
    useCallback(() => {
      handleFetchpassword();
    }, [])
  );

  /**
   * useEffect: Günlük şifreleri otomatik siler (her gün 00:00'da)
   * - Oluşturulma tarihinden 1 gün geçmişse siler
   */
  useEffect(() => {
    const checkAndDeleteOldPasswords = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      // 1 günden eski şifreleri bul
      const oldPasswords = passwords.filter((p: any) => {
        const createdDate = new Date(p.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate < today;
      });

      // Eğer eski şifre varsa sil
      if (oldPasswords.length > 0) {
        console.log(`${oldPasswords.length} eski şifre siliniyor...`);
        
        for (const password of oldPasswords) {
          try {
            await deletePassword((password as any).id);
            console.log(`Şifre DB'den silindi: ${(password as any).id}`);
          } catch (error) {
            console.error(`Şifre silme hatası (${(password as any).id}):`, error);
          }
        }
        
        // Listeyi yenile
        await handleFetchpassword();
      }
    };

    // İlk yükleme kontrolü
    if (passwords.length > 0) {
      checkAndDeleteOldPasswords();
    }

    // Her gece 00:00'da kontrol et
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Yarın
      0, 0, 0, 0 // 00:00:00
    );
    const msUntilMidnight = night.getTime() - now.getTime();
    
    // İlk kontrol yarın gece 00:00'da
    const timeout = setTimeout(() => {
      checkAndDeleteOldPasswords();
      // Sonra her 24 saatte bir kontrol et
      const interval = setInterval(checkAndDeleteOldPasswords, 86400000); // 24 saat
      return () => clearInterval(interval);
    }, msUntilMidnight);

    // Cleanup: Component unmount olduğunda timeout'u temizle
    return () => clearTimeout(timeout);
  }, [passwords]); // passwords değiştiğinde yeniden çalış


  /**
   * handleAddTask: Yeni görev ekler
   * - API'ye POST isteği yapar
   * - Başarılı olursa listeyi yeniden çeker
   * - Modal'ı kapatır
   */
  /*
  const handleAddpassword = async (newTask: any) => {
    try {
      // API'ye gönder
      const response = await addTask(newTask);
      
      if (!response.ok) {
        throw new Error("Görev eklenemedi");
      }
      
      console.log("Görev başarıyla eklendi");
      
      // Listeyi yenile
      await handleFetchTasks();
      
      // Modal'ı kapat
      setModalVisible(false);
    } catch (error) {
      console.error("Görev ekleme hatası:", error);
      alert("Görev eklenirken bir hata oluştu");
    }
  };
  */
  /**
   * renderTaskItem: FlatList için her şifre kartını render eder
   * - item: Şifre objesi (id, server, user_code, password, createdAt)
   * - PasswordCard component'ine props olarak gönderir
   */
  const renderTaskItem = ({ item }: any) => {
    return (
    <PasswordCard
      id={item.id}
      server={item.sunucu}
      user_code={item.user_code}
      password={item.password}
      userName={isAdmin ? item.userName : undefined}
      onEdit={() => {
        setEditingPassword(item);
        setModalVisible(true);
      }}
      onDelete={() => deletePassword(item.id).then(() => handleFetchpassword()).catch((err) => console.error(err))}
    />
  );
  };

  /**
   * Loading State: Veriler yüklenirken gösterilir
   */
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  /**
   * Error State: Hata oluştuğunda gösterilir
   */
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  /**
   * Empty State: Görev listesi boşsa gösterilir
   */
  if (passwords.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Görevlerim</Text>
          <Text style={styles.headerSubtitle}>0 görev</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Henüz Şifre eklenmedi.</Text>
          <Text style={styles.emptyHint}>
            Liste şuanda boş. Destek şifrelerini ekleyin.
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Success State: şifreler başarıyla yüklendiyse gösterilir
   */
  return (
    <View style={styles.container}>
      {/* Header: Başlık + istatistikler */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Destek Şifreleri</Text>
        
      </View>

      {/* FlatList: Görev kartlarının listesi */}
      {/*
        - data: Gösterilecek array (tasks)
        - renderItem: Her eleman için render fonksiyonu
        - keyExtractor: Her eleman için unique key (React için gerekli)
        - contentContainerStyle: İçerik container'ının stil'i
        - showsVerticalScrollIndicator: Scroll bar göster/gizle
      */}
      <FlatList
        data={passwords}
        renderItem={renderTaskItem}
        keyExtractor={(item: any) => item.id?.toString() || String(Math.random())}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <AddButton
        onPress={() => {
          setEditingPassword(null);
          setModalVisible(true);
        }}
      />

      {/* Add/Edit Modal */}
      <PasswordAddModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingPassword(null);
        }}
        onSave={() => {
          setModalVisible(false);
          setEditingPassword(null);
          handleFetchpassword();
        }}
        editingPassword={editingPassword}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Container: Ana container
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  // Header: Sayfa başlığı
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  // FlatList content
  listContent: {
    padding: 16,
  },
  // Center Container: Loading, Error, Empty state'ler için
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  // Loading
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  // Error
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 8,
    textAlign: "center",
  },
  errorHint: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  // Empty
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  // Floating Action Button: + butonu
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
