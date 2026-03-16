import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Purchase, CreateBillPayload } from '../../types';
import { billingApi } from '../../services/api';

interface BillingState {
  currentBill: Purchase | null;
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  currentBill: null,
  loading: false,
  error: null,
};

export const generateBill = createAsyncThunk(
  'billing/generate',
  async (payload: CreateBillPayload, { rejectWithValue }) => {
    try {
      const response = await billingApi.generateBill(payload);
      return response.data as Purchase;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearBill: (state) => {
      state.currentBill = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateBill.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
      })
      .addCase(generateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBill } = billingSlice.actions;
export default billingSlice.reducer;
