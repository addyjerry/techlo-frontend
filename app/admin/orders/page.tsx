'use client';
import { useState, useEffect } from 'react';
import { IOrder } from '@/types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data: IOrder[] = await res.json();
        setOrders(data);
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) =>
    filter === 'all' ? true : o.paymentStatus === filter
  );

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading orders...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
      {error}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-3xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Paid Orders</p>
          <p className="text-3xl font-bold mt-1 text-green-600">
            {orders.filter((o) => o.paymentStatus === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Revenue Collected</p>
          <p className="text-3xl font-bold mt-1">GH₵ {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'paid', 'pending'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              filter === tab
                ? 'bg-black text-white'
                : 'bg-white text-gray-500 border hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">
          No orders found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Items</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <>
                  <tr
                    key={order._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {/* Order ID */}
                    <td className="p-4 font-mono text-xs text-gray-500">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-gray-400 text-xs">{order.phone}</p>
                    </td>

                    {/* Location */}
                    <td className="p-4 text-gray-500">{order.location}</td>

                    {/* Total */}
                    <td className="p-4 font-semibold">
                      GH₵ {order.totalPrice.toLocaleString()}
                    </td>

                    {/* Payment status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>

                    {/* Expand toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {expandedId === order._id ? 'Hide' : `View (${order.items.length})`}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded items row */}
                  {expandedId === order._id && (
                    <tr key={`${order._id}-expanded`} className="bg-gray-50 border-t">
                      <td colSpan={7} className="p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                          Order Items
                        </p>
                        <div className="flex flex-col gap-2">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 bg-white rounded-lg p-3 border"
                            >
                              {item.image && (
                                <img
                                  src={item.image} alt={item.name}
                                  className="w-10 h-10 object-cover rounded-md bg-gray-100"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-gray-400 text-xs">
                                  Qty: {item.quantity} × GH₵ {item.price.toLocaleString()}
                                </p>
                              </div>
                              <p className="font-semibold text-sm">
                                GH₵ {(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Payment reference */}
                        {order.paymentReference && (
                          <p className="text-xs text-gray-400 mt-3">
                            Ref: <span className="font-mono">{order.paymentReference}</span>
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}