import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Login } from '../AuthStack/login';
import { Signup } from '../AuthStack/signup';

/**
 * Stack Navigator nedir?
 * - React Navigation'ın ekran yığını (stack) yönetimi yapan navigator'ı
 * - Mobil uygulamalarda en yaygın navigasyon türüdür
 * - Ekranlar üst üste yığılır, geri tuşu ile önceki ekrana dönülür
 * 
 * Örnek akış:
 * Login ekranı → Signup ekranı (üste eklenir)
 * Geri tuş → Signup kaldırılır, Login görünür
 */

// Stack Navigator instance'ı oluştur
const Stack = createStackNavigator();

/**
 * Navigator (AuthStack): Login ve Signup ekranlarını yöneten Stack Navigator
 * 
 * Bu Navigator:
 * - Kullanıcı giriş yapmadığında gösterilir (App.tsx'te isLoggedIn === false)
 * - İki ekran içerir: Login ve Signup
 * - Kullanıcı Login ekranından Signup'a geçebilir (Stack mantığı ile)
 * 
 * Stack.Navigator Props:
 * - initialRouteName: İlk hangi ekran gösterilsin? → "Login"
 * - screenOptions: Tüm ekranlar için geçerli ayarlar
 *   - headerShown: false → Üstteki başlık çubuğunu gizle (custom UI için)
 */
export const Navigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"  // İlk ekran: Login
      screenOptions={{
        headerShown: false,  // Başlık çubuğunu gizle (custom tasarım kullanıyoruz)
      }}
    >
      {/* 
        Stack.Screen: Navigator içindeki her bir ekran
        
        Props:
        - name: Ekran adı (navigation.navigate('Login') ile kullanılır)
        - component: Gösterilecek React component
        
        Not: Buraya eklenen sıra önemli değil, initialRouteName belirler
      */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      
      {/* 
        Kullanım:
        Login ekranında: navigation.navigate('Signup') → Signup ekranına geç
        Signup ekranında: navigation.goBack() → Login'e dön
      */}
    </Stack.Navigator>
  );
};