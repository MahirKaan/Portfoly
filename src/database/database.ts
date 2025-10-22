import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const openDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('portfoly.db');
  }
  return db;
};

export const initDatabase = async (): Promise<boolean> => {
  try {
    const database = openDatabase();
    
    // Tabloları tek tek oluştur
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s','now'))
      );
    `);
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        api_symbol TEXT NOT NULL,
        type TEXT NOT NULL
      );
    `);
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        date INTEGER NOT NULL,
        portfolio_id INTEGER,
        asset_id INTEGER,
        created_at INTEGER DEFAULT (strftime('%s','now'))
      );
    `);
    
    // Örnek varlıkları ekle
    try {
      await database.execAsync(`
        INSERT OR IGNORE INTO assets (symbol, name, api_symbol, type) VALUES 
        ('BTC', 'Bitcoin', 'bitcoin', 'crypto'),
        ('ETH', 'Ethereum', 'ethereum', 'crypto'),
        ('XU100', 'BIST 100', 'XU100.IS', 'bist'),
        ('EREGL', 'Ereğli Demir Çelik', 'EREGL.IS', 'bist'),
        ('GARAN', 'Garanti Bankası', 'GARAN.IS', 'bist'),
        ('AKBNK', 'Akbank', 'AKBNK.IS', 'bist')
      `);
    } catch (insertError) {
      console.log('Assets already exist or insert error:', insertError);
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.log('Database initialization error:', error);
    return false;
  }
};