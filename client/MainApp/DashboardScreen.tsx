import { Text, View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { fetchtasks, fetchdomanins, fetchPasswords } from "../Components/Api";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export const Dashboard = () => {
  const { logout, currentUser } = useAuth();
  const navigation = useNavigation();
  const [taskCount, setTaskCount] = useState(0);
  const [domainCount, setDomainCount] = useState(0);
  const [passwordCount, setPasswordCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Kullanıcı tabanlı veya hızlı giriş için tüm verileri çek
      const userId = currentUser?.id === 0 ? undefined : currentUser?.id;
      
      // Görevleri çek
      const tasksResponse = await fetchtasks(userId);
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        setTaskCount(tasks.filter((t: any) => t.status !== 'done').length);
        setCompletedCount(tasks.filter((t: any) => t.status === 'done').length);
      }
      
      // Domainleri çek
      const domainsResponse = await fetchdomanins(userId);
      if (domainsResponse.ok) {
        const domains = await domainsResponse.json();
        setDomainCount(domains.length);
      }
      
      // Şifreleri çek
      const passwordsResponse = await fetchPasswords(userId);
      if (passwordsResponse.ok) {
        const passwordsData = await passwordsResponse.json();
        setPasswordCount(passwordsData.length);
      }
    } catch (error) {
      console.error("Dashboard veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Ekran her açıldığında verileri yenile
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hoş Geldiniz</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#EEF2FF" }]}>
            <View style={[styles.iconContainer, { backgroundColor: "#6366F1" }]}>
              <Ionicons name="briefcase-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>{taskCount}</Text>
            <Text style={styles.statLabel}>Aktif Görev</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#F0FDF4" }]}>
            <View style={[styles.iconContainer, { backgroundColor: "#10B981" }]}>
              <Ionicons name="globe-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>{domainCount}</Text>
            <Text style={styles.statLabel}>Domain</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
            <View style={[styles.iconContainer, { backgroundColor: "#F59E0B" }]}>
              <Ionicons name="key-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>{passwordCount}</Text>
            <Text style={styles.statLabel}>Şifreler</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
            <View style={[styles.iconContainer, { backgroundColor: "#EF4444" }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Görev' as never)}>
            <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="add-circle" size={28} color="#6366F1" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Yeni Görev Ekle</Text>
              <Text style={styles.actionSubtitle}>Hızlı görev oluştur</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Domain' as never)}>
            <View style={[styles.actionIcon, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="earth" size={28} color="#10B981" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Domain Yönetimi</Text>
              <Text style={styles.actionSubtitle}>Domainleri görüntüle</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Sifre Destek' as never)}>
            <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="shield-checkmark" size={28} color="#F59E0B" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Destek Şifreleri</Text>
              <Text style={styles.actionSubtitle}>Şifre yönetimi</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
        </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  loadingContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
});