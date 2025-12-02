import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { fetchNotes, deleteNote } from "../Components/Api";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  userId: number | string;
}

export const Notes = () => {
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.id === 0 ? undefined : currentUser?.id;
      const response = await fetchNotes(userId);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Not yükleme hatası:", error);
      Alert.alert("Hata", "Notlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [currentUser])
  );

  const handleDeleteNote = (noteId: string) => {
    Alert.alert("Sil", "Bu notu silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteNote(noteId);
            if (response.ok) {
              Alert.alert("Başarılı", "Not silindi");
              loadNotes();
            }
          } catch (error) {
            console.error("Not silme hatası:", error);
            Alert.alert("Hata", "Not silinirken bir hata oluştu");
          }
        },
      },
    ]);
  };

  const renderNoteCard = ({ item }: { item: Note }) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => navigation.navigate('NoteEditor' as never, { note: item } as never)}
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteNote(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.noteDate}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notlarım</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('NoteEditor' as never)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyText}>Henüz not eklemediniz</Text>
          <Text style={styles.emptySubtext}>
            + butonuna tıklayarak yeni not ekleyin
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNoteCard}
          keyExtractor={(item) => item.id}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  noteContent: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
});