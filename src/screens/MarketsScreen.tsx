import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { priceService } from '../services/priceService';
import { setPrices, setLoading } from '../store/marketSlice';
import { AssetPrice } from '../types';

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
  bitcoin: '#F59E0B',
  ethereum: '#627EEA',
  cardano: '#0033AD',
  solana: '#00FFA3',
};

const { width: screenWidth } = Dimensions.get('window');

// Professional Card Component
const ProfessionalCard = ({ children, style }: any) => (
  <View style={[styles.proCard, style]}>
    {children}
  </View>
);

// Asset Card Component
const AssetCard = ({ asset, index }: { asset: AssetPrice; index: number }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const isProfit = asset.change24h >= 0;
  const delay = index * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

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

  const getAssetIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'ADA': '₳',
      'SOL': '◎',
      'DOT': '●',
      'XRP': '✕',
      'LTC': 'Ł',
      'BNB': '⎈',
    };
    return icons[symbol] || '💎';
  };

  const getAssetColor = (symbol: string) => {
    const colors: { [key: string]: string } = {
      'BTC': COLORS.bitcoin,
      'ETH': COLORS.ethereum,
      'ADA': COLORS.cardano,
      'SOL': COLORS.solana,
    };
    return colors[symbol] || COLORS.primary;
  };

  const formatPrice = (price: number) => {
    if (price > 1000) return price.toFixed(0);
    if (price > 1) return price.toFixed(2);
    if (price > 0.01) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatVolume = (volume: number) => {
    if (volume > 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume > 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume > 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <ProfessionalCard style={[
          styles.assetCard,
          { borderLeftColor: getAssetColor(asset.symbol) }
        ]}>
          <View style={styles.assetContent}>
            {/* Header */}
            <View style={styles.assetHeader}>
              <View style={styles.assetMain}>
                <View style={styles.assetSymbolSection}>
                  <View style={[
                    styles.assetIcon,
                    { backgroundColor: getAssetColor(asset.symbol) + '20' }
                  ]}>
                    <Text style={[
                      styles.assetIconText,
                      { color: getAssetColor(asset.symbol) }
                    ]}>
                      {getAssetIcon(asset.symbol)}
                    </Text>
                  </View>
                  <View style={styles.assetText}>
                    <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                    <Text style={styles.assetName}>
                      {asset.symbol === 'BTC' ? 'Bitcoin' :
                       asset.symbol === 'ETH' ? 'Ethereum' :
                       asset.symbol === 'ADA' ? 'Cardano' :
                       asset.symbol === 'SOL' ? 'Solana' :
                       `${asset.symbol} Token`}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.priceSection}>
                  <Text style={styles.assetPrice}>
                    ${formatPrice(asset.price)}
                  </Text>
                  <View style={[
                    styles.changeBadge,
                    { backgroundColor: isProfit ? COLORS.success + '20' : COLORS.danger + '20' }
                  ]}>
                    <Text style={[
                      styles.changeText,
                      { color: isProfit ? COLORS.success : COLORS.danger }
                    ]}>
                      {isProfit ? '↗' : '↘'} {formatChange(asset.change24h)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={styles.assetDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>24s Değişim</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: isProfit ? COLORS.success : COLORS.danger }
                  ]}>
                    {formatChange(asset.change24h)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>İşlem Hacmi</Text>
                  <Text style={styles.detailValue}>
                    {(asset as any).volume24h ? formatVolume((asset as any).volume24h) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Son Güncelleme</Text>
                  <Text style={styles.detailValue}>
                    {new Date(asset.lastUpdated).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Chart Indicator (Mock) */}
            <View style={styles.chartIndicator}>
              <View style={[
                styles.chartLine,
                { backgroundColor: isProfit ? COLORS.success : COLORS.danger }
              ]} />
              <View style={[
                styles.chartLine,
                { 
                  backgroundColor: isProfit ? COLORS.success : COLORS.danger,
                  width: '70%',
                  opacity: 0.7
                }
              ]} />
              <View style={[
                styles.chartLine,
                { 
                  backgroundColor: isProfit ? COLORS.success : COLORS.danger,
                  width: '40%',
                  opacity: 0.5
                }
              ]} />
            </View>
          </View>
        </ProfessionalCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Market Stats Component
const MarketStats = ({ marketData }: { marketData: AssetPrice[] }) => {
  const risingAssets = marketData.filter(asset => asset.change24h > 0).length;
  const fallingAssets = marketData.filter(asset => asset.change24h < 0).length;

  const formatVolume = (volume: number) => {
    if (volume > 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume > 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    return `$${volume.toFixed(0)}`;
  };

  const totalVolume = marketData.reduce((sum, asset) => sum + ((asset as any).volume24h || 0), 0);

  const stats = [
    { value: marketData.length, label: 'Takip Edilen', icon: '📊', color: COLORS.primary },
    { value: risingAssets, label: 'Yükselen', icon: '📈', color: COLORS.success },
    { value: fallingAssets, label: 'Düşen', icon: '📉', color: COLORS.danger },
    { value: formatVolume(totalVolume), label: 'Toplam Hacim', icon: '💸', color: COLORS.warning },
  ];

  return (
    <View style={styles.statsGrid}>
      {stats.map((stat, index) => (
        <ProfessionalCard key={index} style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={[styles.statIcon, { color: stat.color }]}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        </ProfessionalCard>
      ))}
    </View>
  );
};

export default function MarketsScreen() {
  const dispatch = useDispatch();
  const { prices, loading } = useSelector((state: RootState) => state.market);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name');

  useEffect(() => {
    loadMarketData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMarketData = async () => {
    try {
      dispatch(setLoading(true));
      const priceData = await priceService.getAllPrices();
      dispatch(setPrices(priceData));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      dispatch(setLoading(false));
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMarketData();
  };

  const marketData = Object.values(prices);

  // Sort market data
  const sortedMarketData = [...marketData].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price;
      case 'change':
        return Math.abs(b.change24h) - Math.abs(a.change24h);
      case 'name':
      default:
        return a.symbol.localeCompare(b.symbol);
    }
  });

  const topGainers = [...marketData]
    .filter(asset => asset.change24h > 0)
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3);

  const topLosers = [...marketData]
    .filter(asset => asset.change24h < 0)
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 3);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
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
        <View style={[styles.heroSection, { backgroundColor: COLORS.primary }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Piyasalar</Text>
            <Text style={styles.heroSubtitle}>
              Gerçek zamanlı kripto para fiyatları
            </Text>
            
            <View style={styles.lastUpdateSection}>
              <Text style={styles.lastUpdateText}>
                🔄 Son Güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Market Stats */}
        <View style={styles.statsSection}>
          <MarketStats marketData={marketData} />
        </View>

        {/* Top Performers */}
        {(topGainers.length > 0 || topLosers.length > 0) && (
          <View style={styles.performersSection}>
            <Text style={styles.sectionTitle}>Günün Öne Çıkanları</Text>
            
            <View style={styles.performersGrid}>
              {topGainers.length > 0 && (
                <ProfessionalCard style={styles.performerCard}>
                  <Text style={styles.performerTitle}>🚀 En Çok Yükselenler</Text>
                  {topGainers.map((asset, index) => (
                    <View key={asset.symbol} style={styles.performerItem}>
                      <Text style={styles.performerRank}>#{index + 1}</Text>
                      <Text style={styles.performerSymbol}>{asset.symbol}</Text>
                      <Text style={[styles.performerChange, { color: COLORS.success }]}>
                        +{asset.change24h.toFixed(2)}%
                      </Text>
                    </View>
                  ))}
                </ProfessionalCard>
              )}
              
              {topLosers.length > 0 && (
                <ProfessionalCard style={styles.performerCard}>
                  <Text style={styles.performerTitle}>📉 En Çok Düşenler</Text>
                  {topLosers.map((asset, index) => (
                    <View key={asset.symbol} style={styles.performerItem}>
                      <Text style={styles.performerRank}>#{index + 1}</Text>
                      <Text style={styles.performerSymbol}>{asset.symbol}</Text>
                      <Text style={[styles.performerChange, { color: COLORS.danger }]}>
                        {asset.change24h.toFixed(2)}%
                      </Text>
                    </View>
                  ))}
                </ProfessionalCard>
              )}
            </View>
          </View>
        )}

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sırala:</Text>
          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'name' && styles.sortOptionActive
              ]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === 'name' && styles.sortOptionTextActive
              ]}>İsim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'price' && styles.sortOptionActive
              ]}
              onPress={() => setSortBy('price')}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === 'price' && styles.sortOptionTextActive
              ]}>Fiyat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'change' && styles.sortOptionActive
              ]}
              onPress={() => setSortBy('change')}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === 'change' && styles.sortOptionTextActive
              ]}>Değişim</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assets List */}
        <View style={styles.assetsSection}>
          <Text style={styles.sectionTitle}>Tüm Varlıklar</Text>
          
          {sortedMarketData.length === 0 ? (
            <ProfessionalCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Text style={styles.emptyStateEmoji}>📊</Text>
                <Text style={styles.emptyStateTitle}>
                  {loading ? 'Piyasa Verileri Yükleniyor' : 'Piyasa Verisi Bulunamadı'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {loading 
                    ? 'Gerçek zamanlı piyasa verileri alınıyor...'
                    : 'Piyasa verilerine ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.'
                  }
                </Text>
              </View>
            </ProfessionalCard>
          ) : (
            <View style={styles.assetsList}>
              {sortedMarketData.map((asset, index) => (
                <AssetCard
                  key={asset.symbol}
                  asset={asset}
                  index={index}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
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
  lastUpdateSection: {
    backgroundColor: COLORS.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  lastUpdateText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginTop: -20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 72) / 2,
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
  },
  performersSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  performersGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  performerCard: {
    flex: 1,
    padding: 16,
  },
  performerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performerRank: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
    marginRight: 8,
    width: 24,
  },
  performerSymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  performerChange: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sortSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLighter,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },
  assetsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  assetsList: {
    gap: 12,
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
  assetCard: {
    marginBottom: 0,
    borderLeftWidth: 4,
  },
  assetContent: {
    padding: 0,
  },
  assetHeader: {
    marginBottom: 16,
  },
  assetMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetSymbolSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  assetText: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 2,
  },
  assetName: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  assetPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
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
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  chartIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    gap: 2,
  },
  chartLine: {
    height: 4,
    width: '100%',
    borderRadius: 2,
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
  },
  bottomSpacing: {
    height: 40,
  },
});