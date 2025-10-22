import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Dimensions,
  Animated,
  TouchableOpacity 
} from 'react-native';
import { FAB, Dialog, Portal, TextInput, Button } from 'react-native-paper';
import { Portfolio } from '../types';
import { databaseService } from '../services/databaseService';

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
  crypto: '#F59E0B',
  bist: '#6366F1',
  fund: '#10B981',
  mixed: '#8B5CF6',
};

const { width: screenWidth } = Dimensions.get('window');

// Professional Card Component
const ProfessionalCard = ({ children, style }: any) => (
  <View style={[styles.proCard, style]}>
    {children}
  </View>
);

// Portfolio Card Component
const PortfolioCard = ({ portfolio, onDelete }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getPortfolioIcon = (type: string) => {
    const icons = {
      crypto: '₿',
      bist: '📈',
      fund: '🏦',
      mixed: '💼'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getPortfolioColor = (type: string) => {
    switch (type) {
      case 'crypto': return COLORS.crypto;
      case 'bist': return COLORS.bist;
      case 'fund': return COLORS.fund;
      case 'mixed': return COLORS.mixed;
      default: return COLORS.gray;
    }
  };

  const getPortfolioTypeName = (type: string) => {
    switch (type) {
      case 'crypto': return 'Kripto Para';
      case 'bist': return 'BİST';
      case 'fund': return 'Yatırım Fonu';
      case 'mixed': return 'Karma Portföy';
      default: return 'Diğer';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <ProfessionalCard style={[
          styles.portfolioCard,
          { borderLeftColor: getPortfolioColor(portfolio.type) }
        ]}>
          <View style={styles.portfolioContent}>
            {/* Header */}
            <View style={styles.portfolioHeader}>
              <View style={styles.portfolioInfo}>
                <View style={styles.portfolioIconSection}>
                  <View style={[
                    styles.portfolioIcon,
                    { backgroundColor: getPortfolioColor(portfolio.type) + '20' }
                  ]}>
                    <Text style={[
                      styles.portfolioIconText,
                      { color: getPortfolioColor(portfolio.type) }
                    ]}>
                      {getPortfolioIcon(portfolio.type)}
                    </Text>
                  </View>
                  <View style={styles.portfolioText}>
                    <Text style={styles.portfolioName} numberOfLines={1}>
                      {portfolio.name}
                    </Text>
                    <View style={[
                      styles.typeBadge,
                      { backgroundColor: getPortfolioColor(portfolio.type) }
                    ]}>
                      <Text style={styles.typeText}>
                        {getPortfolioTypeName(portfolio.type)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(portfolio)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.portfolioFooter}>
              <Text style={styles.createDate}>
                📅 {formatDate(portfolio.created_at!)}
              </Text>
              <View style={styles.portfolioStats}>
                <Text style={styles.statItem}>0 varlık</Text>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.statItem}>0 işlem</Text>
              </View>
            </View>
          </View>
        </ProfessionalCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Type Selection Component
const TypeSelector = ({ selectedType, onTypeSelect }: any) => {
  const types = [
    { key: 'crypto' as const, label: 'Kripto', icon: '₿', color: COLORS.crypto },
    { key: 'bist' as const, label: 'BİST', icon: '📈', color: COLORS.bist },
    { key: 'fund' as const, label: 'Fon', icon: '🏦', color: COLORS.fund },
    { key: 'mixed' as const, label: 'Karma', icon: '💼', color: COLORS.mixed },
  ];

  return (
    <View style={styles.typeSelector}>
      <Text style={styles.typeLabel}>Portföy Türü</Text>
      <View style={styles.typeGrid}>
        {types.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeOption,
              selectedType === type.key && { 
                backgroundColor: type.color + '20',
                borderColor: type.color 
              }
            ]}
            onPress={() => onTypeSelect(type.key)}
          >
            <Text style={[
              styles.typeIcon,
              { color: type.color }
            ]}>
              {type.icon}
            </Text>
            <Text style={styles.typeLabelText}>{type.label}</Text>
            {selectedType === type.key && (
              <View style={[styles.selectedIndicator, { backgroundColor: type.color }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ANA COMPONENT - SADECE BİR TANE EXPORT DEFAULT
const PortfolioManagementScreen = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [selectedPortfolioType, setSelectedPortfolioType] = useState<'bist' | 'crypto' | 'fund' | 'mixed'>('crypto');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadPortfolios();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadPortfolios = async () => {
    try {
      const portfolioData = await databaseService.getPortfolios();
      setPortfolios(portfolioData);
    } catch (error) {
      console.error('Error loading portfolios:', error);
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolioName.trim()) {
      Alert.alert('❌ Eksik Bilgi', 'Lütfen portföy adı giriniz.');
      return;
    }

    try {
      setLoading(true);
      await databaseService.addPortfolio(newPortfolioName.trim(), selectedPortfolioType);
      
      setNewPortfolioName('');
      setDialogVisible(false);
      await loadPortfolios();
      
      Alert.alert('🎉 Başarılı!', 'Portföy başarıyla oluşturuldu.');
    } catch (error) {
      console.error('Error adding portfolio:', error);
      Alert.alert('❌ Hata', 'Portföy oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = (portfolio: Portfolio) => {
    Alert.alert(
      '🗑️ Portföyü Sil',
      `"${portfolio.name}" portföyünü silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`,
      [
        { text: '❌ İptal', style: 'cancel' },
        { 
          text: '🗑️ Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deletePortfolio(portfolio.id!);
              await loadPortfolios();
              Alert.alert('✅ Başarılı', 'Portföy başarıyla silindi.');
            } catch (error) {
              console.error('Error deleting portfolio:', error);
              Alert.alert('❌ Hata', 'Portföy silinirken bir hata oluştu.');
            }
          }
        },
      ]
    );
  };

  // DÜZELTİLDİ: Mixed type kontrolü eklendi
  const getStats = () => {
    const cryptoCount = portfolios.filter(p => p.type === 'crypto').length;
    const bistCount = portfolios.filter(p => p.type === 'bist').length;
    const fundCount = portfolios.filter(p => p.type === 'fund').length;
    const mixedCount = portfolios.filter(p => p.type === 'mixed').length; // BU SATIR EKLENDİ

    return { cryptoCount, bistCount, fundCount, mixedCount };
  };

  const stats = getStats();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.heroSection, { backgroundColor: COLORS.primary }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Portföy Yönetimi</Text>
            <Text style={styles.heroSubtitle}>
              Portföylerinizi oluşturun ve yönetin
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <ProfessionalCard style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{portfolios.length}</Text>
              <Text style={styles.statLabel}>Toplam Portföy</Text>
            </View>
          </ProfessionalCard>
          
          <ProfessionalCard style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: COLORS.crypto }]}>
                {stats.cryptoCount}
              </Text>
              <Text style={styles.statLabel}>Kripto</Text>
            </View>
          </ProfessionalCard>
          
          <ProfessionalCard style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: COLORS.bist }]}>
                {stats.bistCount}
              </Text>
              <Text style={styles.statLabel}>BİST</Text>
            </View>
          </ProfessionalCard>
        </View>

        {/* Portfolios Section */}
        <View style={styles.portfoliosSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portföylerim</Text>
            <View style={styles.portfoliosCount}>
              <Text style={styles.portfoliosCountText}>({portfolios.length})</Text>
            </View>
          </View>

          {portfolios.length > 0 ? (
            <View style={styles.portfoliosGrid}>
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onDelete={handleDeletePortfolio}
                />
              ))}
            </View>
          ) : (
            <ProfessionalCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Text style={styles.emptyStateEmoji}>📊</Text>
                <Text style={styles.emptyStateTitle}>Portföy Bulunamadı</Text>
                <Text style={styles.emptyStateText}>
                  İlk portföyünüzü oluşturarak{'\n'}
                  yatırımlarınızı takip etmeye başlayın.
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setDialogVisible(true)}
                >
                  <Text style={styles.emptyStateButtonText}>İlk Portföyü Oluştur</Text>
                </TouchableOpacity>
              </View>
            </ProfessionalCard>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* FAB Button */}
      {portfolios.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setDialogVisible(true)}
          color={COLORS.white}
        />
      )}

      {/* Add Portfolio Dialog */}
      <Portal>
        <Dialog 
          visible={dialogVisible} 
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <View style={[styles.dialogHeader, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.dialogTitle}>Yeni Portföy Oluştur</Text>
          </View>
          
          <Dialog.Content style={styles.dialogContent}>
            {/* Portfolio Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Portföy Adı</Text>
              <TextInput
                mode="outlined"
                placeholder="Örn: Kripto Yatırımlarım"
                value={newPortfolioName}
                onChangeText={setNewPortfolioName}
                style={styles.input}
                outlineColor={COLORS.grayLighter}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="text-box-outline" />}
              />
            </View>

            {/* Type Selection */}
            <TypeSelector
              selectedType={selectedPortfolioType}
              onTypeSelect={setSelectedPortfolioType}
            />
          </Dialog.Content>
          
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              onPress={() => setDialogVisible(false)}
              textColor={COLORS.gray}
              style={styles.cancelButton}
            >
              İptal
            </Button>
            <Button 
              onPress={handleAddPortfolio} 
              loading={loading}
              disabled={loading || !newPortfolioName.trim()}
              mode="contained"
              style={styles.createButton}
              labelStyle={styles.createButtonLabel}
            >
              {loading ? 'Oluşturuluyor...' : 'Portföy Oluştur'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: -20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  portfoliosSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  portfoliosCount: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  portfoliosCountText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  portfoliosGrid: {
    gap: 16,
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
  portfolioCard: {
    marginBottom: 0,
    borderLeftWidth: 4,
  },
  portfolioContent: {
    padding: 0,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  portfolioInfo: {
    flex: 1,
  },
  portfolioIconSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  portfolioIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  portfolioText: {
    flex: 1,
  },
  portfolioName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  portfolioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLighter,
  },
  createDate: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  portfolioStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statDivider: {
    fontSize: 11,
    color: COLORS.grayLight,
    marginHorizontal: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpacing: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  dialog: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  dialogHeader: {
    padding: 24,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  dialogContent: {
    padding: 0,
  },
  inputSection: {
    padding: 24,
    paddingBottom: 0,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
  },
  typeSelector: {
    padding: 24,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    minWidth: (screenWidth - 96) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.grayLighter,
    alignItems: 'center',
    position: 'relative',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  typeLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dialogActions: {
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  createButtonLabel: {
    fontWeight: '600',
  },
});


export default PortfolioManagementScreen;