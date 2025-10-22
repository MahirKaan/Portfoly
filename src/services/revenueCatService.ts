import { Platform } from 'react-native';
import Purchases, { 
  PurchasesPackage,
  PurchasesEntitlementInfo,
  CustomerInfo,
  PurchasesOffering,
  PurchasesOfferings
} from 'react-native-purchases';

// ⚠️ REVENUECAT API KEY'LERİ - GERÇEK KEY EKLENDİ
const API_KEYS = {
  apple: 'appl_abc123yourapplekeyhere', // Boş kalabilir, sadece Android kullanıyoruz
  google: 'test_ZmcOIPpwxWnIEiGivYGwfLPvhQt', // REVENUECAT'DEN ALDIĞIMIZ GERÇEK KEY
};

export interface RevenueCatEntitlement {
  id: string;
  isActive: boolean;
  willRenew: boolean;
}

// Basit mock type'ları
interface MockProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
}

interface MockPackage {
  product: MockProduct;
  identifier: string;
  packageType: string;
  offeringIdentifier: string;
}

interface MockOffering {
  availablePackages: MockPackage[];
}

interface MockOfferings {
  current: MockOffering | null;
}

type OfferingsResult = PurchasesOfferings | MockOfferings | null;

class RevenueCatService {
  private isInitialized = false;
  private mockCustomerInfo: { entitlements: { active: { [key: string]: any } } } = {
    entitlements: { active: {} }
  };

  async initialize() {
    try {
      if (this.isInitialized) return;

      // Expo Go'da Browser Mode kullan - bu normal
      if (__DEV__) {
        console.log('🔧 Expo Go detected - Using Browser Mode');
        // Expo Go'da gerçek satın alma çalışmaz, mock modda devam et
        this.isInitialized = true;
        return;
      }

      // ARTIK GERÇEK API KEY KULLAN - GÜNCELLENDİ
      const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;
      
      console.log('🔑 RevenueCat API Key kullanılıyor:', apiKey.substring(0, 10) + '...');
      
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      await Purchases.configure({ apiKey });
      
      this.isInitialized = true;
      console.log('✅ RevenueCat initialized with REAL API key');
    } catch (error) {
      console.error('❌ RevenueCat initialization error:', error);
      // Hata olsa bile uygulama çalışmaya devam etsin
      this.isInitialized = true;
    }
  }

  async getOfferings(): Promise<OfferingsResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Expo Go'da mock data dön
      if (__DEV__) {
        return this.getMockOfferings();
      }

      const offerings = await Purchases.getOfferings();
      console.log('📦 Offerings:', offerings);
      return offerings;
    } catch (error) {
      console.error('❌ Error getting offerings:', error);
      return this.getMockOfferings();
    }
  }

  async purchaseProduct(productId: string): Promise<{success: boolean; customerInfo?: any; error?: string}> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Expo Go'da mock satın alma
      if (__DEV__) {
        console.log('🔧 Expo Go - Mock purchase started:', productId);
        
        // 2 saniye bekle (yükleniyor efekti için)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock başarılı satın alma
        console.log('✅ Mock purchase completed successfully');
        
        // Global state'i güncelle
        if (productId.includes('pro')) {
          this.mockCustomerInfo.entitlements.active = {
            'pro': { 
              isActive: true,
              identifier: 'pro'
            }
          };
          console.log('🎯 PRO entitlement activated and saved to global state');
        } else if (productId.includes('premium')) {
          this.mockCustomerInfo.entitlements.active = {
            'premium': { 
              isActive: true,
              identifier: 'premium'
            },
            'premium_subscription': {
              isActive: true,
              identifier: 'premium_subscription'
            }
          };
          console.log('🎯 PREMIUM entitlement activated and saved to global state');
        }
        
        console.log('📦 Updated mock customer info:', JSON.stringify(this.mockCustomerInfo, null, 2));
        
        return { 
          success: true, 
          customerInfo: this.mockCustomerInfo
        };
      }

      const offerings = await this.getOfferings();
      
      // Type guard ile kontrol
      if (!offerings || !offerings.current) {
        throw new Error('No offerings available');
      }

      // Product'ı bul - any kullanarak type karmaşıklığını önle
      let packageToPurchase: any = null;
      const packages = offerings.current.availablePackages as any[];
      
      for (const packageObj of packages) {
        if (packageObj.product.identifier === productId) {
          packageToPurchase = packageObj;
          break;
        }
      }

      if (!packageToPurchase) {
        throw new Error(`Product ${productId} not found`);
      }

      // Satın alma işlemi
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      console.log('✅ Purchase successful:', customerInfo);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('❌ User cancelled purchase');
        return { success: false, error: 'Cancelled' };
      } else {
        console.error('❌ Purchase error:', error);
        return { success: false, error: error.message };
      }
    }
  }

  async restorePurchases(): Promise<{success: boolean; customerInfo?: CustomerInfo; error?: any}> {
    try {
      // Expo Go'da mock restore
      if (__DEV__) {
        console.log('🔧 Expo Go - Mock restore purchases');
        return { 
          success: true, 
          customerInfo: this.mockCustomerInfo as CustomerInfo
        };
      }

      const customerInfo = await Purchases.restorePurchases();
      console.log('✅ Purchases restored:', customerInfo);
      return { success: true, customerInfo };
    } catch (error) {
      console.error('❌ Restore purchases error:', error);
      return { success: false, error };
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | {entitlements: {active: {[key: string]: any}}}> {
    try {
      // Expo Go'da mock customer info
      if (__DEV__) {
        console.log('🔧 Expo Go - Mock customer info:', JSON.stringify(this.mockCustomerInfo, null, 2));
        return this.mockCustomerInfo;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('❌ Error getting customer info:', error);
      return this.mockCustomerInfo;
    }
  }

  async checkPremiumStatus(): Promise<{
    isPro: boolean;
    isPremium: boolean;
    userTier: 'free' | 'pro' | 'premium';
  }> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      if (!customerInfo) {
        return { isPro: false, isPremium: false, userTier: 'free' };
      }

      // Type-safe entitlements kontrolü
      const entitlements = (customerInfo as any).entitlements?.active || {};
      console.log('🔍 Checking entitlements:', JSON.stringify(entitlements, null, 2));
      
      const isPro = !!entitlements['pro']?.isActive;
      const isPremium = !!entitlements['premium']?.isActive || !!entitlements['premium_subscription']?.isActive;
      
      let userTier: 'free' | 'pro' | 'premium' = 'free';
      if (isPremium) userTier = 'premium';
      else if (isPro) userTier = 'pro';

      console.log(`🎯 User Tier: ${userTier}, Pro: ${isPro}, Premium: ${isPremium}`);
      return { isPro, isPremium, userTier };
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
      return { isPro: false, isPremium: false, userTier: 'free' };
    }
  }

  // Mock state'i sıfırlamak için method
  resetMockState() {
    this.mockCustomerInfo = { entitlements: { active: {} } };
    console.log('🔄 Mock state reset');
  }

  private getMockOfferings(): MockOfferings {
    // Mock product data
    return {
      current: {
        availablePackages: [
          {
            product: {
              identifier: 'pro_version',
              description: 'Pro Version - One Time',
              title: 'Pro Version',
              price: 199.99,
              priceString: '₺199.99'
            },
            identifier: 'pro_version',
            packageType: 'CUSTOM',
            offeringIdentifier: 'main'
          },
          {
            product: {
              identifier: 'premium_monthly',
              description: 'Premium Monthly Subscription',
              title: 'Premium Monthly',
              price: 49.99,
              priceString: '₺49.99/ay'
            },
            identifier: 'premium_monthly',
            packageType: 'MONTHLY',
            offeringIdentifier: 'main'
          },
          {
            product: {
              identifier: 'premium_yearly',
              description: 'Premium Yearly Subscription',
              title: 'Premium Yearly',
              price: 399.99,
              priceString: '₺399.99/yıl'
            },
            identifier: 'premium_yearly',
            packageType: 'ANNUAL',
            offeringIdentifier: 'main'
          }
        ]
      }
    };
  }
}

export const revenueCatService = new RevenueCatService();