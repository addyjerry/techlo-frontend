'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductForm {
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  condition: string;
  image: string;
  badge: string;
  specs: string;
  inStock: string;
}

const initialForm: ProductForm = {
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  condition: '',
  image: '',
  badge: '',
  specs: '',
  inStock: '',
};

const categories = ['Phones', 'Laptops', 'Audio', 'Cameras', 'Gaming', 'Tablets', 'Wearables'];
const conditions = ['Like New', 'Good', 'Fair'];
const badges = ['', 'Hot Deal', 'Popular', 'Low Stock', 'Rare Find'];

export default function AddProduct() {
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Basic validation
    if (!form.name || !form.category || !form.price || !form.condition) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      condition: form.condition,
      image: form.image,
      badge: form.badge || undefined,
      specs: form.specs.split(',').map((s) => s.trim()).filter(Boolean),
      inStock: Number(form.inStock),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create product');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-black text-sm">
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Add Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="name" value={form.name}
            onChange={handleChange} placeholder="e.g. iPhone 13 Pro"
            className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              name="condition" value={form.condition} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select condition</option>
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Price & Original Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (GH₵) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" name="price" value={form.price}
              onChange={handleChange} placeholder="e.g. 2800"
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Price (GH₵)
            </label>
            <input
              type="number" name="originalPrice" value={form.originalPrice}
              onChange={handleChange} placeholder="e.g. 4200"
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Stock & Badge */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              In Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number" name="inStock" value={form.inStock}
              onChange={handleChange} placeholder="e.g. 3"
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <select
              name="badge" value={form.badge} onChange={handleChange}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              {badges.map((b) => <option key={b} value={b}>{b || 'No badge'}</option>)}
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Path</label>
          <input
            type="text" name="image" value={form.image}
            onChange={handleChange} placeholder="e.g. /icons/iphone.jpg"
            className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Specs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specs
            <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
          </label>
          <textarea
            name="specs" value={form.specs} onChange={handleChange}
            placeholder="e.g. 256GB, Sierra Blue, Battery 91%"
            rows={3}
            className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit} disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </div>
    </div>
  );
}