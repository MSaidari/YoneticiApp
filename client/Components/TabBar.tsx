import { View, Platform, StyleSheet } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dashboard } from '../MainApp/DashboardScreen';
import { DomainListScreen, } from '../MainApp/DomainListScreen';
import { TaskListScreen } from '../MainApp/TaskListScreen';
import { SupportPassword,} from "../MainApp/Supportpassword";
import { Notes } from "../MainApp/notes";
import { UsersScreen } from "../MainApp/UsersScreen";
import { useAuth } from "../context/AuthContext";

// Tab Navigator oluştur
const Tab = createBottomTabNavigator();

// Custom Tab Bar component
export function MyTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.tabBarContainer,
      { paddingBottom: Math.max(insets.bottom, 10) }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? '#6366F1' : '#64748B' }
            ]}>
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

// Main App Tab Navigator - Tüm ekranlarda kullanılacak
export function MainAppTabs() {
  const { isAdmin } = useAuth();
  
  return (
    <Tab.Navigator 
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false, // Üst başlığı gizle
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Domain" component={DomainListScreen} />
      <Tab.Screen name="Görev" component={TaskListScreen} />
      <Tab.Screen name='Sifre Destek' component={SupportPassword} />
      {isAdmin && (
        <Tab.Screen name="Kullanıcılar" component={UsersScreen} />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

