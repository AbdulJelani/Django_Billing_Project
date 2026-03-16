import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import BillingPage from './features/billing/BillingPage';
import PurchaseHistory from './features/purchases/PurchaseHistory';
import ProductManagement from './features/products/ProductManagement';

const App: React.FC = () => (
  <Provider store={store}>
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 items-center">
          <span className="font-semibold text-gray-800 mr-4">BillingSystem</span>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`
            }
          >
            New Bill
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`
            }
          >
            Purchase History
          </NavLink>
        </nav>
        <main className="py-8 px-4">
          <Routes>
            <Route path="/" element={<BillingPage />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/history" element={<PurchaseHistory />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  </Provider>
);

export default App;
