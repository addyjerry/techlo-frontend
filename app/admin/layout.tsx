'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/products', label: '📦 Products' },
  { href: '/admin/orders', label: '🛒 Orders' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 bg-black text-white flex flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Techlo Admin</h2>
        <nav className="flex flex-col gap-3 flex-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className={`text-sm py-2 px-3 rounded transition ${
                pathname === link.href
                  ? 'bg-white text-black font-semibold'
                  : 'hover:bg-gray-800'
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: '/admin-login' })}
          className="text-sm text-gray-400 hover:text-white mt-4"
        >
          Logout →
        </button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}