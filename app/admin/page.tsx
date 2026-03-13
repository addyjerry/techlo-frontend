interface Stat {
  label: string;
  value: string | number;
}

async function getStats() {
  const [productsRes, ordersRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, { cache: 'no-store' }),
  ]);

  const products = await productsRes.json();
  const orders = await ordersRes.json();

  const totalRevenue = orders
    .filter((o: { paymentStatus: string }) => o.paymentStatus === 'paid')
    .reduce((sum: number, o: { totalPrice: number }) => sum + o.totalPrice, 0);

  return { totalProducts: products.length, totalOrders: orders.length, totalRevenue };
}

export default async function AdminDashboard() {
  const { totalProducts, totalOrders, totalRevenue } = await getStats();

  const stats: Stat[] = [
    { label: 'Total Products', value: totalProducts },
    { label: 'Total Orders', value: totalOrders },
    { label: 'Total Revenue', value: `GH₵ ${totalRevenue.toLocaleString()}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}