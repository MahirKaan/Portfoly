import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Portal,
  Dialog,
  Menu,
  Chip,
} from 'react-native-paper';
import { Portfolio, Asset } from '../types';
import { databaseService } from '../services/databaseService';
import { notificationService } from '../services/notificationService';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
}

export default function AddTransactionModal({
  visible,
  onClose,
  onTransactionAdded,
}: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolioMenuVisible, setPortfolioMenuVisible] = useState(false);
  const [assetMenuVisible, setAssetMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [portfolioData, assetData] = await Promise.all([
        databaseService.getPortfolios(),
        databaseService.getAssets(),
      ]);
      
      setPortfolios(portfolioData);
      setAssets(assetData);
      
      // Varsayılan portföyü seç
      if (portfolioData.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioData[0]);
      }
    } catch (error) {
      console.error('Error loading modal data:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPortfolio || !selectedAsset || !quantity || !price) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      
      await databaseService.addTransaction({
        type: transactionType,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        date: Date.now(),
        portfolio_id: selectedPortfolio.id,
        asset_id: selectedAsset.id,
      });

      // İşlem başarılı bildirimi gönder
      await notificationService.showTransactionSuccess(
        selectedAsset.symbol,
        transactionType,
        parseFloat(quantity)
      );

      // Formu temizle
      setQuantity('');
      setPrice('');
      setSelectedAsset(null);
      
      // Callback'i çağır
      onTransactionAdded();
      
      // Modal'ı kapat
      onClose();
      
      alert('İşlem başarıyla eklendi!');
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('İşlem eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTransactionType('buy');
    setQuantity('');
    setPrice('');
    setSelectedAsset(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onRequestClose={handleClose}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall">Yeni İşlem Ekle</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* İşlem Tipi */}
              <View style={styles.section}>
                <Text variant="bodyMedium" style={styles.label}>
                  İşlem Tipi
                </Text>
                <SegmentedButtons
                  value={transactionType}
                  onValueChange={(value) => setTransactionType(value as 'buy' | 'sell')}
                  buttons={[
                    {
                      value: 'buy',
                      label: 'Alış',
                      icon: 'arrow-down',
                      style: transactionType === 'buy' ? styles.selectedButton : undefined,
                    },
                    {
                      value: 'sell',
                      label: 'Satış',
                      icon: 'arrow-up',
                      style: transactionType === 'sell' ? styles.selectedButton : undefined,
                    },
                  ]}
                />
              </View>

              {/* Portföy Seçimi */}
              <View style={styles.section}>
                <Text variant="bodyMedium" style={styles.label}>
                  Portföy
                </Text>
                <Menu
                  visible={portfolioMenuVisible}
                  onDismiss={() => setPortfolioMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setPortfolioMenuVisible(true)}
                      style={styles.selectButton}
                      icon="wallet"
                    >
                      {selectedPortfolio ? selectedPortfolio.name : 'Portföy Seçin'}
                    </Button>
                  }
                >
                  {portfolios.map((portfolio) => (
                    <Menu.Item
                      key={portfolio.id}
                      onPress={() => {
                        setSelectedPortfolio(portfolio);
                        setPortfolioMenuVisible(false);
                      }}
                      title={portfolio.name}
                      leadingIcon={
                        portfolio.type === 'crypto' ? 'bitcoin' :
                        portfolio.type === 'bist' ? 'chart-line' : 'wallet'
                      }
                    />
                  ))}
                </Menu>
                
                {selectedPortfolio && (
                  <Chip
                    mode="outlined"
                    onClose={() => setSelectedPortfolio(null)}
                    style={styles.chip}
                  >
                    {selectedPortfolio.name}
                  </Chip>
                )}
              </View>

              {/* Varlık Seçimi */}
              <View style={styles.section}>
                <Text variant="bodyMedium" style={styles.label}>
                  Varlık
                </Text>
                <Menu
                  visible={assetMenuVisible}
                  onDismiss={() => setAssetMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setAssetMenuVisible(true)}
                      style={styles.selectButton}
                      icon="currency-usd"
                    >
                      {selectedAsset ? `${selectedAsset.symbol} - ${selectedAsset.name}` : 'Varlık Seçin'}
                    </Button>
                  }
                >
                  {assets.map((asset) => (
                    <Menu.Item
                      key={asset.id}
                      onPress={() => {
                        setSelectedAsset(asset);
                        setAssetMenuVisible(false);
                      }}
                      title={`${asset.symbol} - ${asset.name}`}
                      leadingIcon={asset.type === 'crypto' ? 'bitcoin' : 'chart-line'}
                    />
                  ))}
                </Menu>
                
                {selectedAsset && (
                  <Chip
                    mode="outlined"
                    onClose={() => setSelectedAsset(null)}
                    style={styles.chip}
                  >
                    {selectedAsset.symbol} - {selectedAsset.name}
                  </Chip>
                )}
              </View>

              {/* Miktar */}
              <View style={styles.section}>
                <Text variant="bodyMedium" style={styles.label}>
                  Miktar
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="Örn: 0.5 veya 100"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>

              {/* Fiyat */}
              <View style={styles.section}>
                <Text variant="bodyMedium" style={styles.label}>
                  Birim Fiyat ($)
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="Örn: 45000 veya 42.50"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>

              {/* Toplam Hesaplama */}
              {(quantity && price) && (
                <View style={styles.section}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Toplam Tutar
                  </Text>
                  <Text variant="titleMedium" style={styles.totalAmount}>
                    ${(parseFloat(quantity) * parseFloat(price)).toFixed(2)}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={styles.button}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !selectedPortfolio || !selectedAsset || !quantity || !price}
                style={styles.button}
                icon="check"
              >
                Ekle
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%',
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
  },
  selectButton: {
    borderColor: '#e0e0e0',
  },
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  button: {
    flex: 1,
  },
  selectedButton: {
    backgroundColor: '#2196F3',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 8,
  },
});