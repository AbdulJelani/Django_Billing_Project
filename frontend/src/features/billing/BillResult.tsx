import React from 'react';
import { Purchase } from '../../types';

interface Props {
  purchase: Purchase;
  onNewBill: () => void;
}

const BillResult: React.FC<Props> = ({ purchase, onNewBill }) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Billing Page</h1>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Customer Email:</span>
        <span className="text-sm text-gray-800">{purchase.customer_email}</span>
        {purchase.invoice_sent && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Invoice Sent ✓
          </span>
        )}
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 text-gray-600 font-medium">Product ID</th>
              <th className="text-right p-3 text-gray-600 font-medium">Unit Price</th>
              <th className="text-right p-3 text-gray-600 font-medium">Qty</th>
              <th className="text-right p-3 text-gray-600 font-medium">Purchase Price</th>
              <th className="text-right p-3 text-gray-600 font-medium">Tax %</th>
              <th className="text-right p-3 text-gray-600 font-medium">Tax Amount</th>
              <th className="text-right p-3 text-gray-600 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-800 font-medium">{item.product_code}</td>
                <td className="p-3 text-right text-gray-700">₹{item.unit_price_snapshot}</td>
                <td className="p-3 text-right text-gray-700">{item.quantity}</td>
                <td className="p-3 text-right text-gray-700">₹{item.purchase_price}</td>
                <td className="p-3 text-right text-gray-700">{item.tax_percentage_snapshot}%</td>
                <td className="p-3 text-right text-gray-700">₹{item.tax_amount}</td>
                <td className="p-3 text-right font-medium text-gray-800">₹{item.total_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-6">
        <div className="w-72 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total price without tax:</span>
            <span>₹{purchase.total_price_without_tax}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total tax payable:</span>
            <span>₹{purchase.total_tax}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-800">
            <span>Net price of purchased item:</span>
            <span>₹{purchase.net_price}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Rounded down value:</span>
            <span>₹{purchase.rounded_net_price}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-blue-700 border-t pt-1.5 mt-1.5">
            <span>Balance payable to customer:</span>
            <span>₹{purchase.balance}</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Balance Denomination */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Balance Denomination</h3>
        {Object.keys(purchase.balance_denomination).length === 0 ? (
          <p className="text-sm text-gray-500">No change required.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(purchase.balance_denomination).map(([denom, count]) => (
              <div key={denom} className="flex justify-between bg-gray-50 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-gray-600">₹{denom}:</span>
                <span className="text-sm font-semibold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onNewBill}
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          New Bill
        </button>
      </div>
    </div>
  );
};

export default BillResult;
