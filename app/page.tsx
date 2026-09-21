import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between">
      {/* Header / Nav */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between border-b border-gray-800/60 max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-amber-500/20">
            3D
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-amber-300 bg-clip-text text-transparent">
            Dish3D SaaS
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-300 hover:text-white transition px-4 py-2"
          >
            Hotel Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition transform hover:scale-[1.02]"
          >
            Register Restaurant
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-8">
          <span>✨</span>
          <span>Next-Generation Restaurant SaaS & 3D Ordering</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Transform Flat Menus into{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            Interactive 3D Experiences
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl font-normal leading-relaxed">
          Allow diners to view dishes in 360° 3D & Augmented Reality directly from their smartphone browser — no app download required. Boost order values by up to 30%.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-extrabold text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition transform hover:scale-105"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 font-semibold text-base hover:bg-gray-800 transition"
          >
            Dashboard Demo
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="text-lg font-bold text-white mb-2">QR Code Ordering</h3>
            <p className="text-gray-400 text-sm">
              Instant QR menus generated per table. Diners scan and order seamlessly without waiting for waiters.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur">
            <div className="text-2xl mb-3">🍔</div>
            <h3 className="text-lg font-bold text-white mb-2">Photorealistic 3D Dishes</h3>
            <p className="text-gray-400 text-sm">
              Showcase high-resolution 3D food models with real-time lighting and customizable dietary tags.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur">
            <div className="text-2xl mb-3">🏢</div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Tenant Hotel SaaS</h3>
            <p className="text-gray-400 text-sm">
              Isolated dashboards for every restaurant owner with real-time order tracking and sales analytics.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-8 px-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} 3D Digital Food Menu SaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}
