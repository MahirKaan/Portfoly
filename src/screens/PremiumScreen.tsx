import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremium } from '../contexts/PremiumContext';

// Modern color palette
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#8B5CF6',
  success: '#10B981',
  successLight: '#34D399',
  danger: '#EF4444',
  dangerLight: '#F87171',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  dark: '#1F2937',
  darkLight: '#374151',
  light: '#F8FAFC',
  white: '#FFFFFF',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  grayLighter: '#E5E7EB',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  bronze: '#D97706',
};

const { width: screenWidth } = Dimensions.get('window');

// Professional Card Component
const ProfessionalCard = ({ children, style, gradient }: any) => (
  gradient ? (
    <LinearGradient
      colors={gradient}
      style={[styles.proCard, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.proCard, style]}>
      {children}
    </View>
  )
);

// Feature Item Component
const FeatureItem = ({ icon, title, description, isAvailable, isProOnly }: any) => (
  <View style={styles.featureItem}>
    <View style={[
      styles.featureIcon,
      { backgroundColor: isAvailable ? COLORS.success + '20' : COLORS.grayLighter }
    ]}>
      <Text style={[
        styles.featureIconText,
        { color: isAvailable ? COLORS.success : COLORS.gray }
      ]}>
        {icon}
      </Text>
    </View>
    <View style={styles.featureContent}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureTitle}>{title}</Text>
        {isProOnly && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
      </View>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
    <View style={[
      styles.featureStatus,
      { backgroundColor: isAvailable ? COLORS.success + '20' : COLORS.grayLighter }
    ]}>
      <Text style={[
        styles.featureStatusText,
        { color: isAvailable ? COLORS.success : COLORS.gray }
      ]}>
        {isAvailable ? '✓' : '○'}
      </Text>
    </View>
  </View>
);

// Plan Card Component
const PlanCard = ({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  isPopular, 
  isBest, 
  gradient,
  onSelect,
  isLoading,
  isCurrent,
  icon 
}: any) => (
  <ProfessionalCard 
    style={[
      styles.planCard,
      isPopular && styles.popularPlan,
      isBest && styles.bestPlan
    ]}
    gradient={gradient}
  >
    {/* Header */}
    <View style={styles.planHeader}>
      <View style={styles.planTitleSection}>
        <Text style={styles.planIcon}>{icon}</Text>
        <View>
          <Text style={styles.planTitle}>{title}</Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Mevcut Plan</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.planBadges}>
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>🔥 Popüler</Text>
          </View>
        )}
        {isBest && (
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>⭐ En İyi</Text>
          </View>
        )}
      </View>
    </View>

    {/* Price */}
    <View style={styles.priceSection}>
      <Text style={styles.planPrice}>{price}</Text>
      <Text style={styles.planPeriod}>{period}</Text>
    </View>

    {/* Description */}
    <Text style={styles.planDescription}>{description}</Text>

    {/* Features */}
    <View style={styles.planFeatures}>
      {features.map((feature: string, index: number) => (
        <View key={index} style={styles.planFeature}>
          <Text style={styles.planFeatureIcon}>✓</Text>
          <Text style={styles.planFeatureText}>{feature}</Text>
        </View>
      ))}
    </View>

    {/* Action Button */}
    <TouchableOpacity
      style={[
        styles.planButton,
        isCurrent && styles.currentPlanButton,
        isLoading && styles.loadingButton
      ]}
      onPress={onSelect}
      disabled={isLoading || isCurrent}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={styles.planButtonText}>
          {isCurrent ? 'Aktif' : 'Hemen Başla'}
        </Text>
      )}
    </TouchableOpacity>
  </ProfessionalCard>
);

const PremiumScreen: React.FC = () => {
  const { 
    isPro, 
    isPremium, 
    userTier, 
    canUseFeature, 
    purchaseProduct, 
    loading,
    refreshStatus 
  } = usePremium();

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePurchase = async (productId: string) => {
    setSelectedProduct(productId);
    try {
      const success = await purchaseProduct(productId);
      if (success) {
        Alert.alert('🎉 Tebrikler!', 'Premium üyeliğiniz başarıyla aktif edildi!');
      } else {
        Alert.alert('❌ İşlem Başarısız', 'Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.');
      }
    } catch (error) {
      Alert.alert('❌ Hata', 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSelectedProduct(null);
    }
  };

  const features = [
    {
      id: 'unlimited_portfolios',
      icon: '📊',
      title: 'Sınırsız Portföy',
      description: 'İstediğiniz kadar portföy oluşturun',
      proOnly: false
    },
    {
      id: 'unlimited_transactions',
      icon: '💸',
      title: 'Sınırsız İşlem',
      description: 'Günlük işlem limiti yok',
      proOnly: false
    },
    {
      id: 'price_alarms',
      icon: '🔔',
      title: 'Fiyat Alarmları',
      description: 'Özel fiyat alarmları oluşturun',
      proOnly: false
    },
    {
      id: 'advanced_analytics',
      icon: '📈',
      title: 'Gelişmiş Analitik',
      description: 'Detaylı grafikler ve raporlar',
      proOnly: true
    },
    {
      id: 'ad_free',
      icon: '🚫',
      title: 'Reklamsız Deneyim',
      description: 'Hiç reklam görmeden kullanın',
      proOnly: false
    },
    {
      id: 'cloud_sync',
      icon: '☁️',
      title: 'Bulut Senkronizasyonu',
      description: 'Cihazlar arası veri senkronizasyonu',
      proOnly: true
    },
    {
      id: 'auto_portfolio_tracking',
      icon: '🤖',
      title: 'Otomatik Portföy Takibi',
      description: 'API ile otomatik işlem takibi',
      proOnly: true
    },
    {
      id: 'pdf_reports',
      icon: '📄',
      title: 'PDF Raporları',
      description: 'Profesyonel PDF raporları oluşturun',
      proOnly: true
    },
  ];

  const plans = {
    free: {
      title: 'Ücretsiz',
      price: '₺0',
      period: 'sonsuz',
      description: 'Temel özelliklerle başlayın',
      icon: '🎁',
      features: [
        '1 Portföy',
        '50 İşlem/Gün',
        'Temel Analizler',
        'Sınırlı Alarm'
      ],
      gradient: [COLORS.grayLighter, COLORS.grayLight]
    },
    pro: {
      title: 'Pro',
      price: '₺199',
      period: 'ömür boyu',
      description: 'Tek ödeme, sınırsız erişim',
      icon: '🚀',
      features: [
        'Sınırsız Portföy',
        'Sınırsız İşlem',
        'Fiyat Alarmları',
        'Reklamsız Deneyim',
        'Temel PDF Raporları'
      ],
      gradient: [COLORS.primary, COLORS.primaryLight],
      isPopular: true
    },
    premium: {
      title: 'Premium',
      price: '₺49',
      period: 'aylık',
      description: 'Tüm premium özellikler',
      icon: '⭐',
      features: [
        'Tüm Pro Özellikleri',
        'Gelişmiş Analitik',
        'Bulut Senkronizasyon',
        'Otomatik Takip',
        'Profesyonel PDF Raporlar',
        'Öncelikli Destek'
      ],
      gradient: [COLORS.gold, COLORS.warning],
      isBest: true
    }
  };

  const getCurrentPlan = () => {
    if (userTier === 'premium') return 'premium';
    if (userTier === 'pro') return 'pro';
    return 'free';
  };

  const currentPlan = getCurrentPlan();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Premium Özellikler</Text>
            <Text style={styles.heroSubtitle}>
              {userTier === 'free' && 'Portföy yönetiminde bir adım öne geçin'}
              {userTier === 'pro' && 'Pro kullanıcısınız! 🎉'}
              {userTier === 'premium' && 'Premium kullanıcısınız! 🎊'}
            </Text>
            
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>
                {userTier === 'free' && '🎁 Ücretsiz Plan'}
                {userTier === 'pro' && '🚀 Pro Plan'}
                {userTier === 'premium' && '⭐ Premium Plan'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Özellik Karşılaştırması</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <FeatureItem
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isAvailable={canUseFeature(feature.id)}
                isProOnly={feature.proOnly}
              />
            ))}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Plan Seçenekleri</Text>
          
          {userTier === 'free' && (
            <View style={styles.plansContainer}>
              <PlanCard
                {...plans.pro}
                onSelect={() => handlePurchase('pro_version')}
                isLoading={loading && selectedProduct === 'pro_version'}
              />
              <PlanCard
                {...plans.premium}
                onSelect={() => handlePurchase('premium_monthly')}
                isLoading={loading && selectedProduct === 'premium_monthly'}
              />
            </View>
          )}

          {userTier === 'pro' && (
            <View style={styles.upgradeContainer}>
              <ProfessionalCard style={styles.currentPlanCard}>
                <Text style={styles.upgradeTitle}>Pro Kullanıcısınız! 🎉</Text>
                <Text style={styles.upgradeDescription}>
                  Premium'a geçerek tüm özelliklere erişin ve portföy yönetiminizi bir üst seviyeye taşıyın.
                </Text>
              </ProfessionalCard>
              
              <PlanCard
                {...plans.premium}
                onSelect={() => handlePurchase('premium_monthly')}
                isLoading={loading && selectedProduct === 'premium_monthly'}
              />
            </View>
          )}

          {userTier === 'premium' && (
            <View style={styles.premiumContainer}>
              <ProfessionalCard style={styles.premiumCard}>
                <Text style={styles.premiumTitle}>🎊 Premium Kullanıcısınız!</Text>
                <Text style={styles.premiumDescription}>
                  Tüm özelliklere sınırsız erişiminiz var. Portföy yönetiminde en üst seviyedesiniz!
                </Text>
                
                <View style={styles.activeFeatures}>
                  <Text style={styles.activeFeaturesTitle}>Aktif Özellikleriniz:</Text>
                  <View style={styles.featuresList}>
                    {features.map((feature, index) => (
                      <View key={index} style={styles.activeFeature}>
                        <Text style={styles.activeFeatureIcon}>✓</Text>
                        <Text style={styles.activeFeatureText}>{feature.title}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ProfessionalCard>
            </View>
          )}
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>
          <ProfessionalCard style={styles.faqCard}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>💳 Ödeme nasıl yapılır?</Text>
              <Text style={styles.faqAnswer}>Google Play veya Apple App Store üzerinden güvenli ödeme.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>🔄 İptal politikası nedir?</Text>
              <Text style={styles.faqAnswer}>Abonelikleri istediğiniz zaman iptal edebilirsiniz.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>📱 Verilerim güvende mi?</Text>
              <Text style={styles.faqAnswer}>Verileriniz şifrelenmiş olarak saklanır ve güvende tutulur.</Text>
            </View>
          </ProfessionalCard>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 16,
    textAlign: 'center',
  },
  currentPlanBadge: {
    backgroundColor: COLORS.white + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currentPlanText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 18,
  },
  featureContent: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: 8,
  },
  proBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  featureDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  featureStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pricingSection: {
    padding: 24,
    paddingTop: 0,
  },
  plansContainer: {
    gap: 20,
  },
  upgradeContainer: {
    gap: 20,
  },
  premiumContainer: {
    gap: 20,
  },
  currentPlanCard: {
    alignItems: 'center',
    padding: 24,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumCard: {
    padding: 24,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumDescription: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  activeFeatures: {
    width: '100%',
  },
  activeFeaturesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  activeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFeatureIcon: {
    fontSize: 16,
    color: COLORS.success,
    marginRight: 12,
    fontWeight: 'bold',
  },
  activeFeatureText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  proCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.grayLighter,
  },
  planCard: {
    padding: 24,
  },
  popularPlan: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  bestPlan: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  currentBadge: {
    backgroundColor: COLORS.white + '40',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  planBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  popularBadge: {
    backgroundColor: COLORS.white + '40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  bestBadge: {
    backgroundColor: COLORS.gold + '40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bestBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginRight: 8,
  },
  planPeriod: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  planFeatures: {
    marginBottom: 24,
    gap: 8,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planFeatureIcon: {
    fontSize: 14,
    color: COLORS.white,
    marginRight: 8,
    fontWeight: 'bold',
  },
  planFeatureText: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
  },
  planButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: COLORS.white + '40',
  },
  loadingButton: {
    opacity: 0.7,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  faqSection: {
    padding: 24,
    paddingTop: 0,
  },
  faqCard: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default PremiumScreen;