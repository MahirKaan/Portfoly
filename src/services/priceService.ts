import axios from 'axios';
import { AssetPrice } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const priceService = {
  getCryptoPrices: async (symbols: string[]): Promise<Record<string, AssetPrice>> => {
    try {
      const response = await axios.get(
        `${COINGECKO_API}/simple/price?ids=${symbols.join(',')}&vs_currencies=usd&include_24hr_change=true`
      );
      
      const prices: Record<string, AssetPrice> = {};
      
      symbols.forEach(symbol => {
        const cryptoData = response.data[symbol] as any;
        if (cryptoData) {
          prices[symbol] = {
            symbol,
            price: cryptoData.usd,
            change24h: cryptoData.usd_24h_change || 0,
            lastUpdated: Date.now()
          };
        }
      });
      
      return prices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return {};
    }
  },

  getBistPrices: async (symbols: string[]): Promise<Record<string, AssetPrice>> => {
    try {
      const mockPrices: Record<string, AssetPrice> = {
        'XU100.IS': { symbol: 'XU100.IS', price: 8500, change24h: 1.2, lastUpdated: Date.now() },
        'EREGL.IS': { symbol: 'EREGL.IS', price: 45.75, change24h: -0.5, lastUpdated: Date.now() },
        'GARAN.IS': { symbol: 'GARAN.IS', price: 62.30, change24h: 2.1, lastUpdated: Date.now() },
        'AKBNK.IS': { symbol: 'AKBNK.IS', price: 38.90, change24h: 0.8, lastUpdated: Date.now() },
      };
      
      const prices: Record<string, AssetPrice> = {};
      symbols.forEach(symbol => {
        if (mockPrices[symbol]) {
          prices[symbol] = mockPrices[symbol];
        }
      });
      
      return prices;
    } catch (error) {
      console.error('Error fetching BIST prices:', error);
      return {};
    }
  },

  getAllPrices: async (): Promise<Record<string, AssetPrice>> => {
    const cryptoPrices = await priceService.getCryptoPrices(['bitcoin', 'ethereum']);
    const bistPrices = await priceService.getBistPrices(['XU100.IS', 'EREGL.IS', 'GARAN.IS', 'AKBNK.IS']);
    
    return { ...cryptoPrices, ...bistPrices };
  }
};