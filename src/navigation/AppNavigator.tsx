import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PortfolioScreen from '../screens/PortfolioScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import MarketsScreen from '../screens/MarketsScreen';
import PortfolioManagementScreen from '../screens/PortfolioManagementScreen';
import PriceAlarmsScreen from '../screens/PriceAlarmsScreen';
import PremiumScreen from '../screens/PremiumScreen'; // Ekle

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="Portföy" 
        component={PortfolioScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="İşlemler" 
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Alarmlar" 
        component={PriceAlarmsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Piyasalar" 
        component={MarketsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Premium" 
        component={PremiumScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="crown" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}