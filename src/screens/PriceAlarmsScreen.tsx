import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FAB, Dialog, Portal, TextInput, Button, Switch } from 'react-native-paper';
import { Asset } from '../types';
import { databaseService } from '../services/databaseService';
import { notificationService } from '../services/notificationService';

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

interface PriceAlarm {
  id?: number;
  assetSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt?: Date;
  currentPrice?: number;
}

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

// Alarm Card Component
const AlarmCard = ({ alarm, onToggle, onDelete }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const isAbove = alarm.condition === 'above';
  const progress = alarm.currentPrice ? 
    (isAbove ? 
      Math.min((alarm.currentPrice / alarm.targetPrice) * 100, 100) :
      Math.min(((alarm.targetPrice - alarm.currentPrice) / alarm.targetPrice) * 100, 100)
    ) : 0;

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

  const getConditionIcon = (condition: string) => {
    return condition === 'above' ? '📈' : '📉';
  };

  const getConditionColor = (condition: string) => {
    return condition === 'above' ? COLORS.success : COLORS.danger;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
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
          styles.alarmCard,
          { borderLeftColor: getConditionColor(alarm.condition) }
        ]}>
          <View style={styles.alarmContent}>
            {/* Header */}
            <View style={styles.alarmHeader}>
              <View style={styles.alarmMain}>
                <View style={styles.assetSection}>
                  <View style={[
                    styles.conditionIndicator,
                    { backgroundColor: getConditionColor(alarm.condition) + '20' }
                  ]}>
                    <Text style={[
                      styles.conditionIcon,
                      { color: getConditionColor(alarm.condition) }
                    ]}>
                      {getConditionIcon(alarm.condition)}
                    </Text>
                  </View>
                  <View style={styles.assetText}>
                    <Text style={styles.assetSymbol}>{alarm.assetSymbol}</Text>
                    <Text style={styles.alarmCondition}>
                      {isAbove ? 'Üzerinde' : 'Altında'}: 
                      <Text style={styles.targetPrice}> ${alarm.targetPrice.toLocaleString()}</Text>
                    </Text>
                  </View>
                </View>
                
                <View style={styles.alarmStatus}>
                  <Switch
                    value={alarm.isActive}
                    onValueChange={() => onToggle(alarm.id!)}
                    color={getConditionColor(alarm.condition)}
                  />
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>
                  Mevcut: ${alarm.currentPrice?.toLocaleString() || 'N/A'}
                </Text>
                <Text style={styles.progressLabel}>
                  {progress.toFixed(1)}% tamamlandı
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${progress}%`,
                      backgroundColor: getConditionColor(alarm.condition)
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.alarmFooter}>
              <Text style={styles.createDate}>
                📅 {formatDate(alarm.createdAt!)}
              </Text>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(alarm.id!)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ProfessionalCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Condition Selector Component
const ConditionSelector = ({ selectedCondition, onConditionSelect }: any) => {
  const conditions = [
    { key: 'above', label: 'Üzerinde', icon: '📈', color: COLORS.success },
    { key: 'below', label: 'Altında', icon: '📉', color: COLORS.danger },
  ];

  return (
    <View style={styles.conditionSelector}>
      <Text style={styles.selectorLabel}>Alarm Koşulu</Text>
      <View style={styles.conditionGrid}>
        {conditions.map((condition) => (
          <TouchableOpacity
            key={condition.key}
            style={[
              styles.conditionOption,
              selectedCondition === condition.key && { 
                backgroundColor: condition.color + '20',
                borderColor: condition.color 
              }
            ]}
            onPress={() => onConditionSelect(condition.key)}
          >
            <Text style={[
              styles.conditionIcon,
              { color: condition.color }
            ]}>
              {condition.icon}
            </Text>
            <Text style={styles.conditionLabel}>{condition.label}</Text>
            {selectedCondition === condition.key && (
              <View style={[styles.selectedIndicator, { backgroundColor: condition.color }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function PriceAlarmsScreen() {
  const [alarms, setAlarms] = useState<PriceAlarm[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      const assetData = await databaseService.getAssets();
      setAssets(assetData);
      
      // Örnek alarmlar
      const sampleAlarms: PriceAlarm[] = [
        { 
          id: 1, 
          assetSymbol: 'BTC', 
          targetPrice: 50000, 
          condition: 'above', 
          isActive: true,
          createdAt: new Date('2024-01-15'),
          currentPrice: 45200
        },
        { 
          id: 2, 
          assetSymbol: 'ETH', 
          targetPrice: 3000, 
          condition: 'below', 
          isActive: true,
          createdAt: new Date('2024-01-16'),
          currentPrice: 3200
        },
        { 
          id: 3, 
          assetSymbol: 'ADA', 
          targetPrice: 0.5, 
          condition: 'above', 
          isActive: false,
          createdAt: new Date('2024-01-14'),
          currentPrice: 0.45
        },
      ];
      setAlarms(sampleAlarms);
    } catch (error) {
      console.error('Error loading alarms data:', error);
    }
  };

  const handleAddAlarm = async () => {
    if (!selectedAsset || !targetPrice) {
      Alert.alert('❌ Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('❌ Geçersiz Fiyat', 'Lütfen geçerli bir fiyat girin.');
      return;
    }

    try {
      setLoading(true);
      
      const newAlarm: PriceAlarm = {
        assetSymbol: selectedAsset.symbol,
        targetPrice: price,
        condition,
        isActive: true,
        createdAt: new Date(),
        currentPrice: 0 // Gerçek uygulamada current price servisten alınacak
      };

      // Bildirimi planla
      await notificationService.schedulePriceAlert(
        selectedAsset.symbol,
        price,
        condition
      );

      // Alarmı listeye ekle
      setAlarms(prev => [...prev, { ...newAlarm, id: Date.now() }]);
      
      // Formu temizle
      setSelectedAsset(null);
      setTargetPrice('');
      setCondition('above');
      setDialogVisible(false);
      
      Alert.alert('🎉 Başarılı!', 'Fiyat alarmı başarıyla oluşturuldu.');
    } catch (error) {
      console.error('Error adding alarm:', error);
      Alert.alert('❌ Hata', 'Alarm oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlarm = (alarmId: number) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, isActive: !alarm.isActive } : alarm
    ));
  };

  const deleteAlarm = (alarmId: number) => {
    Alert.alert(
      '🗑️ Alarmı Sil',
      'Bu alarmı silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.',
      [
        { text: '❌ İptal', style: 'cancel' },
        { 
          text: '🗑️ Sil', 
          style: 'destructive',
          onPress: () => {
            setAlarms(prev => prev.filter(alarm => alarm.id !== alarmId));
          }
        },
      ]
    );
  };

  const getStats = () => {
    const activeAlarms = alarms.filter(alarm => alarm.isActive).length;
    const aboveAlarms = alarms.filter(alarm => alarm.condition === 'above').length;
    const belowAlarms = alarms.filter(alarm => alarm.condition === 'below').length;

    return { activeAlarms, aboveAlarms, belowAlarms };
  };

  const stats = getStats();

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
            <Text style={styles.heroTitle}>Fiyat Alarmları</Text>
            <Text style={styles.heroSubtitle}>
              Belirlediğiniz fiyatlara ulaşıldığında anında bildirim alın
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <ProfessionalCard style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{alarms.length}</Text>
              <Text style={styles.statLabel}>Toplam Alarm</Text>
            </View>
          </ProfessionalCard>
          
          <ProfessionalCard style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>
                {stats.activeAlarms}
              </Text>
              <Text style={styles.statLabel}>Aktif</Text>
            </View>
          </ProfessionalCard>
          
          <ProfessionalCard style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>
                {stats.aboveAlarms}
              </Text>
              <Text style={styles.statLabel}>Yükseliş</Text>
            </View>
          </ProfessionalCard>
        </View>

        {/* Alarms Section */}
        <View style={styles.alarmsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alarmlarım</Text>
            <View style={styles.alarmsCount}>
              <Text style={styles.alarmsCountText}>({alarms.length})</Text>
            </View>
          </View>

          {alarms.length > 0 ? (
            <View style={styles.alarmsGrid}>
              {alarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={toggleAlarm}
                  onDelete={deleteAlarm}
                />
              ))}
            </View>
          ) : (
            <ProfessionalCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Text style={styles.emptyStateEmoji}>🔔</Text>
                <Text style={styles.emptyStateTitle}>Alarm Bulunamadı</Text>
                <Text style={styles.emptyStateText}>
                  İlk fiyat alarmınızı oluşturarak{'\n'}
                  piyasa hareketlerinden anında haberdar olun.
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setDialogVisible(true)}
                >
                  <Text style={styles.emptyStateButtonText}>İlk Alarmı Oluştur</Text>
                </TouchableOpacity>
              </View>
            </ProfessionalCard>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* FAB Button */}
      {alarms.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setDialogVisible(true)}
          color={COLORS.white}
        />
      )}

      {/* Add Alarm Dialog */}
      <Portal>
        <Dialog 
          visible={dialogVisible} 
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.dialogHeader}
          >
            <Text style={styles.dialogTitle}>Yeni Fiyat Alarmı</Text>
          </LinearGradient>
          
          <Dialog.Content style={styles.dialogContent}>
            {/* Asset Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Varlık Seçin</Text>
              <View style={styles.assetGrid}>
                {assets.slice(0, 6).map((asset) => (
                  <TouchableOpacity
                    key={asset.id}
                    style={[
                      styles.assetOption,
                      selectedAsset?.id === asset.id && { 
                        backgroundColor: COLORS.primary + '20',
                        borderColor: COLORS.primary 
                      }
                    ]}
                    onPress={() => setSelectedAsset(asset)}
                  >
                    <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                    <Text style={styles.assetName} numberOfLines={1}>
                      {asset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Condition Selection */}
            <ConditionSelector
              selectedCondition={condition}
              onConditionSelect={setCondition}
            />

            {/* Target Price */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Hedef Fiyat ($)</Text>
              <TextInput
                mode="outlined"
                placeholder="Örn: 50000"
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="decimal-pad"
                style={styles.input}
                outlineColor={COLORS.grayLighter}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="currency-usd" />}
              />
            </View>

            {/* Preview */}
            {selectedAsset && targetPrice && (
              <ProfessionalCard style={styles.previewCard}>
                <Text style={styles.previewTitle}>Alarm Önizleme</Text>
                <Text style={styles.previewText}>
                  {selectedAsset.symbol} fiyatı ${targetPrice} {condition === 'above' ? 'üzerine' : 'altına'} çıktığında bildirim alacaksınız.
                </Text>
              </ProfessionalCard>
            )}
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
              onPress={handleAddAlarm} 
              loading={loading}
              disabled={loading || !selectedAsset || !targetPrice}
              mode="contained"
              style={styles.createButton}
              labelStyle={styles.createButtonLabel}
            >
              {loading ? 'Oluşturuluyor...' : 'Alarm Oluştur'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  alarmsSection: {
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
  alarmsCount: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  alarmsCountText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  alarmsGrid: {
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
  alarmCard: {
    marginBottom: 0,
    borderLeftWidth: 4,
  },
  alarmContent: {
    padding: 0,
  },
  alarmHeader: {
    marginBottom: 16,
  },
  alarmMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conditionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conditionIcon: {
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
  alarmCondition: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  targetPrice: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  alarmStatus: {
    marginLeft: 12,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.grayLighter,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  alarmFooter: {
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
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  assetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assetOption: {
    width: (screenWidth - 96) / 3,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.grayLighter,
    alignItems: 'center',
  },
  assetSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  assetName: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'center',
  },
  conditionSelector: {
    padding: 24,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  conditionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  conditionOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.grayLighter,
    alignItems: 'center',
    position: 'relative',
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  input: {
    backgroundColor: COLORS.white,
  },
  previewCard: {
    margin: 24,
    marginTop: 0,
    padding: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 12,
    color: COLORS.dark,
    lineHeight: 16,
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

export default PriceAlarmsScreen;