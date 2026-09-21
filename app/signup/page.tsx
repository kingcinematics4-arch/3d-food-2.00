'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hotel_name: '',
    owner_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register hotel');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 text-white">
      <div className="w-full max-w-xl bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-extrabold text-2xl mb-3 shadow-lg shadow-amber-500/20">
            3D
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-amber-300 bg-clip-text text-transparent">
            Register Your Restaurant
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Create your multi-tenant 3D digital menu & ordering dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            Hotel created successfully! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                name="hotel_name"
                required
                value={formData.hotel_name}
                onChange={handleChange}
                placeholder="e.g. Grand Palace Bistro"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/80 focus:border-amber-400 focus:outline-none text-white text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Owner / Manager Name
              </label>
              <input
                type="text"
                name="owner_name"
                required
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/80 focus:border-amber-400 focus:outline-none text-white text-sm transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="owner@restaurant.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/80 focus:border-amber-400 focus:outline-none text-white text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/80 focus:border-amber-400 focus:outline-none text-white text-sm transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/80 focus:border-amber-400 focus:outline-none text-white text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/80 focus:border-amber-400 focus:outline-none text-white text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
              Full Street Address
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Culinary Blvd, Suite 100"
              className="w-full px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/80 focus:border-amber-400 focus:outline-none text-white text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition transform active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Creating Restaurant Account...' : 'Complete Hotel Onboarding'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
