import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

  const refreshStatus = () => {
    // Mock data - RevenueCat entegre edilecek
    setIsPro(false);
    setIsPremium(false);
    setUserTier('free');
  };

  const purchaseProduct = async (productId: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Satın alma başlatıldı:', productId);
      
      // Mock satın alma - RevenueCat entegre edilecek
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Satın alma tamamlandı (mock)');
      return true;
    } catch (error) {
      console.error('Satın alma hatası:', error);
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