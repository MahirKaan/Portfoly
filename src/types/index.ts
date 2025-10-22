export interface Transaction {
  id?: number;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: number;
  portfolio_id?: number;
  asset_id?: number;
  symbol?: string;
  asset_name?: string;
  portfolio_name?: string;
}

export interface Portfolio {
  id?: number;
  name: string;
  type: 'bist' | 'crypto' | 'fund';
  created_at?: number;
}

export interface Asset {
  id?: number;
  symbol: string;
  name: string;
  api_symbol: string;
  type: string;
}

export interface AssetPrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
}

export interface MarketState {
  prices: Record<string, AssetPrice>;
  loading: boolean;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  total_quantity: number;
  avg_price: number;
  current_price?: number;
  current_value?: number;
  profit_loss?: number;
}