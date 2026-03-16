import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PurchaseListItem, Purchase } from '../../types';
import { billingApi } from '../../services/api';

interface PurchasesState {
  list: PurchaseListItem[];
  selectedPurchase: Purchase | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: PurchasesState = {
  list: [],
  selectedPurchase: null,
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchPurchaseHistory = createAsyncThunk(
  'purchases/fetchHistory',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await billingApi.getHistory(email);
      return response.data.results || response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPurchaseDetail = createAsyncThunk(
  'purchases/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await billingApi.getPurchase(id);
      return response.data as Purchase;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearSelected: (state) => { state.selectedPurchase = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseHistory.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchPurchaseHistory.fulfilled, (state, action) => {
        state.loading = false; state.list = action.payload;
      })
      .addCase(fetchPurchaseHistory.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(fetchPurchaseDetail.pending, (state) => { state.detailLoading = true; })
      .addCase(fetchPurchaseDetail.fulfilled, (state, action) => {
        state.detailLoading = false; state.selectedPurchase = action.payload;
      })
      .addCase(fetchPurchaseDetail.rejected, (state) => { state.detailLoading = false; });
  },
});

export const { clearSelected } = purchasesSlice.actions;
export default purchasesSlice.reducer;
