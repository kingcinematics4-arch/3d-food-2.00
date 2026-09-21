'use client';

import React from 'react';
import Link from 'next/link';

export default function DemoBanner() {
  const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black text-xs font-bold py-1.5 px-4 text-center flex items-center justify-between shadow-md z-50 relative">
      <div className="flex items-center space-x-2 mx-auto">
        <span className="px-2 py-0.5 rounded bg-black text-amber-400 uppercase text-[10px] font-extrabold tracking-wider">
          ⚡ LOCAL DEMO MODE ACTIVE
        </span>
        <span className="hidden sm:inline opacity-90">
          Previewing full 3D Menu & Restaurant SaaS. No Supabase credentials required.
        </span>
      </div>

      <div className="flex items-center space-x-3 text-[11px]">
        <Link
          href="/dashboard"
          className="underline hover:text-gray-900 font-extrabold"
        >
          Open Dashboard
        </Link>
        <Link
          href="/menu/demo-restaurant"
          className="underline hover:text-gray-900 font-extrabold"
        >
          Customer Menu
        </Link>
      </div>
    </div>
  );
}
