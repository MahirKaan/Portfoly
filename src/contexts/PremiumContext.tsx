import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { revenueCatService } from '../services/revenueCatService';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  isPro: boolean;
  isPremium: boolean;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited_portfolios',
    name: 'Sınırsız Portföy',
    description: 'İstediğiniz kadar portföy oluşturun',
    isPro: true,
    isPremium: true,
  },
  {
    id: 'unlimited_transactions',
    name: 'Sınırsız İşlem',
    description: 'Günlük işlem limiti yok',
    isPro: true,
    isPremium: true,
  },
  {
    id: 'price_alarms',
    name: 'Fiyat Alarmları',
    description: 'Özel fiyat alarmları oluşturun',
    isPro: true,
    isPremium: true,
  },
  {
    id: 'advanced_analytics',
    name: 'Gelişmiş Analitik',
    description: 'Detaylı grafikler ve raporlar',
    isPro: true,
    isPremium: true,
  },
  {
    id: 'ad_free',
    name: 'Reklamsız Deneyim',
    description: 'Hiç reklam görmeden kullanın',
    isPro: true,
    isPremium: true,
  },
  {
    id: 'cloud_sync',
    name: 'Bulut Senkronizasyonu',
    description: 'Cihazlar arası veri senkronizasyonu',
    isPro: false,
    isPremium: true,
  },
  {
    id: 'auto_portfolio_tracking',
    name: 'Otomatik Portföy Takibi',
    description: 'API ile otomatik işlem takibi',
    isPro: false,
    isPremium: true,
  },
  {
    id: 'pdf_reports',
    name: 'PDF Raporları',
    description: 'Profesyonel PDF raporları oluşturun',
    isPro: false,
    isPremium: true,
  },
];

interface PremiumContextType {
  isPro: boolean;
  isPremium: boolean;
  userTier: 'free' | 'pro' | 'premium';
  canUseFeature: (featureId: string) => boolean;
  getLimits: () => any;
  refreshStatus: () => void;
  purchaseProduct: (productId: string) => Promise<boolean>;
  loading: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

interface PremiumProviderProps {
  children: ReactNode;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'premium'>('free');
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing premium status...');
      await revenueCatService.initialize();
      const status = await revenueCatService.checkPremiumStatus();
      console.log('🎯 New premium status:', status);
      
      setIsPro(status.isPro);
      setIsPremium(status.isPremium);
      setUserTier(status.userTier);
    } catch (error) {
      console.error('❌ Error refreshing premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseProduct = async (productId: string): Promise<boolean> => {
    try {
      // SATIN ALMA ÖNCESİ KONTROL - YENİ EKLENDİ ✅
      if (productId.includes('pro') && isPro) {
        console.log('ℹ️ User is already PRO, cannot purchase again');
        return false;
      }
      
      if (productId.includes('premium') && isPremium) {
        console.log('ℹ️ User is already PREMIUM, cannot purchase again');
        return false;
      }

      // Premium kullanıcı Pro satın alamaz
      if (productId.includes('pro') && isPremium) {
        console.log('ℹ️ Premium user cannot purchase PRO');
        return false;
      }

      setLoading(true);
      console.log('🚀 Purchase started for:', productId);
      
      const result = await revenueCatService.purchaseProduct(productId);
      console.log('📦 Purchase result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ Purchase successful, refreshing status...');
        
        // Hemen state'i güncelle (refreshStatus async çalışıyor)
        if (productId.includes('pro')) {
          setIsPro(true);
          setUserTier('pro');
          console.log('🎯 Immediate state update: PRO activated');
        } else if (productId.includes('premium')) {
          setIsPremium(true);
          setUserTier('premium');
          console.log('🎯 Immediate state update: PREMIUM activated');
        }
        
        // Başarılı satın alma sonrası status'ü güncelle
        await refreshStatus();
        return true;
      } else {
        console.error('❌ Purchase failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const canUseFeature = (featureId: string): boolean => {
    const feature = PREMIUM_FEATURES.find(f => f.id === featureId);
    if (!feature) return true;

    if (userTier === 'premium') return true;
    if (userTier === 'pro' && feature.isPro) return true;
    
    return !feature.isPro && !feature.isPremium;
  };

  const getLimits = () => {
    return {
      maxPortfolios: userTier === 'free' ? 3 : Infinity,
      maxDailyTransactions: userTier === 'free' ? 10 : Infinity,
      canUsePriceAlarms: userTier !== 'free',
      canUseAdvancedAnalytics: userTier !== 'free',
      isAdFree: userTier !== 'free',
    };
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const value: PremiumContextType = {
    isPro,
    isPremium,
    userTier,
    canUseFeature,
    getLimits,
    refreshStatus,
    purchaseProduct,
    loading,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};