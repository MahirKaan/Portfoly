// types.ts - COMPLETE VERSION

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'fund';
  current_price?: number;
}

export interface AssetPrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
  volume24h?: number;
  marketCap?: number;
}

export interface Portfolio {
  id?: number;
  name: string;
  type: 'bist' | 'crypto' | 'fund' | 'mixed'; // MIXED EKLENDİ
  created_at?: number;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  total_quantity: number;
  avg_price: number;
  current_price?: number;
  current_value?: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
}

export interface Transaction {
  id?: number;
  portfolio_id: number;
  symbol: string;
  asset_name: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: number;
  notes?: string;
}

export interface PriceAlarm {
  id?: number;
  assetSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt?: Date;
  currentPrice?: number;
}

// Redux state types
export interface MarketState {
  prices: { [symbol: string]: AssetPrice };
  loading: boolean;
}

export interface PortfolioState {
  currentPortfolio: Portfolio | null;
  holdings: PortfolioHolding[];
  transactions: Transaction[];
}