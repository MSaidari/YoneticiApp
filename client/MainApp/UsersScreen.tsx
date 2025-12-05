import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { fetchUsers, updateUserPermissions } from "../Components/Api";

/**
 * UsersScreen: Kullanıcı yönetimi ekranı (sadece admin)
 * - Tüm kullanıcıları listeler
 * - Her kullanıcı için yetki ayarları (domains, tasks, passwords)
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    domains: boolean;
    tasks: boolean;
    passwords: boolean;
  };
}

export const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * handleFetchUsers: Kullanıcıları API'den çek
   */
  const handleFetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetchUsers();
      const usersData = await response.json();
      
      // Admin olmayan kullanıcıları filtrele ve permissions kontrolü yap
      const nonAdminUsers = usersData
        .filter((u: User) => u.role !== "admin")
        .map((u: User) => ({
          ...u,
          permissions: u.permissions || {
            domains: false,
            tasks: false,
            passwords: false
          }
        }));
      setUsers(nonAdminUsers);
      
      console.log("Kullanıcılar yüklendi:", nonAdminUsers.length, "kullanıcı");
    } catch (error) {
      console.error("Kullanıcıları alma hatası:", error);
      setError("Kullanıcılar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  /**
   * useFocusEffect: Ekran açıldığında kullanıcıları yükle
   */
  useFocusEffect(
    useCallback(() => {
      handleFetchUsers();
    }, [])
  );

  /**
   * handleTogglePermission: Kullanıcı iznini değiştir
   */
  const handleTogglePermission = async (
    userId: string,
    permissionType: "domains" | "tasks" | "passwords",
    currentValue: boolean
  ) => {
    try {
      // Optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                permissions: {
                  ...user.permissions,
                  [permissionType]: !currentValue,
                },
              }
            : user
        )
      );

      // API'ye kaydet
      const updatedUser = users.find((u) => u.id === userId);
      if (updatedUser) {
        const newPermissions = {
          ...updatedUser.permissions,
          [permissionType]: !currentValue,
        };
        
        const response = await updateUserPermissions(userId, newPermissions);
        
        if (!response.ok) {
          // Hata durumunda geri al
          console.error("İzin güncellenemedi");
          await handleFetchUsers();
        } else {
          console.log("İzin güncellendi:", permissionType, !currentValue);
        }
      }
    } catch (error) {
      console.error("İzin güncelleme hatası:", error);
      await handleFetchUsers();
    }
  };

  /**
   * renderUserItem: Her kullanıcı kartını render et
   */
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      {/* Kullanıcı Bilgileri */}
      <View style={styles.userHeader}>
        <View style={styles.userIcon}>
          <Ionicons name="person" size={24} color="#6366F1" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>

      {/* Yetki Yönetimi */}
      <View style={styles.permissionsContainer}>
        <Text style={styles.permissionsTitle}>Yetkiler</Text>
        
        {/* Domain Yetkisi */}
        <View style={styles.permissionRow}>
          <View style={styles.permissionLabel}>
            <Ionicons name="globe-outline" size={20} color="#64748B" />
            <Text style={styles.permissionText}>Domain</Text>
          </View>
          <Switch
            value={item.permissions.domains}
            onValueChange={() =>
              handleTogglePermission(item.id, "domains", item.permissions.domains)
            }
            trackColor={{ false: "#E2E8F0", true: "#A5B4FC" }}
            thumbColor={item.permissions.domains ? "#6366F1" : "#f4f3f4"}
          />
        </View>

        {/* Görev Yetkisi */}
        <View style={styles.permissionRow}>
          <View style={styles.permissionLabel}>
            <Ionicons name="list-outline" size={20} color="#64748B" />
            <Text style={styles.permissionText}>Görev</Text>
          </View>
          <Switch
            value={item.permissions.tasks}
            onValueChange={() =>
              handleTogglePermission(item.id, "tasks", item.permissions.tasks)
            }
            trackColor={{ false: "#E2E8F0", true: "#A5B4FC" }}
            thumbColor={item.permissions.tasks ? "#6366F1" : "#f4f3f4"}
          />
        </View>

        {/* Şifre Desteği Yetkisi */}
        <View style={styles.permissionRow}>
          <View style={styles.permissionLabel}>
            <Ionicons name="key-outline" size={20} color="#64748B" />
            <Text style={styles.permissionText}>Şifre Destek</Text>
          </View>
          <Switch
            value={item.permissions.passwords}
            onValueChange={() =>
              handleTogglePermission(
                item.id,
                "passwords",
                item.permissions.passwords
              )
            }
            trackColor={{ false: "#E2E8F0", true: "#A5B4FC" }}
            thumbColor={item.permissions.passwords ? "#6366F1" : "#f4f3f4"}
          />
        </View>
      </View>
    </View>
  );

  /**
   * Loading State
   */
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
      </View>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  /**
   * Empty State
   */
  if (users.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kullanıcı Yönetimi</Text>
          <Text style={styles.headerSubtitle}>0 kullanıcı</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Henüz kullanıcı yok</Text>
        </View>
      </View>
    );
  }

  /**
   * Success State
   */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kullanıcı Yönetimi</Text>
        <Text style={styles.headerSubtitle}>{users.length} kullanıcı</Text>
      </View>

      {/* Kullanıcı Listesi */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
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
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  // User Card
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  // Permissions
  permissionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  permissionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permissionText: {
    fontSize: 15,
    color: "#475569",
  },
});
