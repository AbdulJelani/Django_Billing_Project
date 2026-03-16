import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { generateBill, clearBill } from './billingSlice';
import { fetchProducts } from '../products/productsSlice';
import BillResult from './BillResult';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DENOMINATIONS = [500, 50, 20, 10, 5, 2, 1];

const schema = z.object({
  customer_email: z.string().email('Invalid email'),
  items: z.array(z.object({
    product_id: z.string().min(1, 'Product ID required'),
    quantity: z.number().int().min(1, 'Min 1'),
  })).min(1, 'Add at least one product'),
  denominations: z.record(z.string(), z.number().min(0)),
  cash_paid: z.number().positive('Must be positive'),
});

type FormData = z.infer<typeof schema>;

const BillingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentBill, loading, error } = useAppSelector((s) => s.billing);
  const { items: products, loading: productsLoading } = useAppSelector((s) => s.products);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_email: '',
      items: [{ product_id: '', quantity: 1 }],
      denominations: Object.fromEntries(DENOMINATIONS.map(d => [String(d), 0])),
      cash_paid: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(generateBill({
      ...data,
      cash_paid: Number(data.cash_paid),
    }));
    if (generateBill.fulfilled.match(result)) {
      toast.success('Bill generated! Invoice sent to email.');
    } else {
      toast.error(result.payload as string || 'Failed to generate bill');
    }
  };

  if (currentBill) {
    return (
      <BillResult
        purchase={currentBill}
        onNewBill={() => { dispatch(clearBill()); reset(); }}
      />
    );
  }

  if (products.length === 0 && !productsLoading) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-4xl mb-4">📦</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Products Available</h2>
        <p className="text-gray-600 mb-6">
          You need to add products to your inventory before you can generate a bill.
        </p>
        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Add Your First Product
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Billing Page</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Customer Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
          <input
            {...register('customer_email')}
            type="email"
            placeholder="customer@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.customer_email && (
            <p className="text-red-500 text-xs mt-1">{errors.customer_email.message}</p>
          )}
        </div>

        {/* Bill Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Bill Section</label>
            <button
              type="button"
              onClick={() => append({ product_id: '', quantity: 1 })}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              + Add New
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    {...register(`items.${index}.product_id`)}
                    placeholder="Product ID (e.g. RICE-001)"
                    list="products-list"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.items?.[index]?.product_id && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.items[index]?.product_id?.message}</p>
                  )}
                </div>
                <div className="w-28">
                  <input
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    min={1}
                    placeholder="Qty"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-400 hover:text-red-600 text-xl leading-none px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <datalist id="products-list">
            {products.map(p => (
              <option key={p.id} value={p.product_id}>{p.name}</option>
            ))}
          </datalist>
        </div>

        <hr className="border-gray-200" />

        {/* Denominations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Denominations Available</label>
          <div className="grid grid-cols-2 gap-2">
            {DENOMINATIONS.map((denom) => (
              <div key={denom} className="flex items-center gap-3">
                <span className="w-10 text-right text-sm font-medium text-gray-600">₹{denom}</span>
                <input
                  {...register(`denominations.${denom}`, { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="Count"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cash Paid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cash Paid by Customer (₹)</label>
          <input
            {...register('cash_paid', { valueAsNumber: true })}
            type="number"
            min={0}
            step="0.01"
            placeholder="Amount"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.cash_paid && (
            <p className="text-red-500 text-xs mt-1">{errors.cash_paid.message}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
          >
            {loading ? 'Generating...' : 'Generate Bill'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingPage;
