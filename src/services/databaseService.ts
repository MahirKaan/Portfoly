import { openDatabase } from '../database/database';
import { Transaction, Portfolio, Asset } from '../types';

export const databaseService = {
  // Portfolio operations
  addPortfolio: async (name: string, type: string): Promise<number> => {
    try {
      const db = openDatabase();
      const result = await db.runAsync(
        'INSERT INTO portfolios (name, type) VALUES (?, ?)',
        [name, type]
      );
      console.log('Portfolio added:', result);
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('Error adding portfolio:', error);
      throw error;
    }
  },

  getPortfolios: async (): Promise<Portfolio[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync<Portfolio>(
        'SELECT * FROM portfolios ORDER BY created_at DESC'
      );
      console.log('Portfolios fetched:', result.length);
      return result;
    } catch (error) {
      console.error('Error getting portfolios:', error);
      return [];
    }
  },

  deletePortfolio: async (portfolioId: number): Promise<boolean> => {
    try {
      const db = openDatabase();
      await db.runAsync('DELETE FROM portfolios WHERE id = ?', [portfolioId]);
      return true;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      return false;
    }
  },

  // Asset operations
  addAsset: async (asset: Omit<Asset, 'id'>): Promise<number> => {
    try {
      const db = openDatabase();
      const result = await db.runAsync(
        'INSERT INTO assets (symbol, name, api_symbol, type) VALUES (?, ?, ?, ?)',
        [asset.symbol, asset.name, asset.api_symbol, asset.type]
      );
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  },

  getAssets: async (): Promise<Asset[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync<Asset>(
        'SELECT * FROM assets ORDER BY symbol ASC'
      );
      return result;
    } catch (error) {
      console.error('Error getting assets:', error);
      return [];
    }
  },

  getAssetBySymbol: async (symbol: string): Promise<Asset | null> => {
    try {
      const db = openDatabase();
      const result = await db.getFirstAsync<Asset>(
        'SELECT * FROM assets WHERE symbol = ?',
        [symbol]
      );
      return result;
    } catch (error) {
      console.error('Error getting asset by symbol:', error);
      return null;
    }
  },

  // Transaction operations
  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<number> => {
    try {
      const db = openDatabase();
      const result = await db.runAsync(
        `INSERT INTO transactions (type, quantity, price, date, portfolio_id, asset_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          transaction.type,
          transaction.quantity,
          transaction.price,
          transaction.date,
          transaction.portfolio_id || null,
          transaction.asset_id || null
        ]
      );
      console.log('Transaction added with ID:', result.lastInsertRowId);
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  getPortfolioTransactions: async (portfolioId: number): Promise<Transaction[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync<Transaction>(
        `SELECT t.*, a.symbol, a.name as asset_name 
         FROM transactions t 
         LEFT JOIN assets a ON t.asset_id = a.id 
         WHERE t.portfolio_id = ? 
         ORDER BY t.date DESC`,
        [portfolioId]
      );
      return result;
    } catch (error) {
      console.error('Error getting portfolio transactions:', error);
      return [];
    }
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync<Transaction>(
        `SELECT t.*, a.symbol, a.name as asset_name, p.name as portfolio_name
         FROM transactions t 
         LEFT JOIN assets a ON t.asset_id = a.id 
         LEFT JOIN portfolios p ON t.portfolio_id = p.id 
         ORDER BY t.date DESC`
      );
      return result;
    } catch (error) {
      console.error('Error getting all transactions:', error);
      return [];
    }
  },

  getTransactionsByAsset: async (assetId: number): Promise<Transaction[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync<Transaction>(
        `SELECT t.*, a.symbol, a.name as asset_name, p.name as portfolio_name
         FROM transactions t 
         LEFT JOIN assets a ON t.asset_id = a.id 
         LEFT JOIN portfolios p ON t.portfolio_id = p.id 
         WHERE t.asset_id = ?
         ORDER BY t.date DESC`,
        [assetId]
      );
      return result;
    } catch (error) {
      console.error('Error getting transactions by asset:', error);
      return [];
    }
  },

  updateTransaction: async (transactionId: number, updates: Partial<Transaction>): Promise<boolean> => {
    try {
      const db = openDatabase();
      const allowedFields = ['type', 'quantity', 'price', 'date', 'portfolio_id', 'asset_id'];
      const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      const setClause = updateFields.map(field => `${field} = ?`).join(', ');
      const values = updateFields.map(field => (updates as any)[field]);
      values.push(transactionId);

      await db.runAsync(
        `UPDATE transactions SET ${setClause} WHERE id = ?`,
        values
      );
      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
  },

  deleteTransaction: async (transactionId: number): Promise<boolean> => {
    try {
      const db = openDatabase();
      await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  },

  // Portfolio summary and analytics
  getPortfolioSummary: async (portfolioId: number): Promise<any[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync(
        `SELECT 
          a.symbol,
          a.name,
          SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END) as total_quantity,
          AVG(t.price) as avg_price
         FROM transactions t
         LEFT JOIN assets a ON t.asset_id = a.id
         WHERE t.portfolio_id = ?
         GROUP BY a.symbol, a.name
         HAVING total_quantity > 0`,
        [portfolioId]
      );
      return result;
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      return [];
    }
  },

  getPortfolioValueHistory: async (portfolioId: number): Promise<any[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync(
        `SELECT 
          date,
          SUM(CASE WHEN type = 'buy' THEN quantity * price ELSE -quantity * price END) as daily_net
         FROM transactions
         WHERE portfolio_id = ?
         GROUP BY date
         ORDER BY date ASC`,
        [portfolioId]
      );
      return result;
    } catch (error) {
      console.error('Error getting portfolio value history:', error);
      return [];
    }
  },

  getTotalPortfolioValue: async (portfolioId: number): Promise<number> => {
    try {
      const db = openDatabase();
      const result = await db.getFirstAsync<{ total_value: number }>(
        `SELECT 
          SUM(CASE WHEN type = 'buy' THEN quantity * price ELSE -quantity * price END) as total_value
         FROM transactions
         WHERE portfolio_id = ?`,
        [portfolioId]
      );
      return result?.total_value || 0;
    } catch (error) {
      console.error('Error getting total portfolio value:', error);
      return 0;
    }
  },

  // Asset statistics
  getAssetPerformance: async (assetId: number): Promise<any> => {
    try {
      const db = openDatabase();
      const result = await db.getFirstAsync(
        `SELECT 
          SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) as total_quantity,
          AVG(price) as avg_buy_price,
          SUM(CASE WHEN type = 'buy' THEN quantity * price ELSE 0 END) as total_investment
         FROM transactions
         WHERE asset_id = ?`,
        [assetId]
      );
      return result;
    } catch (error) {
      console.error('Error getting asset performance:', error);
      return null;
    }
  },

  // Portfolio statistics
  getPortfolioStats: async (portfolioId: number): Promise<any> => {
    try {
      const db = openDatabase();
      const result = await db.getFirstAsync(
        `SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type = 'buy' THEN quantity * price ELSE 0 END) as total_investment,
          SUM(CASE WHEN type = 'sell' THEN quantity * price ELSE 0 END) as total_sales,
          MIN(date) as first_transaction_date,
          MAX(date) as last_transaction_date
         FROM transactions
         WHERE portfolio_id = ?`,
        [portfolioId]
      );
      return result;
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      return null;
    }
  },

  // Search and filtering
  searchAssets: async (query: string): Promise<Asset[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync<Asset>(
        `SELECT * FROM assets 
         WHERE symbol LIKE ? OR name LIKE ?
         ORDER BY symbol ASC`,
        [`%${query}%`, `%${query}%`]
      );
      return result;
    } catch (error) {
      console.error('Error searching assets:', error);
      return [];
    }
  },

  getTransactionsByDateRange: async (portfolioId: number, startDate: number, endDate: number): Promise<Transaction[]> => {
    try {
      const db = openDatabase();
      const result = await db.getAllAsync<Transaction>(
        `SELECT t.*, a.symbol, a.name as asset_name
         FROM transactions t 
         LEFT JOIN assets a ON t.asset_id = a.id 
         WHERE t.portfolio_id = ? AND t.date BETWEEN ? AND ?
         ORDER BY t.date DESC`,
        [portfolioId, startDate, endDate]
      );
      return result;
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      return [];
    }
  },

  // Bulk operations
  addMultipleTransactions: async (transactions: Omit<Transaction, 'id'>[]): Promise<number[]> => {
    try {
      const db = openDatabase();
      const ids: number[] = [];
      
      for (const transaction of transactions) {
        const result = await db.runAsync(
          `INSERT INTO transactions (type, quantity, price, date, portfolio_id, asset_id) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            transaction.type,
            transaction.quantity,
            transaction.price,
            transaction.date,
            transaction.portfolio_id || null,
            transaction.asset_id || null
          ]
        );
        ids.push(result.lastInsertRowId as number);
      }
      
      return ids;
    } catch (error) {
      console.error('Error adding multiple transactions:', error);
      throw error;
    }
  },

  // Database maintenance
  clearAllData: async (): Promise<boolean> => {
    try {
      const db = openDatabase();
      await db.execAsync('DELETE FROM transactions');
      await db.execAsync('DELETE FROM portfolios');
      await db.execAsync('DELETE FROM assets');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },

  exportData: async (): Promise<any> => {
    try {
      const db = openDatabase();
      const [portfolios, assets, transactions] = await Promise.all([
        db.getAllAsync('SELECT * FROM portfolios'),
        db.getAllAsync('SELECT * FROM assets'),
        db.getAllAsync('SELECT * FROM transactions'),
      ]);
      
      return {
        portfolios,
        assets,
        transactions,
        exportDate: Date.now(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
};