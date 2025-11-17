import React, { useState } from "react";
import {
  View, // Temel container component (div gibi)
  StyleSheet, // CSS benzeri stil tanımlamaları için
  Text, // Metin gösterimi için
  TouchableOpacity, // Dokunulabilir buton component'i (tıklama animasyonu ile)
  TextInput, // Kullanıcıdan metin girişi almak için
  ScrollView, // İçeriği kaydırılabilir yapmak için (overflow: scroll gibi)
  KeyboardAvoidingView, // Klavye açıldığında içeriği yukarı kaydırır, inputların klavyenin altında kalmasını önler
  Platform, // iOS mu Android mi kontrol etmek için (Platform.OS === "ios" veya "android")
  Alert, // Native alert dialog'ları göstermek için (window.alert gibi ama daha güzel)
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Icon kütüphanesi (FontAwesome, Material Icons gibi binlerce icon içerir)
import { addDomain } from "../Components/Api"; // API işlemleri için custom fonksiyonumuz

export const domainadd = () => {
  // useState: React Hook - Component state'i yönetir
  // [değişken, değiştirme fonksiyonu] = useState(başlangıç değeri)
  const [domainName, setDomainName] = useState(""); // Domain adı state'i
  const [provider, setProvider] = useState(""); // Provider adı state'i
  const [expiryDate, setExpiryDate] = useState(""); // Bitiş tarihi state'i
  const [loading, setLoading] = useState(false); // Yükleme durumu (true/false)

  // async/await: Asenkron işlemler için (API çağrıları gibi)
  // async fonksiyon Promise döner, await ile beklenir
  const handleSaveDomain = async () => {
    // trim(): String'in başındaki ve sonundaki boşlukları temizler
    // "  test  ".trim() → "test"
    if (!domainName.trim()) {
      // Alert.alert: Native alert dialog'u gösterir
      // Parametreler: (başlık, mesaj, [butonlar])
      Alert.alert("Hata", "Domain adı boş olamaz!");
      return; // Fonksiyondan çık
    }

    if (!provider.trim()) {
      Alert.alert("Hata", "Provider adı boş olamaz!");
      return;
    }

    setLoading(true); // Yükleme başladı, butonu disable et
    try {
      // await: API isteği tamamlanana kadar bekle
      // addDomain: Api.tsx'teki custom fonksiyonumuz (POST request)
      await addDomain({
        domain: domainName.trim().toLowerCase(), // toLowerCase(): Tüm harfleri küçük yapar
        provider: provider.trim(),
        date: expiryDate || new Date().toISOString(), // || : Eğer boşsa bugünün tarihi
        userId: 1, // Örnek kullanıcı ID
      });

      // İşlem başarılı - Alert göster
      Alert.alert("Başarılı", "Domain başarıyla eklendi!", [
        {
          text: "Tamam",
          // onPress: Butona basıldığında çalışacak fonksiyon
          // handleClear fonksiyonunu çağır (kod tekrarı yerine mevcut fonksiyonu kullan)
          onPress: handleClear, // Veya () => handleClear() şeklinde de yazılabilir
        },
      ]);
    } catch (error) {
      // Hata yakalandı (API hatası, network hatası vb.)
      Alert.alert("Hata", "Domain eklenirken bir hata oluştu!");
      console.error("Domain ekleme hatası:", error);
    } finally {
      // try veya catch'ten sonra her durumda çalışır
      setLoading(false); // Yükleme bitti, butonu tekrar aktif et
    }
  };

  // Form temizleme fonksiyonu
  const handleClear = () => {
    setDomainName(""); // State'i boş string'e set et
    setProvider("");
    setExpiryDate("");
  };

  return (
    // KeyboardAvoidingView: Klavye açıldığında içeriği yukarı kaydırır
    // iOS'ta "padding", Android'de "height" davranışı kullanılır
    // Bu sayede TextInput'lar klavyenin altında kalmaz
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Platform kontrolü
    >
      {/* ScrollView: İçeriği kaydırılabilir yapar */}
      {/* contentContainerStyle: İçerik container'ının stil'i */}
      {/* keyboardShouldPersistTaps="handled": Klavye açıkken de tıklamaları algıla */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContainer}>
          {/* Üst icon ve yazı */}
          <View style={styles.header}>
            {/* Ionicons: Icon component'i */}
            {/* name: Icon adı (https://icons.expo.fyi/ adresinden bulunabilir) */}
            {/* size: Icon boyutu (px) */}
            {/* color: Icon rengi (hex veya color name) */}
            <Ionicons name="globe-outline" size={48} color="#6366F1" />
            <Text style={styles.title}>Domain Ekle</Text>
            <Text style={styles.subtitle}>
              Yeni bir domain kaydı oluşturun.
            </Text>
          </View>

          {/* Card design */}
          <View style={styles.Carddesign}>
            {/* Domain adı View */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Domain Adı</Text>
              <View style={styles.TextinputView}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color="#6366F1"
                  style={styles.icon}
                />
                {/* TextInput: Kullanıcıdan metin girişi alan component */}
                {/* value: Input'un değeri (state'ten gelir) */}
                {/* onChangeText: Her karakter girildiğinde çalışır, yeni değeri parametre olarak alır */}
                {/* placeholder: İpucu metni (input boşken görünür) */}
                {/* placeholderTextColor: Placeholder'ın rengi */}
                {/* autoCapitalize: Otomatik büyük harf ("none", "sentences", "words", "characters") */}
                {/* keyboardType: Açılacak klavye tipi ("default", "email-address", "numeric", "phone-pad", "url" vb.) */}
                <TextInput
                  style={styles.input}
                  placeholder="örnek: google.com"
                  placeholderTextColor="#94A3B8"
                  value={domainName}
                  onChangeText={setDomainName} // setDomainName(yeniDeğer) otomatik çağrılır
                  autoCapitalize="none" // Büyük harfe çevirme
                  keyboardType="url" // URL klavyesi (. ve / tuşları kolay erişilebilir)
                />
              </View>
            </View>

            {/* Provider View */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Provider</Text>
              <View style={styles.TextinputView}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#6366F1"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="örnek: GoDaddy, Namecheap, Hostinger"
                  placeholderTextColor="#94A3B8"
                  value={provider}
                  onChangeText={setProvider}
                />
              </View>
            </View>

            {/* Expiry Date View */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expiry Date</Text>
              <View style={styles.TextinputView}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#6366F1"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="örnek: 2025-12-31"
                  placeholderTextColor="#94A3B8"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                />
              </View>
              <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
            </View>

            {/* Butonlar View */}
            <View style={styles.buttonContainer}>
              {/* TouchableOpacity: Dokunulabilir component */}
              {/* onPress: Tıklandığında çalışacak fonksiyon */}
              {/* activeOpacity: Basıldığında opacity değeri (0-1 arası, 1 = opak, 0 = transparan) */}
              {/* style: Stil objesi veya stil objesi array'i */}
              
              {/* Temizle Butonu */}
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7} // %70 opacity (basıldığında hafif soluklaşır)
              >
                <Ionicons name="refresh-outline" size={20} color="#EF4444" />
                <Text style={styles.clearButtonText}>Temizle</Text>
              </TouchableOpacity>

              {/* Kaydet Butonu */}
              <TouchableOpacity
                // style array: Birden fazla stil birleştirir
                // loading true ise saveButtonDisabled stili de eklenir
                style={[
                  styles.saveButton,
                  loading && styles.saveButtonDisabled, // && : Conditional style (loading true ise ekle)
                ]}
                onPress={handleSaveDomain}
                disabled={loading} // true ise buton tıklanamaz
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFF"
                />
                {/* Ternary operator: koşul ? doğruysa : yanlışsa */}
                {/* loading true ise "Kaydediliyor...", false ise "Kaydet" göster */}
                <Text style={styles.saveButtonText}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle"
              size={24}
              color="#3B82F6"
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Bilgi</Text>
              <Text style={styles.infoText}>
                Domain kaydı oluşturulduktan sonra listede görüntülenecektir.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// StyleSheet.create(): Stil objelerini optimize eder ve performans artırır
// CSS gibi ama camelCase ile yazılır (background-color → backgroundColor)
const styles = StyleSheet.create({
  // container: Ana container (full screen)
  container: {
    flex: 1, // flex: 1 → Tüm boş alanı kapla (height: 100vh gibi)
    backgroundColor: "#F8FAFC", // Açık gri arka plan
  },
  // scrollContent: ScrollView'ın içeriğinin stil'i
  scrollContent: {
    flexGrow: 1, // İçerik küçükse de scroll container'ı full height olsun
  },
  // mainContainer: İçeriklerin ana container'ı
  mainContainer: {
    flex: 1,
    justifyContent: "center", // Dikey ortalama (CSS: justify-content)
    alignItems: "center", // Yatay ortalama (CSS: align-items)
    padding: 20, // Tüm kenarlardan 20px boşluk
  },
  // header: Üst kısım (icon + başlık + alt başlık)
  header: {
    alignItems: "center", // Yatay ortalama
    marginBottom: 30, // Alt boşluk 30px
  },
  // title: "Domain Ekle" başlığı
  title: {
    fontSize: 28, // Font boyutu 28px
    fontWeight: "bold", // Kalın yazı
    color: "#1E293B", // Koyu gri
    marginTop: 16, // Üst boşluk 16px
    marginBottom: 8, // Alt boşluk 8px
  },
  // subtitle: "Yeni bir domain kaydı oluşturun" alt başlığı
  subtitle: {
    fontSize: 15,
    color: "#64748B", // Orta ton gri
    textAlign: "center", // Metni ortala
  },
  // Carddesign: Ana form kartı (beyaz kutu)
  Carddesign: {
    alignItems: "center",
    backgroundColor: "white", // Beyaz arka plan
    width: "100%", // Genişlik %100
    maxWidth: 400, // Maksimum 400px (büyük ekranlarda çok geniş olmasın)
    borderRadius: 24, // Köşe yuvarlaklığı 24px
    padding: 32, // İç boşluk 32px
    // Shadow (iOS için)
    shadowColor: "#000", // Gölge rengi siyah
    shadowOffset: { width: 0, height: 10 }, // Gölge 10px aşağıda
    shadowOpacity: 0.1, // Gölge %10 opacity
    shadowRadius: 20, // Gölge bulanıklığı 20px
    // Elevation (Android için - iOS'ta çalışmaz)
    elevation: 8, // Android elevation (yükseklik) 8
    marginBottom: 20,
  },
  // inputGroup: Her input'un container'ı (label + input wrapper)
  inputGroup: {
    width: "100%",
    marginBottom: 24, // Input'lar arası boşluk
  },
  // label: Input üstündeki etiket (Domain Adı, Provider vb.)
  label: {
    fontSize: 15,
    fontWeight: "600", // Semi-bold
    color: "#334155", // Koyu gri
    marginBottom: 8, // Label ile input arası boşluk
  },
  // TextinputView: Input + icon container'ı
  TextinputView: {
    flexDirection: "row", // Yan yana yerleştir (icon + input)
    alignItems: "center", // Dikey ortalama
    backgroundColor: "#F1F5F9", // Açık gri arka plan
    width: "100%",
    borderRadius: 12, // Köşe yuvarlaklığı
    paddingHorizontal: 16, // Yatay iç boşluk
    paddingVertical: 14, // Dikey iç boşluk
    borderWidth: 1, // Border kalınlığı 1px
    borderColor: "#E2E8F0", // Border rengi açık gri
  },
  // icon: Input içindeki icon'un stil'i
  icon: {
    marginRight: 12, // Icon ile input arası boşluk
  },
  // input: TextInput component'inin stil'i
  input: {
    flex: 1, // Kalan tüm alanı kapla
    fontSize: 16,
    color: "#1E293B", // Yazı rengi
    padding: 0, // Default padding'i kaldır
  },
  // hint: Input altındaki ipucu metni (Format: YYYY-MM-DD)
  hint: {
    fontSize: 12,
    color: "#94A3B8", // Açık gri
    marginTop: 6, // Input ile hint arası boşluk
    marginLeft: 4,
  },
  // buttonContainer: Temizle + Kaydet butonlarının container'ı
  buttonContainer: {
    flexDirection: "row", // Yan yana yerleştir
    width: "100%",
    gap: 12, // Butonlar arası boşluk (yeni özellik)
    marginTop: 8,
  },
  // clearButton: Temizle butonu (kırmızı)
  clearButton: {
    flex: 1, // Eşit genişlik paylaş
    flexDirection: "row", // Icon + text yan yana
    alignItems: "center",
    justifyContent: "center", // İçeriği ortala
    backgroundColor: "#FEE2E2", // Açık kırmızı arka plan
    borderRadius: 12,
    paddingVertical: 16, // Dikey padding 16px (buton yüksekliği)
    gap: 8, // Icon ile text arası boşluk
  },
  // clearButtonText: Temizle buton metni
  clearButtonText: {
    color: "#EF4444", // Kırmızı
    fontSize: 16,
    fontWeight: "600",
  },
  // saveButton: Kaydet butonu (mavi)
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1", // Mavi arka plan
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    // Shadow (iOS için)
    shadowColor: "#6366F1", // Gölge mavimsi
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4, // Android elevation
  },
  // saveButtonDisabled: Loading true iken buton disabled stil'i
  saveButtonDisabled: {
    backgroundColor: "#94A3B8", // Gri (pasif görünüm)
    shadowOpacity: 0, // Gölgeyi kaldır
  },
  // saveButtonText: Kaydet buton metni
  saveButtonText: {
    color: "#FFFFFF", // Beyaz
    fontSize: 16,
    fontWeight: "bold",
  },
  // infoCard: Alt bilgi kartı (mavi)
  infoCard: {
    flexDirection: "row", // Icon + text yan yana
    backgroundColor: "#DBEAFE", // Açık mavi arka plan
    borderRadius: 12,
    padding: 16,
    alignItems: "flex-start", // Üstten hizala (icon yukarıda)
    width: "100%",
    maxWidth: 400,
  },
  // infoTextContainer: Bilgi metinlerinin container'ı
  infoTextContainer: {
    flex: 1, // Kalan alanı kapla
    marginLeft: 12, // Icon ile text arası boşluk
  },
  // infoTitle: "Bilgi" başlığı
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E40AF", // Koyu mavi
    marginBottom: 4,
  },
  // infoText: Bilgi açıklama metni
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20, // Satır yüksekliği (okunabilirlik için)
  },
});
