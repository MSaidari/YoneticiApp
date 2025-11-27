import React, { use, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AddButton } from "../Components/addmodal";
import { DomainAddModal } from "./DomainAddModal";
import { fetchdomanins,deletedomain } from "../Components/Api";
import { DomainCard } from "../Components/DomainCard";

export const DomainListScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    handlefetchDomains();
  }, []);

  const handlefetchDomains = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchdomanins();
      const data = await response.json();
      setDomains(data);
      setLoading(false);
      console.log("Domainler yüklendi:", data);
    } catch (error) {
      setError("Domainleri yüklerken bir hata oluştu.");
      setLoading(false);
    }
  };

  /**
   * renderDomainItem: FlatList için her domain kartını render eder
   */
  const renderDomainItem = ({ item }: any) => (
    <DomainCard
      id={item.id}
      domain={item.domain}
      provider={item.provider}
      expiryDate={item.date}
      onDelete={() => deletedomain(item.id).then(() => handlefetchDomains()).catch((err) => console.error(err))}

    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <Ionicons name="globe-outline" size={32} color="#6366F1" />
        </View>

        {/* Text Container */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Domain Listesi</Text>
          <Text style={styles.headerSubtitle}>
            {domains.length} domain • Tüm domainleriniz burada
          </Text>
        </View>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Domainler yükleniyor...</Text>
        </View>
      )}

      {/* Error State */}
      {!loading && error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && domains.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Henüz domain yok</Text>
        </View>
      )}

      {/* Domain List */}
      {!loading && !error && domains.length > 0 && (
        <FlatList
          data={domains}
          renderItem={renderDomainItem}
          keyExtractor={(item: any) =>
            item.id?.toString() || String(Math.random())
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
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
  // FlatList content
  listContent: {
    padding: 16,
  },
});