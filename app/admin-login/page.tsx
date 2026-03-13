'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) router.push('/admin');
    else setError('Invalid email or password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Techlo Admin</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3 text-sm"
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4 text-sm"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded font-medium hover:bg-gray-800"
        >
          Login
        </button>
      </div>
    </div>
  );
}