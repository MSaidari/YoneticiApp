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
import { fetchtasks, addTask } from "../Components/Api";
import { TaskCard } from "../Components/TaskCard";
import { TaskAddModal } from "./TaskAddModal";

export const TaskListScreen = () => {
  // State'ler:
  // tasks: API'den çekilen görevlerin listesi
  const [tasks, setTasks] = useState([]);
  
  // loading: Veriler yüklenirken gösterilecek
  const [loading, setLoading] = useState(true);
  
  // error: Hata durumunda mesaj göstermek için
  const [error, setError] = useState("");
  
  // modalVisible: Görev ekleme modalının açık/kapalı durumu
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * handleFetchTasks: API'den görevleri çeker
   * - fetchtasks() fonksiyonunu çağırır (Api.tsx'ten)
   * - Response'u JSON'a parse eder
   * - tasks state'ine set eder
   * - Loading ve error state'lerini yönetir
   */
  const handleFetchTasks = async () => {
    try {
      setLoading(true); // Yükleme başladı
      setError(""); // Önceki hataları temizle
      
      // API'den görevleri çek
      const response = await fetchtasks();
      
      // Response kontrolü
      if (!response.ok) {
        throw new Error("Görevler yüklenemedi");
      }
      
      // JSON'a parse et
      const tasksData = await response.json();
      
      // State'e kaydet
      setTasks(tasksData);
      
      console.log("Görevler başarıyla yüklendi:", tasksData.length, "görev");
    } catch (error) {
      console.error("Görevleri alma hatası:", error);
      setError("Görevler yüklenirken bir hata oluştu");
    } finally {
      // Her durumda loading'i false yap (try veya catch'ten sonra)
      setLoading(false);
    }
  };

  /**
   * useEffect: Component ilk yüklendiğinde çalışır
   * - handleFetchTasks() fonksiyonunu çağırır
   * - [] dependency array → Sadece ilk render'da çalışır
   */
  useEffect(() => {
    handleFetchTasks();
  }, []); // Boş array = sadece ilk yüklemede çalış

  /**
   * handleAddTask: Yeni görev ekler
   * - API'ye POST isteği yapar
   * - Başarılı olursa listeyi yeniden çeker
   * - Modal'ı kapatır
   */
  const handleAddTask = async (newTask: any) => {
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

  /**
   * renderTaskItem: FlatList için her görev kartını render eder
   * - item: Görev objesi
   * - TaskCard component'ine props olarak gönderir
   * - due_date veya createdAt varsa göster (hangisi varsa)
   */
  const renderTaskItem = ({ item }: any) => (
    <TaskCard
      id={item.id}
      title={item.title}
      status={item.status}
      priority={item.priority}
      createdAt={item.due_date || item.createdAt}
      onEdit={() => console.log("Edit:", item.id)}
      onDelete={() => console.log("Delete:", item.id)}
      onPress={() => console.log("Görev detayı:", item.id)}
    />
  );

  /**
   * Loading State: Veriler yüklenirken gösterilir
   */
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Görevler yükleniyor...</Text>
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
        <Text style={styles.errorHint}>
          API'nin çalıştığından emin olun (mock_api)
        </Text>
      </View>
    );
  }

  /**
   * Empty State: Görev listesi boşsa gösterilir
   */
  if (tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Görevlerim</Text>
          <Text style={styles.headerSubtitle}>0 görev</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Henüz görev yok</Text>
          <Text style={styles.emptyHint}>
            Yeni görev eklemek için + butonuna tıklayın
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Success State: Görevler başarıyla yüklendiyse gösterilir
   */
  return (
    <View style={styles.container}>
      {/* Header: Başlık + istatistikler */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Görevlerim</Text>
        <Text style={styles.headerSubtitle}>
          {tasks.length} görev • {tasks.filter((t: any) => t.status === "done").length} tamamlandı
        </Text>
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
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item: any) => item.id?.toString() || String(Math.random())}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button: + butonu (Görev Ekle) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Görev Ekleme Modal'ı */}
      <TaskAddModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddTask}
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
