import Link from 'next/link';
import { IProduct } from '@/types';

async function getProducts(): Promise<IProduct[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function AdminProducts() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/add"
          className="bg-black text-white px-4 py-2 rounded text-sm">
          + Add Product
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: IProduct) => (
              <tr key={p._id} className="border-t">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-gray-500">{p.category}</td>
                <td className="p-4">GH₵ {p.price.toLocaleString()}</td>
                <td className="p-4">{p.inStock}</td>
                <td className="p-4">
                  <Link href={`/admin/products/${p._id}`}
                    className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}