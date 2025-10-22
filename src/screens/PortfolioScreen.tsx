import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Animated,
  Dimensions 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, FAB } from 'react-native-paper';
import { RootState } from '../store/store';
import { databaseService } from '../services/databaseService';
import { priceService } from '../services/priceService';
import { setPrices } from '../store/marketSlice';
import { Portfolio, PortfolioHolding } from '../types';
import AddTransactionModal from '../components/AddTransactionModal';
import PortfolioAnalytics from '../components/PortfolioAnalytics';

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
};

const { width: screenWidth } = Dimensions.get('window');

// Professional Card Component
const ProfessionalCard = ({ children, style }: any) => (
  <View style={[styles.proCard, style]}>
    {children}
  </View>
);

// Stat Badge Component
const StatBadge = ({ value, label, color, icon }: any) => (
  <View style={[styles.statBadge, { backgroundColor: color + '15' }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {icon && <Text style={styles.statIcon}>{icon}</Text>}
  </View>
);

// Asset Card Component
const AssetCard = ({ holding }: { holding: PortfolioHolding & { profit_loss_percentage?: number } }) => {
  const isProfit = (holding.profit_loss || 0) >= 0;
  const profitPercentage = holding.profit_loss_percentage || 0;

  return (
    <ProfessionalCard style={styles.assetCard}>
      <View style={styles.assetHeader}>
        <View style={styles.assetMain}>
          <View style={styles.assetSymbolContainer}>
            <Text style={styles.assetSymbol}>{holding.symbol}</Text>
            <View style={[
              styles.changeIndicator,
              { backgroundColor: isProfit ? COLORS.success + '20' : COLORS.danger + '20' }
            ]}>
              <Text style={[
                styles.changeIcon,
                { color: isProfit ? COLORS.success : COLORS.danger }
              ]}>
                {isProfit ? '↗' : '↘'}
              </Text>
            </View>
          </View>
          <Text style={styles.assetName} numberOfLines={1}>{holding.name}</Text>
        </View>
        
        <View style={styles.assetValues}>
          <Text style={styles.currentValue}>${(holding.current_value || 0).toFixed(2)}</Text>
          <Text style={[
            styles.profitLoss,
            { color: isProfit ? COLORS.success : COLORS.danger }
          ]}>
            {isProfit ? '+' : ''}${(holding.profit_loss || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.assetDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Miktar</Text>
            <Text style={styles.detailValue}>{holding.total_quantity}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ort. Fiyat</Text>
            <Text style={styles.detailValue}>${holding.avg_price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Getiri</Text>
            <Text style={[
              styles.detailValue,
              { color: isProfit ? COLORS.success : COLORS.danger }
            ]}>
              {isProfit ? '+' : ''}{profitPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.currentPriceSection}>
        <Text style={styles.currentPriceLabel}>Güncel Fiyat:</Text>
        <Text style={styles.currentPrice}>${(holding.current_price || 0).toFixed(2)}</Text>
      </View>
    </ProfessionalCard>
  );
};

export default function PortfolioScreen() {
  const dispatch = useDispatch();
  const { prices } = useSelector((state: RootState) => state.market);
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [holdings, setHoldings] = useState<(PortfolioHolding & { profit_loss_percentage?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().then(() => {
      setRefreshing(false);
    });
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const priceData = await priceService.getAllPrices();
      dispatch(setPrices(priceData));
      
      let portfolioData = await databaseService.getPortfolios();
      
      if (portfolioData.length === 0) {
        await createSamplePortfolio();
        portfolioData = await databaseService.getPortfolios();
      }
      
      setPortfolios(portfolioData);
      
      if (portfolioData.length > 0) {
        await loadPortfolioSummary(portfolioData[0].id!);
      }
      
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSamplePortfolio = async () => {
    try {
      await databaseService.addPortfolio('Ana Portföy', 'mixed');
    } catch (error) {
      console.error('Error creating sample portfolio:', error);
    }
  };

  const loadPortfolioSummary = async (portfolioId: number) => {
    try {
      const summary = await databaseService.getPortfolioSummary(portfolioId);
      
      const enrichedHoldings = summary.map((holding: any) => {
        const currentPrice = getCurrentPrice(holding.symbol);
        const currentValue = currentPrice ? holding.total_quantity * currentPrice : 0;
        const profitLoss = currentValue - (holding.total_quantity * holding.avg_price);
        const profitLossPercentage = ((profitLoss / (holding.total_quantity * holding.avg_price)) * 100) || 0;
        
        return {
          ...holding,
          current_price: currentPrice,
          current_value: currentValue,
          profit_loss: profitLoss,
          profit_loss_percentage: profitLossPercentage
        };
      });
      
      setHoldings(enrichedHoldings);
    } catch (error) {
      console.error('Error loading portfolio summary:', error);
    }
  };

  const getCurrentPrice = (symbol: string): number => {
    const priceEntry = Object.values(prices).find(price => {
      const priceSymbol = (price as any).symbol;
      return priceSymbol && priceSymbol.toLowerCase().includes(symbol.toLowerCase());
    });
    return (priceEntry as any)?.price || 0;
  };

  const calculateTotalValue = (): number => {
    return holdings.reduce((total, holding) => total + (holding.current_value || 0), 0);
  };

  const calculateTotalProfitLoss = (): number => {
    return holdings.reduce((total, holding) => total + (holding.profit_loss || 0), 0);
  };

  const calculateTotalProfitLossPercentage = (): number => {
    const totalCost = holdings.reduce((total, holding) => total + (holding.total_quantity * holding.avg_price), 0);
    return totalCost > 0 ? (calculateTotalProfitLoss() / totalCost) * 100 : 0;
  };

  const handleTransactionAdded = () => {
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ProfessionalCard style={styles.loadingCard}>
          <Text style={styles.loadingEmoji}>💹</Text>
          <Text style={styles.loadingText}>Portföy Yükleniyor...</Text>
        </ProfessionalCard>
      </View>
    );
  }

  const totalValue = calculateTotalValue();
  const totalProfitLoss = calculateTotalProfitLoss();
  const totalProfitLossPercentage = calculateTotalProfitLossPercentage();
  const isTotalProfit = totalProfitLoss >= 0;

  const profitableAssets = holdings.filter(h => (h.profit_loss || 0) > 0).length;
  const losingAssets = holdings.filter(h => (h.profit_loss || 0) < 0).length;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Portföyüm</Text>
          <Text style={styles.subtitle}>Yatırım Performansınız</Text>
        </View>

        {/* Total Value Card */}
        <ProfessionalCard style={styles.totalValueCard}>
          <View style={styles.totalValueContent}>
            <Text style={styles.totalLabel}>TOPLAM DEĞER</Text>
            <Text style={styles.totalValue}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            
            <View style={styles.profitLossSection}>
              <View style={[
                styles.profitLossBadge,
                { backgroundColor: isTotalProfit ? COLORS.success + '20' : COLORS.danger + '20' }
              ]}>
                <Text style={[
                  styles.profitLossText,
                  { color: isTotalProfit ? COLORS.success : COLORS.danger }
                ]}>
                  {isTotalProfit ? '↗' : '↘'} 
                  ${Math.abs(totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                  ({totalProfitLossPercentage.toFixed(2)}%)
                </Text>
              </View>
            </View>
          </View>
        </ProfessionalCard>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatBadge 
            value={holdings.length} 
            label="Varlık" 
            color={COLORS.primary}
            icon="📊"
          />
          <StatBadge 
            value={profitableAssets} 
            label="Kârlı" 
            color={COLORS.success}
            icon="🎯"
          />
          <StatBadge 
            value={losingAssets} 
            label="Zararda" 
            color={COLORS.danger}
            icon="📉"
          />
        </View>

        {/* Analytics Toggle */}
        <View style={styles.analyticsToggle}>
          <Text 
            style={styles.analyticsToggleText}
            onPress={() => setShowAnalytics(!showAnalytics)}
          >
            {showAnalytics ? '📊 Analizleri Gizle' : '📈 Analizleri Göster'}
          </Text>
        </View>

        {/* Analytics Section */}
        {showAnalytics && holdings.length > 0 && (
          <PortfolioAnalytics 
            holdings={holdings}
            totalValue={totalValue}
          />
        )}

        {/* Holdings Section */}
        <View style={styles.holdingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Varlıklarım</Text>
            <View style={styles.holdingsCount}>
              <Text style={styles.holdingsCountText}>({holdings.length})</Text>
            </View>
          </View>

          {holdings.length > 0 ? (
            <View style={styles.assetsGrid}>
              {holdings.map((holding, index) => (
                <AssetCard key={index} holding={holding} />
              ))}
            </View>
          ) : (
            <ProfessionalCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Text style={styles.emptyStateEmoji}>💸</Text>
                <Text style={styles.emptyStateTitle}>Portföyünüz Boş</Text>
                <Text style={styles.emptyStateText}>
                  İlk yatırımınızı ekleyerek başlayın ve{'\n'}
                  portföy performansınızı takip edin.
                </Text>
                <Text 
                  style={styles.emptyStateButton}
                  onPress={() => setModalVisible(true)}
                >
                  İlk İşlemi Ekle
                </Text>
              </View>
            </ProfessionalCard>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* FAB Button */}
      {holdings.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          color={COLORS.white}
        />
      )}

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    padding: 20,
  },
  loadingCard: {
    padding: 40,
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
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
  totalValueCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
  },
  totalValueContent: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  profitLossSection: {
    alignItems: 'center',
  },
  profitLossBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profitLossText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  statBadge: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 12,
  },
  analyticsToggle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsToggleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  holdingsSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  holdingsCount: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  holdingsCountText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  assetsGrid: {
    gap: 12,
  },
  assetCard: {
    marginBottom: 0,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assetMain: {
    flex: 1,
  },
  assetSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  assetSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginRight: 8,
  },
  changeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  assetName: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  profitLoss: {
    fontSize: 14,
    fontWeight: '600',
  },
  assetDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  currentPriceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLighter,
  },
  currentPriceLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
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
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 16,
    overflow: 'hidden',
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
});