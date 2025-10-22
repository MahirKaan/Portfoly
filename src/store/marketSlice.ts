import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssetPrice, MarketState } from '../types';

const initialState: MarketState = {
  prices: {},
  loading: false,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setPrices: (state, action: PayloadAction<Record<string, AssetPrice>>) => {
      state.prices = { ...state.prices, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setPrices, setLoading } = marketSlice.actions;
export default marketSlice.reducer;