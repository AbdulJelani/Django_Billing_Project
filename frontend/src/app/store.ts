import { configureStore } from '@reduxjs/toolkit';
import billingReducer from '../features/billing/billingSlice';
import productsReducer from '../features/products/productsSlice';
import purchasesReducer from '../features/purchases/purchasesSlice';

export const store = configureStore({
  reducer: {
    billing: billingReducer,
    products: productsReducer,
    purchases: purchasesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow non-serializable values if needed
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
