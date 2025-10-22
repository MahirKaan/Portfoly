import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { VictoryPie, VictoryChart, VictoryBar, VictoryTheme, VictoryAxis, VictoryTooltip } from 'victory-native';
import { PortfolioHolding } from '../types';

interface PortfolioAnalyticsProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}

export default function PortfolioAnalytics({ holdings, totalValue }: PortfolioAnalyticsProps) {
  // Varlık Dağılımı için veri hazırla
  const assetDistributionData = holdings
    .filter(holding => holding.current_value && holding.current_value > 0)
    .map(holding => ({
      x: holding.symbol,
      y: holding.current_value!,
      label: `${holding.symbol}\n$${holding.current_value!.toFixed(0)}`
    }));

  // Kâr/Zarar dağılımı için veri hazırla
  const profitLossData = holdings
    .filter(holding => holding.profit_loss !== undefined)
    .map(holding => ({
      x: holding.symbol,
      y: holding.profit_loss!,
      label: `${holding.symbol}\n${holding.profit_loss! >= 0 ? '+' : ''}$${holding.profit_loss!.toFixed(0)}`
    }));

  // Toplam kâr/zarar
  const totalProfitLoss = holdings.reduce((sum, holding) => sum + (holding.profit_loss || 0), 0);
  const profitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  // En iyi ve en kötü performans
  const bestPerformer = [...holdings].sort((a, b) => (b.profit_loss || 0) - (a.profit_loss || 0))[0];
  const worstPerformer = [...holdings].sort((a, b) => (a.profit_loss || 0) - (b.profit_loss || 0))[0];

  const screenWidth = Dimensions.get('window').width;

  if (holdings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <Text variant="titleLarge" style={styles.title}>
        Portföy Analizi
      </Text>

      {/* Özet Kartları */}
      <View style={styles.summaryCards}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryCardContent}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Toplam Kâr/Zarar
            </Text>
            <Text 
              variant="headlineSmall" 
              style={[
                styles.summaryValue,
                totalProfitLoss >= 0 ? styles.profit : styles.loss
              ]}
            >
              {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
            </Text>
            <Text 
              variant="bodySmall"
              style={[
                styles.summaryPercentage,
                totalProfitLoss >= 0 ? styles.profit : styles.loss
              ]}
            >
              {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryCardContent}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Varlık Çeşitliliği
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {holdings.length}
            </Text>
            <Text variant="bodySmall" style={styles.summarySubtext}>
              farklı varlık
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Varlık Dağılımı Grafiği */}
      {assetDistributionData.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Varlık Dağılımı
            </Text>
            <View style={styles.chartContainer}>
              <VictoryPie
                data={assetDistributionData}
                width={screenWidth - 80}
                height={200}
                colorScale={[
                  '#2196F3', '#4CAF50', '#FF9800', '#E91E63', 
                  '#9C27B0', '#00BCD4', '#FF5722', '#795548'
                ]}
                innerRadius={50}
                padAngle={2}
                style={{
                  labels: {
                    fill: 'white',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }
                }}
                labelRadius={80} // Sabit değer olarak değiştirdim
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Kâr/Zarar Grafiği */}
      {profitLossData.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Kâr/Zarar Dağılımı
            </Text>
            <View style={styles.chartContainer}>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={20}
                width={screenWidth - 80}
                height={200}
              >
                <VictoryAxis
                  tickFormat={(tick) => tick.length > 4 ? `${tick.substring(0, 4)}...` : tick}
                  style={{
                    tickLabels: { fontSize: 10, angle: -45, textAnchor: 'end' }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(tick) => `$${tick}`}
                />
                <VictoryBar
                  data={profitLossData}
                  style={{
                    data: {
                      fill: ({ datum }) => datum.y >= 0 ? '#4CAF50' : '#F44336',
                      width: 20
                    }
                  }}
                  labels={({ datum }) => `$${datum.y.toFixed(0)}`}
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{
                        stroke: 'none',
                        fill: 'rgba(0, 0, 0, 0.8)'
                      }}
                      style={{ fontSize: 12, fill: 'white' }}
                    />
                  }
                />
              </VictoryChart>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Performans Özeti */}
      <View style={styles.performanceSection}>
        <Card style={styles.performanceCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.performanceTitle}>
              Performans Özeti
            </Text>
            
            {bestPerformer && (
              <View style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <Text variant="bodyMedium" style={styles.performanceLabel}>
                    🏆 En İyi Performans
                  </Text>
                  <Text 
                    variant="bodyMedium" 
                    style={[
                      styles.performanceValue,
                      (bestPerformer.profit_loss || 0) >= 0 ? styles.profit : styles.loss
                    ]}
                  >
                    {bestPerformer.profit_loss && bestPerformer.profit_loss >= 0 ? '+' : ''}
                    ${(bestPerformer.profit_loss || 0).toFixed(2)}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.performanceAsset}>
                  {bestPerformer.symbol} - {bestPerformer.name}
                </Text>
              </View>
            )}

            {worstPerformer && (
              <View style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <Text variant="bodyMedium" style={styles.performanceLabel}>
                    📉 En Kötü Performans
                  </Text>
                  <Text 
                    variant="bodyMedium" 
                    style={[
                      styles.performanceValue,
                      (worstPerformer.profit_loss || 0) >= 0 ? styles.profit : styles.loss
                    ]}
                  >
                    {worstPerformer.profit_loss && worstPerformer.profit_loss >= 0 ? '+' : ''}
                    ${(worstPerformer.profit_loss || 0).toFixed(2)}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.performanceAsset}>
                  {worstPerformer.symbol} - {worstPerformer.name}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
  },
  summaryCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryLabel: {
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryPercentage: {
    fontWeight: '600',
  },
  summarySubtext: {
    color: '#666',
  },
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  performanceSection: {
    marginBottom: 16,
  },
  performanceCard: {
    marginBottom: 12,
  },
  performanceTitle: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  performanceLabel: {
    fontWeight: '500',
  },
  performanceValue: {
    fontWeight: 'bold',
  },
  performanceAsset: {
    color: '#666',
    fontSize: 12,
  },
  profit: {
    color: '#4CAF50',
  },
  loss: {
    color: '#F44336',
  },
});