import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { fetchtasks } from "../Components/Api";
import { useAuth } from "../context/AuthContext";

export const CalendarScreen = () => {
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Görevleri çek
  const fetchTasksData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = currentUser?.id === 0 ? undefined : currentUser?.id;
      const response = await fetchtasks(userId);
      
      if (response.ok) {
        const tasksData = await response.json();
        // Sadece tarihi olan görevleri al (due_date alanı)
        const tasksWithDate = tasksData.filter((t: any) => t.due_date);
        setTasks(tasksWithDate);
        console.log("Takvim görevleri yüklendi:", tasksWithDate.length, "görev");
      }
    } catch (error) {
      console.error("Takvim görevleri yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      console.log("CalendarScreen yüklendi");
      fetchTasksData();
    }, [fetchTasksData])
  );

  // Ay bilgilerini al
  const getMonthData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0);
    // Ayın kaç günü var
    const daysInMonth = lastDay.getDate();
    // Ayın ilk gününün haftanın hangi günü (0=Pazar, 1=Pazartesi, ...)
    const firstDayOfWeek = firstDay.getDay();
    
    return { year, month, daysInMonth, firstDayOfWeek };
  };

  // Belirli bir tarihteki görevleri getir
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((task: any) => {
      const taskDate = task.due_date?.split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Önceki ay
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Sonraki ay
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Ay adını getir
  const getMonthName = () => {
    const monthNames = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    return `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  };

  // Takvim günlerini render et
  const renderCalendar = () => {
    const { daysInMonth, firstDayOfWeek, year, month } = getMonthData();
    const days = [];
    
    // Boş günler (ayın başından önceki günler)
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <View style={styles.emptyDay} />
        </View>
      );
    }
    
    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const tasksForDay = getTasksForDate(date);
      const isToday = 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      
      const isSelected = 
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      
      days.push(
        <TouchableOpacity 
          key={day} 
          style={styles.dayCell}
          onPress={() => setSelectedDate(date)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.dayContainer, 
            isToday && styles.todayContainer,
            isSelected && styles.selectedContainer
          ]}>
            <Text style={[
              styles.dayNumber, 
              isToday && styles.todayNumber,
              isSelected && styles.selectedNumber
            ]}>
              {day}
            </Text>
            {tasksForDay.length > 0 && (
              <View style={styles.taskIndicator}>
                <View style={styles.taskDotIndicator} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  // Tüm görevleri tarih sırasına göre listele
  const renderTaskList = () => {
    // Eğer seçili tarih varsa, sadece o tarihteki görevleri göster
    let tasksToShow = tasks;
    
    if (selectedDate) {
      tasksToShow = getTasksForDate(selectedDate);
    }
    
    // Seçili tarih varsa
    if (selectedDate) {
      const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
      ];
      
      const dateTitle = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
      
      return (
        <View style={styles.taskListSection}>
          <View style={styles.taskListHeader}>
            <Text style={styles.sectionTitle}>Seçili Tarih</Text>
            <TouchableOpacity 
              onPress={() => setSelectedDate(null)}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Tümünü Göster</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={tasksToShow}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.taskDateTitle}>{dateTitle}</Text>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>Bu tarihte görev bulunmuyor</Text>
              </View>
            }
            renderItem={({ item: task }) => (
              <View style={styles.taskItem}>
                <View
                  style={[
                    styles.taskPriorityIndicator,
                    {
                      backgroundColor:
                        task.priority === "high"
                          ? "#EF4444"
                          : task.priority === "medium"
                          ? "#F59E0B"
                          : "#10B981",
                    },
                  ]}
                />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.description && (
                    <Text style={styles.taskDescription} numberOfLines={1}>
                      {task.description}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        task.status === "done"
                          ? "#D1FAE5"
                          : task.status === "progress"
                          ? "#DBEAFE"
                          : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          task.status === "done"
                            ? "#10B981"
                            : task.status === "progress"
                            ? "#3B82F6"
                            : "#F59E0B",
                      },
                    ]}
                  >
                    {task.status === "done"
                      ? "Tamamlandı"
                      : task.status === "progress"
                      ? "Devam Ediyor"
                      : "Bekliyor"}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      );
    }
    
    // Seçili tarih yoksa, tüm görevleri tarihe göre grupla
    const tasksByDate: { [key: string]: any[] } = {};
    
    tasks.forEach((task: any) => {
      const dateStr = task.due_date?.split('T')[0];
      if (dateStr && !tasksByDate[dateStr]) {
        tasksByDate[dateStr] = [];
      }
      if (dateStr) {
        tasksByDate[dateStr].push(task);
      }
    });
    
    // Tarihleri sırala
    const sortedDates = Object.keys(tasksByDate).sort();
    
    const monthNames = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    
    return (
      <View style={styles.taskListSection}>
        <View style={styles.taskListHeader}>
          <Text style={styles.sectionTitle}>Planlanan Görevler</Text>
        </View>
        <FlatList
          data={sortedDates}
          keyExtractor={(dateStr) => dateStr}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Tarihli görev bulunmuyor</Text>
            </View>
          }
          renderItem={({ item: dateStr }) => {
            const date = new Date(dateStr + 'T00:00:00');
            const dayTasks = tasksByDate[dateStr];
            
            return (
              <View style={styles.taskDateGroup}>
                <Text style={styles.taskDateTitle}>
                  {date.getDate()} {monthNames[date.getMonth()]} {date.getFullYear()}
                </Text>
                {dayTasks.map((task: any) => (
                  <View key={task.id} style={styles.taskItem}>
                    <View
                      style={[
                        styles.taskPriorityIndicator,
                        {
                          backgroundColor:
                            task.priority === "high"
                              ? "#EF4444"
                              : task.priority === "medium"
                              ? "#F59E0B"
                              : "#10B981",
                        },
                      ]}
                    />
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      {task.description && (
                        <Text style={styles.taskDescription} numberOfLines={1}>
                          {task.description}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            task.status === "done"
                              ? "#D1FAE5"
                              : task.status === "progress"
                              ? "#DBEAFE"
                              : "#FEF3C7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              task.status === "done"
                                ? "#10B981"
                                : task.status === "progress"
                                ? "#3B82F6"
                                : "#F59E0B",
                          },
                        ]}
                      >
                        {task.status === "done"
                          ? "Tamamlandı"
                          : task.status === "progress"
                          ? "Devam Ediyor"
                          : "Bekliyor"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Takvim yükleniyor...</Text>
      </View>
    );
  }

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
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={32} color="#6366F1" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Görev Takvimi</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.length} görev planlandı
          </Text>
        </View>
      </View>

      {/* Takvim Başlığı */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#6366F1" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{getMonthName()}</Text>
        
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Haftanın Günleri */}
      <View style={styles.weekDays}>
        {["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"].map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Takvim Grid */}
      <View style={styles.calendarGrid}>{renderCalendar()}</View>

      {/* Görev Listesi */}
      {renderTaskList()}
      
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
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
  scrollView: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  weekDays: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dayCell: {
    width: "14.28%", // 7 gün
    aspectRatio: 1,
    padding: 2,
  },
  emptyDay: {
    flex: 1,
  },
  dayContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    borderRadius: 8,
  },
  todayContainer: {
    backgroundColor: "#EEF2FF",
  },
  selectedContainer: {
    backgroundColor: "#C7D2FE",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  todayNumber: {
    color: "#6366F1",
    fontWeight: "bold",
  },
  selectedNumber: {
    color: "#4338CA",
    fontWeight: "bold",
  },
  taskIndicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  taskIndicator: {
    marginTop: 2,
  },
  taskDotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6366F1",
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreText: {
    fontSize: 8,
    color: "#64748B",
    marginLeft: 2,
  },
  taskListSection: {
    flex: 1,
    padding: 16,
  },
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  taskDateGroup: {
    marginBottom: 20,
  },
  taskDateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  taskPriorityIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 13,
    color: "#64748B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
});
