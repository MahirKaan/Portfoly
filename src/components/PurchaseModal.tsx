import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PurchaseModalProps {
  visible: boolean;
  product: {
    id: string;
    name: string;
    price: string;
    description: string;
  };
  onPurchase: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  product,
  onPurchase,
  onCancel,
  loading = false
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Satın Al</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.description}>{product.description}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.purchaseButton]} 
              onPress={onPurchase}
              disabled={loading}
            >
              <Text style={styles.purchaseButtonText}>
                {loading ? 'İşleniyor...' : 'Satın Al'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.note}>
            🔧 Mock ödeme: Gerçek uygulamada RevenueCat ödeme ekranı açılacak
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  purchaseButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});