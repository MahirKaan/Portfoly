// App.tsx - RNE OLMADAN
import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store/store';
import { initDatabase } from './src/database/database';
import { notificationService } from './src/services/notificationService';
import { PremiumProvider } from './src/contexts/PremiumContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing database...');
        const success = await initDatabase();
        
        // Bildirim izinlerini iste
        console.log('Requesting notification permissions...');
        await notificationService.requestPermissions();
        
        if (success) {
          console.log('Database initialized successfully, setting state...');
          setDbInitialized(true);
          
          // Hoş geldin bildirimi gönder
          await notificationService.showWelcomeNotification();
        } else {
          console.error('Database initialization failed');
          setDbInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setDbInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!dbInitialized) {
    return null;
  }

  return (
    <ReduxProvider store={store}>
      <PremiumProvider>
        <PaperProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </PremiumProvider>
    </ReduxProvider>
  );
}