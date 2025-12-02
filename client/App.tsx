import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthScreen } from "./AuthStack/AuthScreen";
import { MainAppTabs } from "./Components/TabBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Notes } from "./MainApp/notes";
import { NoteEditor } from "./MainApp/NoteEditor";

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainAppTabs} />
      <Stack.Screen name="Notlar" component={Notes} />
      <Stack.Screen name="NoteEditor" component={NoteEditor} />
    </Stack.Navigator>
  );
};

const RootNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStack /> : <AuthScreen />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}