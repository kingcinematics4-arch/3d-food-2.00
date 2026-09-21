'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabaseClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hotelName, setHotelName] = useState<string>('My Restaurant');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side auth session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email || '');

          // Fetch linked hotel from database
          const { data: userLink } = await supabaseClient
            .from('hotel_users')
            .select('hotel_id, hotel:hotels(name)')
            .eq('user_id', session.user.id)
            .single();

          if (userLink?.hotel?.name) {
            setHotelName(userLink.hotel.name);
          } else if (session.user.user_metadata?.hotel_name) {
            setHotelName(session.user.user_metadata.hotel_name);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: '📊' },
    { label: 'Menu & 3D Models', href: '/dashboard/menu', icon: '🍲' },
    { label: 'Live Orders', href: '/dashboard/orders', icon: '🔔' },
    { label: 'QR Code Builder', href: '/dashboard/qr', icon: '📱' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
    { label: 'Menu Design', href: '/dashboard/customize', icon: '🎨' },
    { label: 'Customer Reviews', href: '/dashboard/reviews', icon: '⭐' },
    { label: 'Restaurant Profile', href: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo & Hotel Title */}
          <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-amber-500/20">
              3D
            </div>
            <div>
              <h2 className="font-bold text-white truncate max-w-[140px]">{hotelName}</h2>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                Multi-Tenant Dashboard
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md shadow-amber-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-xs font-semibold text-gray-300 truncate">{userEmail || 'Owner Account'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">
              {navItems.find((n) => n.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Live Multi-Tenant Active
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
