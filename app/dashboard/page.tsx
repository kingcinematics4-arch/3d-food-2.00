'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDemoOrders, getDemoItems } from '@/lib/demoData';

export default function DashboardOverview() {
  const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const [stats, setStats] = useState([
    { label: 'Total Orders Today', value: '42', change: '+18% vs yesterday' },
    { label: 'Total Revenue', value: '$1,240.50', change: '+12% this week' },
    { label: 'Active 3D Menu Items', value: '28', change: '5 models updated' },
    { label: 'QR Scans Today', value: '189', change: 'Peak at 1:30 PM' },
  ]);

  useEffect(() => {
    if (isDemo) {
      const orders = getDemoOrders();
      const items = getDemoItems();
      const revenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

      setStats([
        { label: 'Total Orders Today', value: `${orders.length}`, change: 'Live Demo Stream' },
        { label: 'Total Revenue', value: `$${revenue.toFixed(2)}`, change: 'Live Demo Calculation' },
        { label: 'Active 3D Menu Items', value: `${items.length}`, change: 'Interactive 3D Preset Models' },
        { label: 'QR Scans Today', value: '189', change: 'Peak at 1:30 PM' },
      ]);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-slate-900 to-amber-950/40 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <span>Welcome to Demo Restaurant Hub</span>
              {isDemo && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-extrabold uppercase">
                  Local Demo Mode
                </span>
              )}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Interactive 3D Menu & Restaurant SaaS Dashboard Preview
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="/menu/demo-restaurant"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-400 font-bold text-xs border border-amber-500/30 transition"
            >
              👁 View Customer Menu ↗
            </a>
            <Link
              href="/dashboard/menu"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20"
            >
              + Manage 3D Dishes
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-5 rounded-xl bg-gray-900 border border-gray-800 shadow-md">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            <p className="text-xs text-amber-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Setup & Demo Mode Summary */}
      <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Interactive Development Demo Capabilities</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span>✅</span>
            <span><strong>3D Menu Management (/dashboard/menu):</strong> Add, edit, delete, toggle availability, featured, popular, calories, prep time, ingredients, allergens.</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span>✅</span>
            <span><strong>Customer 3D Menu (/menu/demo-restaurant):</strong> 360° GLTF dish viewer, category filter, dietary pills, cart drawer, checkout & place order.</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span>✅</span>
            <span><strong>Kitchen Display System (/dashboard/orders):</strong> Receives demo orders in real time. Transition statuses from PLACED ➔ ACCEPTED ➔ PREPARING ➔ READY ➔ COMPLETED.</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span>✅</span>
            <span><strong>Menu Design Customizer (/dashboard/customize):</strong> Change primary accent colors, card visual styles, fonts & welcome banners live.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
