import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPurchaseHistory, fetchPurchaseDetail, clearSelected } from './purchasesSlice';

const PurchaseHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, selectedPurchase, loading, detailLoading } = useAppSelector(s => s.purchases);
  const [email, setEmail] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) dispatch(fetchPurchaseHistory(email.trim()));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Purchase History</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter customer email"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {list.length > 0 && !selectedPurchase && (
        <div className="space-y-2">
          {list.map((p) => (
            <div
              key={p.id}
              onClick={() => dispatch(fetchPurchaseDetail(p.id))}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  #{p.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(p.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">₹{p.rounded_net_price}</p>
                {p.invoice_sent && (
                  <span className="text-xs text-green-600">Invoice Sent ✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {detailLoading && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading details...</div>
      )}

      {selectedPurchase && (
        <div className="mt-4">
          <button
            onClick={() => dispatch(clearSelected())}
            className="mb-4 text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to list
          </button>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-left text-gray-600">Product</th>
                  <th className="p-3 text-right text-gray-600">Qty</th>
                  <th className="p-3 text-right text-gray-600">Unit Price</th>
                  <th className="p-3 text-right text-gray-600">Tax</th>
                  <th className="p-3 text-right text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedPurchase.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-3">{item.product_code}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">₹{item.unit_price_snapshot}</td>
                    <td className="p-3 text-right">₹{item.tax_amount}</td>
                    <td className="p-3 text-right font-medium">₹{item.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <div className="text-sm font-semibold text-gray-800">
                Grand Total: ₹{selectedPurchase.rounded_net_price}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
