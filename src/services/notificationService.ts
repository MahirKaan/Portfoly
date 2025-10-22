import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Bildirimleri configure et
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Yeni property
    shouldShowList: true,    // Yeni property
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Bildirimler sadece fiziksel cihazlarda çalışır!');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Bildirim izni reddedildi!');
        return false;
      }
      
      console.log('Bildirim izni alındı!');
      return true;
    } catch (error) {
      console.error('Bildirim izni hatası:', error);
      return false;
    }
  },

  async schedulePriceAlert(assetSymbol: string, targetPrice: number, condition: 'above' | 'below') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Fiyat Alarmı!',
          body: `${assetSymbol} fiyatı ${condition === 'above' ? 'üzerine' : 'altına'} çıktı: $${targetPrice}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      console.log(`Fiyat alarmı ayarlandı: ${assetSymbol} ${condition} $${targetPrice}`);
    } catch (error) {
      console.error('Fiyat alarmı hatası:', error);
    }
  },

  async showPortfolioUpdate(totalValue: number, change: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Portföy Güncellemesi',
          body: `Portföy değerin: $${totalValue.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Portföy bildirimi hatası:', error);
    }
  },

  async showTransactionSuccess(assetSymbol: string, type: 'buy' | 'sell', quantity: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ İşlem Tamamlandı',
          body: `${type === 'buy' ? 'Alış' : 'Satış'} işlemi: ${quantity} ${assetSymbol}`,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('İşlem bildirimi hatası:', error);
    }
  },

  async showWelcomeNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Portfoly\'a Hoş Geldiniz!',
          body: 'Portföyünüzü takip etmeye başlayın. İlk işleminizi ekleyin!',
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Hoş geldin bildirimi hatası:', error);
    }
  },

  async showDailySummary(totalValue: number, dailyChange: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📈 Günlük Özet',
          body: `Portföy: $${totalValue.toFixed(2)} (Günlük: ${dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)}%)`,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Günlük özet bildirimi hatası:', error);
    }
  },

  async showPriceTargetReached(assetSymbol: string, currentPrice: number, targetPrice: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Hedef Fiyata Ulaşıldı!',
          body: `${assetSymbol} $${currentPrice} seviyesine ulaştı (Hedef: $${targetPrice})`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Hedef fiyat bildirimi hatası:', error);
    }
  },

  // Tüm bildirimleri temizle
  async clearAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  },

  // Bildirim token'ını al (push notification için)
  async getPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push Token:', token);
      return token;
    } catch (error) {
      console.error('Push token alma hatası:', error);
      return null;
    }
  },

  // Bildirim sayısını sıfırla
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }
};