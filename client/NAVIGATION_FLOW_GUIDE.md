# React Navigation ve Auth Flow Rehberi

## 🎯 Genel Mimari

```
App.tsx (Root)
    │
    ├── AuthProvider (Context wrapper)
    │       │
    │       └── RootNavigator
    │               │
    │               ├── isLoggedIn === false → Navigator (AuthStack)
    │               │                              │
    │               │                              ├── Login Screen
    │               │                              └── Signup Screen
    │               │
    │               └── isLoggedIn === true → NavigatorMain (MainApp)
    │                                              │
    │                                              └── Dashboard Screen
```

---

## 📱 Uygulama Akışı (Step by Step)

### 1️⃣ **Uygulama İlk Açıldığında**

```
1. index.ts çalışır → App.tsx'i yükler
2. App.tsx render olur
3. AuthProvider tüm uygulamayı sarar
4. AuthProvider içinde isLoggedIn = false (başlangıç)
5. RootNavigator render olur
6. RootNavigator isLoggedIn kontrol eder → false
7. Navigator (AuthStack) gösterilir
8. Navigator içinde initialRouteName="Login" → Login ekranı açılır
```

**Sonuç:** Kullanıcı Login ekranını görür

---

### 2️⃣ **Kullanıcı Login Butonuna Bastığında**

```
1. Login.tsx içinde onPress tetiklenir
2. login() fonksiyonu çağrılır (AuthContext'ten)
3. AuthContext içinde:
   - setIsLoggedIn(true) çalışır
   - isLoggedIn state'i true olur
4. App.tsx otomatik re-render olur (state değişti)
5. RootNavigator isLoggedIn kontrol eder → true
6. NavigatorMain (MainApp) gösterilir
7. NavigatorMain içinde initialRouteName="Liste" → Dashboard açılır
```

**Sonuç:** Kullanıcı otomatik Dashboard ekranına yönlendirilir

---

### 3️⃣ **Kullanıcı Logout Butonuna Bastığında**

```
1. Dashboard içinde logout() fonksiyonu çağrılır
2. AuthContext içinde:
   - setIsLoggedIn(false) çalışır
   - isLoggedIn state'i false olur
3. App.tsx otomatik re-render olur
4. RootNavigator isLoggedIn kontrol eder → false
5. Navigator (AuthStack) gösterilir
6. Login ekranı açılır
```

**Sonuç:** Kullanıcı tekrar Login ekranına döner

---

## 🧩 Dosyaların Görevleri

### **App.tsx**
- **Görev:** Root component, tüm uygulamayı başlatır
- **Sorumluluklar:**
  - AuthProvider ile uygulamayı sarar
  - RootNavigator'ı render eder
  - NavigationContainer'ı tutar (SADECE BURADA!)

---

### **AuthContext.tsx**
- **Görev:** Global authentication state yönetimi
- **Sağladığı Değerler:**
  - `isLoggedIn`: boolean (giriş durumu)
  - `login()`: Giriş yapma fonksiyonu
  - `logout()`: Çıkış yapma fonksiyonu
- **Nasıl Kullanılır:**
  ```tsx
  const { isLoggedIn, login, logout } = useAuth();
  ```

---

### **Navigator.tsx (AuthStack)**
- **Görev:** Giriş öncesi ekranları yönetir
- **İçerdiği Ekranlar:**
  - Login
  - Signup
- **Ne Zaman Gösterilir:** `isLoggedIn === false`

---

### **MainAppnavigate.tsx (MainApp)**
- **Görev:** Giriş sonrası ekranları yönetir
- **İçerdiği Ekranlar:**
  - Dashboard (Liste)
  - İleride: Profile, Settings, vb.
- **Ne Zaman Gösterilir:** `isLoggedIn === true`

---

### **login.tsx**
- **Görev:** Login ekranı UI ve mantığı
- **Önemli Noktalar:**
  - `useAuth()` ile login fonksiyonunu alır
  - Login butonuna basınca `login()` çağrılır
  - Sign Up linki ile Signup ekranına geçiş yapar

---

## 🔄 React Navigation Temel Kavramlar

### **NavigationContainer**
- Tüm navigation state'ini tutar
- **SADECE 1 TANE OLMALI** (App.tsx'te)
- İç içe kullanılırsa hata verir: "Nested NavigationContainer"

### **Stack Navigator**
- Ekranları yığın (stack) şeklinde tutar
- Yeni ekran açılınca üste eklenir
- Geri tuşu ile önceki ekrana dönülür
- **Örnek:**
  ```
  Login → Signup (üste eklenir)
  Geri → Signup kaldırılır, Login görünür
  ```

### **navigation.navigate('ScreenName')**
- Belirtilen ekrana geçiş yapar
- Örnek: `navigation.navigate('Signup')` → Signup ekranına git

### **navigation.goBack()**
- Bir önceki ekrana döner
- Stack'ten en üstteki ekranı kaldırır

---

## 🎨 Context API Nasıl Çalışır?

### **1. Context Oluşturma**
```tsx
const AuthContext = createContext<AuthContextType>(...);
```

### **2. Provider ile Sarma**
```tsx
<AuthProvider>
  <App içeriği />
</AuthProvider>
```

### **3. Hook ile Kullanma**
```tsx
const { isLoggedIn, login, logout } = useAuth();
```

### **Neden Context?**
- Props drilling'den kurtarır
- Global state yönetimi sağlar
- Herhangi bir component'ten erişilebilir

**Örnek:**
```
AuthProvider içinde isLoggedIn = true yapıldığında,
App.tsx, Login.tsx, Dashboard.tsx
hepsi aynı anda bu değişikliği görür
```

---

## ✅ Önemli Kurallar

1. **NavigationContainer sadece App.tsx'te olmalı**
   - Navigator.tsx veya MainAppnavigate.tsx'te OLMAMALI

2. **useAuth() sadece AuthProvider içinde kullanılabilir**
   - RootNavigator, AuthProvider içinde olduğu için çalışır

3. **Component isimleri büyük harfle başlamalı**
   - ✅ `Login`, `Navigator`
   - ❌ `login`, `navigator`

4. **Stack.Screen name ve component farklı şeyler**
   - `name`: Navigation için kullanılan string
   - `component`: Render edilecek React component

---

## 🚀 İleride Eklenebilecekler

### **1. Email/Password State Yönetimi**
```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

### **2. API Entegrasyonu**
```tsx
const login = async () => {
  const response = await fetch('/api/login', { ... });
  if (response.ok) setIsLoggedIn(true);
};
```

### **3. Token Saklama**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async () => {
  // ...
  await AsyncStorage.setItem('token', token);
};
```

### **4. Yeni Ekranlar Ekleme**
```tsx
// MainAppnavigate.tsx içinde
<Stack.Screen name="Profile" component={ProfileScreen} />
<Stack.Screen name="Settings" component={SettingsScreen} />
```

---

## 🐛 Sık Karşılaşılan Hatalar

### **"Nested NavigationContainer"**
- **Sebep:** Birden fazla NavigationContainer kullanımı
- **Çözüm:** Sadece App.tsx'te bırak, diğerlerini kaldır

### **"Cannot find name 'isLoggedIn'"**
- **Sebep:** `useAuth()` yanlış kullanımı
- **Çözüm:** `const { login } = useAuth()` (fonksiyon al, boolean değil)

### **"useAuth must be used within AuthProvider"**
- **Sebep:** Component AuthProvider dışında
- **Çözüm:** Component'i AuthProvider içine al

---

## 📚 Özet

1. **App.tsx:** Ana başlatıcı, AuthProvider ve NavigationContainer burada
2. **AuthContext:** Global giriş durumu yönetimi
3. **Navigator (AuthStack):** Login/Signup ekranları
4. **NavigatorMain (MainApp):** Dashboard vb. ekranlar
5. **login():** isLoggedIn'i true yapar → MainApp'e geçiş
6. **logout():** isLoggedIn'i false yapar → Login'e dönüş

**Akış:** Login butonu → login() → isLoggedIn true → Dashboard göster
