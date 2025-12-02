# 📧 Gmail App Password Kurulum Rehberi

## ⚠️ ÖNEMLİ: Email gönderimi için mutlaka yapılması gerekenler

---

## 🔐 ADIM 1: Gmail App Password Oluştur

### 1.1 Gmail Hesabına Giriş Yap
- Gmail hesabına giriş yap: https://myaccount.google.com/

### 1.2 2-Faktörlü Doğrulamayı Aç
1. **Güvenlik** sekmesine tıkla
2. **Google'da oturum açma** bölümünü bul
3. **2 Adımlı Doğrulama** özelliğini **AÇ**
4. Telefon numaranı doğrula

### 1.3 App Password Oluştur
1. Tekrar **Güvenlik** sekmesine git
2. **Google'da oturum açma** bölümünde **Uygulama şifreleri** ara
3. **Uygulama şifreleri**'ne tıkla
4. **Uygulama seç** → **Diğer (Özel ad)** seç
5. İsim yaz: `Proje Yonetici App`
6. **Oluştur**'a tıkla
7. **16 haneli şifreyi kopyala** (boşluksuz)

📋 Örnek App Password: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

---

## 📝 ADIM 2: Server.js Dosyasını Güncelle

### 2.1 Dosyayı Aç
```bash
mock_api/server.js
```

### 2.2 Gmail Bilgilerini Değiştir
**13-18. satırları bul:**

```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'sait1223ari@gmail.com',    // 👈 Buraya SENİN Gmail adresini yaz
    pass: 'dpok bjgk yiom qkjt'       // 👈 Buraya ADIM 1'de aldığın 16 haneli şifreyi yaz
  }
});
```

### 2.3 Örnek Güncel Kod
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'benimgmailim@gmail.com',    // Senin Gmail adresin
    pass: 'abcdefghijklmnop'           // App Password (boşluksuz 16 hane)
  }
});
```

### 2.4 Dosyayı Kaydet
✅ `Ctrl + S` ile kaydet

---

## 🚀 ADIM 3: Server'ı Çalıştır

### Terminal'de komutları sırayla çalıştır:

```bash
# 1. mock_api klasörüne git
cd c:\expoReactProject\ProjeYonetici\mock_api

# 2. Server'ı başlat
npm start
```

### ✅ Başarılı Çıktı:
```
🚀 Server çalışıyor: http://localhost:3001
📊 Database: http://localhost:3001/users
📧 Email: http://localhost:3001/send-email
```

---

## 🧪 ADIM 4: Email Test Et

### 4.1 Test Endpoint'i Kontrol Et
Tarayıcıda aç:
```
http://localhost:3001/test-email
```

Görmek istediğin:
```json
{
  "message": "📧 Email servisi çalışıyor!",
  "timestamp": "2024-..."
}
```

### 4.2 Mobil Uygulamadan Test Et
1. **Expo** uygulamasını çalıştır
2. **Giriş ekranı** → **Şifremi Unuttum**'a tıkla
3. **Email adresini** gir (gerçek bir Gmail)
4. **Kod Gönder** butonuna bas
5. **Gmail kutunu kontrol et** ✉️

---

## ❌ Sık Karşılaşılan Hatalar

### HATA 1: `EAUTH - Invalid login`
**Neden:** Gmail App Password yanlış veya eski
**Çözüm:**
- App Password'u tekrar oluştur
- Boşluksuz 16 hane olduğuna emin ol
- `server.js` dosyasını kaydettiğinden emin ol
- Server'ı yeniden başlat: `npm start`

### HATA 2: `ENOTFOUND smtp.gmail.com`
**Neden:** İnternet bağlantısı yok
**Çözüm:**
- İnternet bağlantını kontrol et
- VPN varsa kapat/değiştir

### HATA 3: `Port 3001 already in use`
**Neden:** Başka bir server zaten çalışıyor
**Çözüm:**
```bash
# Windows'ta port'u kullanan programı bul ve kapat
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Sonra tekrar başlat
npm start
```

### HATA 4: Email gelmiyor
**Kontrol listesi:**
- ✅ Gmail App Password doğru mu?
- ✅ 2-Faktörlü doğrulama açık mı?
- ✅ Server konsol'da `✅ Email gönderildi` yazıyor mu?
- ✅ Spam klasörünü kontrol ettin mi?
- ✅ Email adresini doğru yazdın mı?

---

## 📱 Mobil Uygulama Ayarları

### Android Emulator için URL:
```javascript
// client/AuthStack/AuthScreen.tsx - 139. satır
const response = await fetch("http://10.0.2.2:3001/send-email", {
```

### Gerçek Android Telefon için:
1. Bilgisayarın IP adresini bul:
```bash
ipconfig
# IPv4 Address: 192.168.1.XXX
```

2. AuthScreen.tsx'te güncelle:
```javascript
const response = await fetch("http://192.168.1.XXX:3001/send-email", {
```

### iPhone/iOS için:
```javascript
const response = await fetch("http://localhost:3001/send-email", {
```

---

## 🎯 Özet Kontrol Listesi

- [ ] Gmail App Password oluşturdum (16 hane)
- [ ] `server.js` dosyasına Gmail ve App Password'u yazdım
- [ ] Dosyayı kaydettim (`Ctrl + S`)
- [ ] `npm start` ile server'ı başlattım
- [ ] Terminal'de "🚀 Server çalışıyor" mesajını gördüm
- [ ] `http://localhost:3001/test-email` test endpoint'i çalışıyor
- [ ] Mobil uygulamada "Şifremi Unuttum" butonuna basabiliyorum
- [ ] Email kutuma 6 haneli kod geldi ✉️

---

## 🔥 Hızlı Başlangıç (Tüm Adımlar)

```bash
# 1. Gmail App Password al (16 hane)
# 2. server.js dosyasını güncelle
# 3. Terminal'de:

cd c:\expoReactProject\ProjeYonetici\mock_api
npm start

# 4. Başka bir terminal'de Expo'yu çalıştır:
cd c:\expoReactProject\ProjeYonetici\client
npm start

# 5. Mobil uygulamayı test et
```

---

## 🆘 Yardım

Hala çalışmıyorsa:
1. Server konsol loglarını kontrol et
2. Expo Developer Tools konsol loglarını kontrol et
3. `server.js` dosyasındaki Gmail bilgilerini tekrar kontrol et
4. Server'ı yeniden başlat: `npm start`
5. Expo uygulamasını yeniden başlat: `r` tuşuna bas

**Başarılar! 🚀**
