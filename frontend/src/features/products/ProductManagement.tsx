import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts } from './productsSlice';
import { productsApi } from '../../services/api';
import toast from 'react-hot-toast';

const ProductManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: products, loading } = useAppSelector((state) => state.products);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product_id: '',
    price: 0,
    tax_percentage: 18,
    available_stocks: 100,
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productsApi.create({
        ...formData,
        price: String(formData.price),
        tax_percentage: String(formData.tax_percentage),
      });
      toast.success('Product added successfully!');
      setShowForm(false);
      setFormData({ name: '', product_id: '', price: 0, tax_percentage: 18, available_stocks: 100 });
      dispatch(fetchProducts());
    } catch (err: any) {
      toast.error(err.message || 'Failed to add product');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Medimix Soap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product ID / Code</label>
            <input
              type="text"
              required
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. MED-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax (%)</label>
            <input
              type="number"
              required
              value={formData.tax_percentage}
              onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Count</label>
            <input
              type="number"
              required
              value={formData.available_stocks}
              onChange={(e) => setFormData({ ...formData, available_stocks: parseInt(e.target.value) })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Save Product
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Product Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-right">Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
                  No products found. Start by adding your first product!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{product.product_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">₹{product.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">{product.available_stocks}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
