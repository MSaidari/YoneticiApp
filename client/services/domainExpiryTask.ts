import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { send } from '@emailjs/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Task adı - unique olmalı
const DOMAIN_EXPIRY_CHECK_TASK = 'DOMAIN_EXPIRY_CHECK_TASK';

/**
 * getDaysUntilExpiry: Tarihe kaç gün kaldığını hesaplar
 */
const getDaysUntilExpiry = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * sendDomainExpiryEmail: Domain süresi uyarı maili gönderir
 */
const sendDomainExpiryEmail = async (
  domainName: string,
  daysLeft: number,
  userEmail: string,
  userName: string
) => {
  try {
    console.log('📧 [Background] Domain uyarı maili gönderiliyor...', { domainName, daysLeft });
    
    await send(
      'service_3opw15v',
      'template_275t45i',
      {
        to_email: userEmail,
        to_name: userName,
        domain_name: domainName,
        days_left: daysLeft.toString(),
        urgency_level: daysLeft === 1 ? 'KRİTİK' : 'UYARI',
        subject: `⚠️ ${domainName} - ${daysLeft} Gün Kaldı!`,
      },
      {
        publicKey: 'jJcyM6dYafOOHXD7C',
      }
    );

    console.log('✅ [Background] Mail başarıyla gönderildi!');
    return true;
  } catch (error: any) {
    console.error('❌ [Background] Mail gönderilemedi:', error);
    return false;
  }
};

/**
 * checkDomains: Tüm domainleri kontrol eder
 */
const checkDomains = async () => {
  try {
    console.log('🔍 [Background] Domain kontrolü başlatılıyor...');
    
    // AsyncStorage'dan kullanıcı bilgisini al
    const userDataStr = await AsyncStorage.getItem('currentUser');
    if (!userDataStr) {
      console.log('⚠️ [Background] Kullanıcı bilgisi bulunamadı');
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const API_URL = Platform.OS === 'android' 
      ? 'http://10.0.2.2:3001' 
      : 'http://localhost:3001';
    
    // Domainleri API'den çek
    const response = await fetch(`${API_URL}/domains?userId=${userData.id}`);
    if (!response.ok) {
      throw new Error('Domain verileri alınamadı');
    }
    
    const domains = await response.json();
    console.log(`📊 [Background] ${domains.length} domain bulundu`);
    
    // Bugün için zaten mail gönderilmiş mi kontrol et
    const lastCheckDate = await AsyncStorage.getItem('lastDomainCheckDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastCheckDate === today) {
      console.log('✓ [Background] Bugün zaten kontrol yapılmış');
      return;
    }
    
    // Her domain için kontrol
    let mailSentCount = 0;
    for (const domain of domains) {
      if (!domain.date) continue;
      
      const daysLeft = getDaysUntilExpiry(domain.date);
      
      // 30 gün veya 1 gün kaldığında mail gönder
      if (daysLeft === 30 || daysLeft === 1) {
        const sent = await sendDomainExpiryEmail(
          domain.domain,
          daysLeft,
          userData.email,
          userData.name
        );
        
        if (sent) {
          mailSentCount++;
          // Biraz bekle (rate limiting için)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Son kontrol tarihini kaydet
    await AsyncStorage.setItem('lastDomainCheckDate', today);
    console.log(`✅ [Background] Kontrol tamamlandı - ${mailSentCount} mail gönderildi`);
    
  } catch (error) {
    console.error('❌ [Background] Domain kontrol hatası:', error);
  }
};

/**
 * Background Task Tanımı
 */
TaskManager.defineTask(DOMAIN_EXPIRY_CHECK_TASK, async () => {
  try {
    console.log('🚀 [Background Task] Domain expiry check başlatıldı');
    await checkDomains();
    
    // Task başarılı
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ [Background Task] Hata:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Background Task'ı kaydet ve başlat
 */
export const registerDomainExpiryTask = async () => {
  try {
    // Önce zaten kayıtlı mı kontrol et
    const isRegistered = await TaskManager.isTaskRegisteredAsync(DOMAIN_EXPIRY_CHECK_TASK);
    
    if (isRegistered) {
      console.log('✓ Domain expiry task zaten kayıtlı');
      return;
    }
    
    // Task'ı kaydet
    await BackgroundFetch.registerTaskAsync(DOMAIN_EXPIRY_CHECK_TASK, {
      minimumInterval: 60 * 60 * 24, // 24 saat (saniye cinsinden)
      stopOnTerminate: false, // Uygulama kapanınca da çalışsın
      startOnBoot: true, // Telefon açılınca başlasın
    });
    
    console.log('✅ Domain expiry background task kaydedildi');
  } catch (error) {
    console.error('❌ Background task kayıt hatası:', error);
  }
};

/**
 * Background Task'ı kaldır
 */
export const unregisterDomainExpiryTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(DOMAIN_EXPIRY_CHECK_TASK);
    console.log('✅ Domain expiry task kaldırıldı');
  } catch (error) {
    console.error('❌ Task kaldırma hatası:', error);
  }
};

/**
 * Task durumunu kontrol et
 */
export const checkTaskStatus = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(DOMAIN_EXPIRY_CHECK_TASK);
    const status = await BackgroundFetch.getStatusAsync();
    
    console.log('📊 Background Task Durumu:', {
      isRegistered,
      status: status === BackgroundFetch.BackgroundFetchStatus.Available 
        ? 'Kullanılabilir' 
        : 'Kullanılamaz',
    });
    
    return { isRegistered, status };
  } catch (error) {
    console.error('❌ Task durum kontrolü hatası:', error);
    return null;
  }
};

/**
 * Manuel test için - hemen çalıştır
 */
export const testDomainCheck = async () => {
  console.log('🧪 Manuel test başlatılıyor...');
  await checkDomains();
};
