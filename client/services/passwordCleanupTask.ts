import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchPasswords, deletePassword } from '../Components/Api';

// Task adı (unique identifier)
const PASSWORD_CLEANUP_TASK = 'PASSWORD_CLEANUP_TASK';

/**
 * Background Task: Eski şifreleri otomatik siler
 * - Her gün gece 00:00'da çalışır
 * - 1 günden eski şifreleri bulur ve siler
 * - Uygulama kapalıyken bile çalışır
 */
TaskManager.defineTask(PASSWORD_CLEANUP_TASK, async () => {
  try {
    console.log('🕐 Background Task Başladı: Eski şifreler kontrol ediliyor...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tüm şifreleri getir
    const response = await fetchPasswords();
    const passwords = await response.json();
    
    if (!Array.isArray(passwords)) {
      console.log('❌ Şifreler alınamadı');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
    
    // 1 günden eski şifreleri bul
    const oldPasswords = passwords.filter((p: any) => {
      const createdDate = new Date(p.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate < today;
    });
    
    if (oldPasswords.length === 0) {
      console.log('✅ Silinecek eski şifre yok');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    console.log(`🗑️ ${oldPasswords.length} eski şifre siliniyor...`);
    
    // Eski şifreleri sil
    for (const password of oldPasswords) {
      try {
        await deletePassword(password.id);
        console.log(`✅ Şifre silindi: ${password.id}`);
      } catch (error) {
        console.error(`❌ Şifre silme hatası (${password.id}):`, error);
      }
    }
    
    console.log('✅ Background Task Tamamlandı');
    return BackgroundFetch.BackgroundFetchResult.NewData;
    
  } catch (error) {
    console.error('❌ Background Task Hatası:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Background Task'ı Başlat
 * - Her gün gece 00:00'da çalışacak şekilde ayarlanır
 * - Minimum interval: 15 dakika (Expo/Android sınırı)
 */
export async function registerPasswordCleanupTask() {
  try {
    // Zaten kayıtlı mı kontrol et
    const isRegistered = await TaskManager.isTaskRegisteredAsync(PASSWORD_CLEANUP_TASK);
    
    if (isRegistered) {
      console.log('✅ Background Task zaten kayıtlı');
      return;
    }
    
    // Background Fetch iznini kontrol et
    const status = await BackgroundFetch.getStatusAsync();
    
    if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
      // Task'ı kaydet
      await BackgroundFetch.registerTaskAsync(PASSWORD_CLEANUP_TASK, {
        minimumInterval: 60 * 60 * 24, // 24 saat (1 gün)
        stopOnTerminate: false, // Uygulama kapansa bile çalışır
        startOnBoot: true, // Cihaz yeniden başlarsa otomatik başlar
      });
      
      console.log('✅ Background Task başarıyla kaydedildi');
    } else {
      console.warn('⚠️ Background Fetch kullanılamıyor:', status);
    }
  } catch (error) {
    console.error('❌ Background Task kayıt hatası:', error);
  }
}

/**
 * Background Task'ı Durdur
 */
export async function unregisterPasswordCleanupTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(PASSWORD_CLEANUP_TASK);
    console.log('✅ Background Task durduruldu');
  } catch (error) {
    console.error('❌ Background Task durdurma hatası:', error);
  }
}
