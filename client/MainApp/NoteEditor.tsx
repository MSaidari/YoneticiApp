import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { addNote, updateNote } from "../Components/Api";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  userId: number | string;
}

export const NoteEditor = () => {
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const editingNote = (route.params as any)?.note as Note | undefined;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    }
  }, [editingNote]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Uyarı", "Lütfen başlık ve içerik girin");
      return;
    }

    try {
      if (editingNote) {
        // Güncelleme
        const response = await updateNote(editingNote.id, {
          title,
          content,
        });
        if (response.ok) {
          Alert.alert("Başarılı", "Not güncellendi");
          navigation.goBack();
        }
      } else {
        // Yeni not
        const newNote = {
          title,
          content,
          createdAt: new Date().toISOString(),
        };
        const response = await addNote(newNote, currentUser?.id);
        if (response.ok) {
          Alert.alert("Başarılı", "Not kaydedildi");
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Not kaydetme hatası:", error);
      Alert.alert("Hata", "Not kaydedilirken bir hata oluştu");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingNote ? "Notu Düzenle" : "Yeni Not"}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Editor */}
      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Not başlığı..."
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#94A3B8"
        />
        
        <TextInput
          style={styles.contentInput}
          placeholder="Not içeriği..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#94A3B8"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 20,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    color: "#1E293B",
    lineHeight: 24,
    flex: 1,
    minHeight: 400,
    padding: 0,
  },
});
