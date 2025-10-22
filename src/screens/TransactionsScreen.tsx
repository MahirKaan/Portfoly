import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Transaction, Portfolio } from '../types';
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

// Transaction Card Component
const TransactionCard = ({ transaction, index }: { transaction: Transaction; index: number }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const isBuy = transaction.type === 'buy';
  const delay = index * 50;

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

  const getTransactionIcon = (type: string) => {
    return type === 'buy' ? '📥' : '📤';
  };

  const getTransactionColor = (type: string) => {
    return type === 'buy' ? COLORS.success : COLORS.danger;
  };

  const getTransactionType = (type: string) => {
    return type === 'buy' ? 'ALIŞ' : 'SATIŞ';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAmount = transaction.quantity * transaction.price;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <ProfessionalCard style={[
          styles.transactionCard,
          { borderLeftColor: getTransactionColor(transaction.type) }
        ]}>
          <View style={styles.transactionContent}>
            {/* Header */}
            <View style={styles.transactionHeader}>
              <View style={styles.assetSection}>
                <View style={[
                  styles.typeIndicator,
                  { backgroundColor: getTransactionColor(transaction.type) + '20' }
                ]}>
                  <Text style={[
                    styles.typeIcon,
                    { color: getTransactionColor(transaction.type) }
                  ]}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                </View>
                <View style={styles.assetText}>
                  <Text style={styles.assetSymbol}>{transaction.symbol}</Text>
                  <Text style={styles.assetName}>{transaction.asset_name}</Text>
                </View>
              </View>
              
              <View style={styles.transactionType}>
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: getTransactionColor(transaction.type) + '20' }
                ]}>
                  <Text style={[
                    styles.typeText,
                    { color: getTransactionColor(transaction.type) }
                  ]}>
                    {getTransactionType(transaction.type)}
                  </Text>
                </View>
                <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.transactionDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Miktar</Text>
                  <Text style={styles.detailValue}>{transaction.quantity}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Birim Fiyat</Text>
                  <Text style={styles.detailValue}>${transaction.price.toFixed(2)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>İşlem Türü</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: getTransactionColor(transaction.type) }
                  ]}>
                    {isBuy ? 'Alım' : 'Satım'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.transactionFooter}>
              <Text style={styles.dateText}>
                🕒 {formatDate(transaction.date)}
              </Text>
              <View style={styles.transactionId}>
                <Text style={styles.idText}>
                  #{transaction.id?.toString().slice(-6) || '000000'}
                </Text>
              </View>
            </View>
          </View>
        </ProfessionalCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Portfolio Selector Component
const PortfolioSelector = ({ portfolios, selectedPortfolio, onSelect }: any) => {
  return (
    <View style={styles.portfolioSelector}>
      <Text style={styles.selectorLabel}>Portföy Seçin</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.portfolioScroll}
      >
        <View style={styles.portfolioOptions}>
          {portfolios.map((portfolio: Portfolio) => (
            <TouchableOpacity
              key={portfolio.id}
              style={[
                styles.portfolioOption,
                selectedPortfolio?.id === portfolio.id && { 
                  backgroundColor: COLORS.primary + '20',
                  borderColor: COLORS.primary 
                }
              ]}
              onPress={() => onSelect(portfolio)}
            >
              <Text style={styles.portfolioIcon}>💼</Text>
              <Text style={styles.portfolioName} numberOfLines={1}>
                {portfolio.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Filter Component
const FilterBar = ({ activeFilter, onFilterChange }: any) => {
  const filters = [
    { key: 'all', label: '🔁 Tümü' },
    { key: 'buy', label: '📥 Alımlar' },
    { key: 'sell', label: '📤 Satımlar' },
  ];

  return (
    <View style={styles.filterBar}>
      <Text style={styles.filterLabel}>Filtrele:</Text>
      <View style={styles.filterOptions}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterOption,
              activeFilter === filter.key && { 
                backgroundColor: COLORS.primary + '20',
                borderColor: COLORS.primary 
              }
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.key && { color: COLORS.primary }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadTransactions(selectedPortfolio.id!);
    } else if (portfolios.length > 0) {
      setSelectedPortfolio(portfolios[0]);
    }
  }, [selectedPortfolio, portfolios]);

  const loadData = async () => {
    try {
      const portfolioData = await databaseService.getPortfolios();
      setPortfolios(portfolioData);
      
      if (portfolioData.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioData[0]);
      }
    } catch (error) {
      console.error('Error loading transactions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (portfolioId: number) => {
    try {
      const transactionsData = await databaseService.getPortfolioTransactions(portfolioId);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const calculateStats = () => {
    const buyCount = transactions.filter(t => t.type === 'buy').length;
    const sellCount = transactions.filter(t => t.type === 'sell').length;
    const totalVolume = transactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
    const avgTransaction = transactions.length > 0 ? totalVolume / transactions.length : 0;
    
    return { buyCount, sellCount, totalVolume, avgTransaction };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ProfessionalCard style={styles.loadingCard}>
          <Text style={styles.loadingEmoji}>💸</Text>
          <Text style={styles.loadingText}>İşlemler Yükleniyor...</Text>
        </ProfessionalCard>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>İşlem Geçmişi</Text>
            <Text style={styles.heroSubtitle}>
              Tüm alım-satım işlemlerinizin detaylı kaydı
            </Text>
          </View>
        </LinearGradient>

        {/* Portfolio Selection */}
        {portfolios.length > 0 && (
          <View style={styles.portfolioSection}>
            <PortfolioSelector
              portfolios={portfolios}
              selectedPortfolio={selectedPortfolio}
              onSelect={setSelectedPortfolio}
            />
          </View>
        )}

        {/* Stats Overview */}
        {selectedPortfolio && (
          <View style={styles.statsContainer}>
            <ProfessionalCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{transactions.length}</Text>
                <Text style={styles.statLabel}>Toplam İşlem</Text>
              </View>
            </ProfessionalCard>
            
            <ProfessionalCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: COLORS.success }]}>
                  {stats.buyCount}
                </Text>
                <Text style={styles.statLabel}>Alım</Text>
              </View>
            </ProfessionalCard>
            
            <ProfessionalCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: COLORS.danger }]}>
                  {stats.sellCount}
                </Text>
                <Text style={styles.statLabel}>Satım</Text>
              </View>
            </ProfessionalCard>
          </View>
        )}

        {/* Filter Bar */}
        {selectedPortfolio && transactions.length > 0 && (
          <View style={styles.filterSection}>
            <FilterBar
              activeFilter={filter}
              onFilterChange={setFilter}
            />
          </View>
        )}

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          {!selectedPortfolio ? (
            <ProfessionalCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Text style={styles.emptyStateEmoji}>📂</Text>
                <Text style={styles.emptyStateTitle}>Portföy Seçilmemiş</Text>
                <Text style={styles.emptyStateText}>
                  İşlemlerini görüntülemek için{'\n'}
                  bir portföy seçin.
                </Text>
              </View>
            </ProfessionalCard>
          ) : filteredTransactions.length === 0 ? (
            <ProfessionalCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Text style={styles.emptyStateEmoji}>
                  {transactions.length === 0 ? '💸' : '🔍'}
                </Text>
                <Text style={styles.emptyStateTitle}>
                  {transactions.length === 0 ? 'İşlem Bulunamadı' : 'Filtrelenmiş İşlem Yok'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {transactions.length === 0 
                    ? 'Bu portföyde henüz işlem bulunmuyor.\nİlk işleminizi ekleyerek başlayın.'
                    : `Seçilen filtreye uygun işlem bulunamadı.\nFiltreyi değiştirmeyi deneyin.`
                  }
                </Text>
              </View>
            </ProfessionalCard>
          ) : (
            <View style={styles.transactionsList}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {filter === 'all' ? 'Tüm İşlemler' : 
                   filter === 'buy' ? 'Alım İşlemleri' : 'Satım İşlemleri'}
                </Text>
                <View style={styles.transactionsCount}>
                  <Text style={styles.transactionsCountText}>({filteredTransactions.length})</Text>
                </View>
              </View>

              <View style={styles.transactionsGrid}>
                {filteredTransactions.map((transaction, index) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                  />
                ))}
              </View>
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
  portfolioSection: {
    paddingHorizontal: 24,
    marginTop: -20,
    marginBottom: 24,
  },
  portfolioSelector: {
    marginBottom: 0,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  portfolioScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  portfolioOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  portfolioOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.grayLighter,
    alignItems: 'center',
    minWidth: 120,
  },
  portfolioIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  portfolioName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  filterBar: {
    marginBottom: 0,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.grayLighter,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  transactionsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  transactionsCount: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  transactionsCountText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  transactionsList: {
    marginBottom: 20,
  },
  transactionsGrid: {
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
  transactionCard: {
    marginBottom: 0,
    borderLeftWidth: 4,
  },
  transactionContent: {
    padding: 0,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assetSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeIcon: {
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
    marginBottom: 4,
  },
  assetName: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  transactionType: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  transactionDetails: {
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
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLighter,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },
  transactionId: {
    backgroundColor: COLORS.grayLighter,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idText: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
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

export default TransactionsScreen;