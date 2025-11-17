import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthScreen } from "./AuthStack/AuthScreen";
import { MainAppTabs } from "./Components/TabBar";
import { AuthProvider, useAuth } from "./context/AuthContext";

const RootNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainAppTabs /> : <AuthScreen />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}