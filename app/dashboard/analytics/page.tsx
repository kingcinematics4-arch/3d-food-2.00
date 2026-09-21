'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getDemoOrders, getDemoItems } from '@/lib/demoData';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AnalyticsDashboardPage() {
  const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('7days');
  const [isMounted, setIsMounted] = useState(false);

  const [totalRevenue, setTotalRevenue] = useState(6350.00);
  const [totalOrdersCount, setTotalOrdersCount] = useState(260);
  const [aov, setAov] = useState(24.42);

  useEffect(() => {
    setIsMounted(true);
    if (isDemo) {
      const orders = getDemoOrders();
      const revenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
      const count = orders.length;
      setTotalRevenue(revenue > 0 ? revenue : 6350.00);
      setTotalOrdersCount(count > 0 ? count : 260);
      setAov(count > 0 ? parseFloat((revenue / count).toFixed(2)) : 24.42);
    }
  }, []);

  // Chart Configurations
  const salesTrendOptions: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: { mode: 'dark' },
    colors: ['#f59e0b', '#10b981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#9ca3af' } },
    },
    yaxis: {
      labels: { style: { colors: '#9ca3af' } },
    },
    grid: { borderColor: '#1f2937' },
  };

  const salesTrendSeries = [
    { name: 'Revenue ($)', data: [420, 680, 590, 810, 1150, 1420, 1280] },
    { name: 'Orders Count', data: [18, 28, 24, 35, 48, 56, 51] },
  ];

  const topDishesOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: 'dark' },
    plotOptions: { bar: { borderRadius: 6, horizontal: true } },
    colors: ['#f59e0b'],
    xaxis: { labels: { style: { colors: '#9ca3af' } } },
    yaxis: {
      categories: [
        'Wagyu Burger',
        'Margherita Pizza',
        'Mediterranean Salad',
        'Lava Cake',
        'Truffle Fries',
      ],
      labels: { style: { colors: '#9ca3af' } },
    },
    grid: { borderColor: '#1f2937' },
  };

  const topDishesSeries = [{ name: 'Units Sold', data: [142, 118, 86, 74, 52] }];

  const paymentMethodOptions: any = {
    chart: { type: 'donut', background: 'transparent' },
    theme: { mode: 'dark' },
    labels: ['Pay at Table', 'Card / POS', 'UPI / Digital Wallet'],
    colors: ['#f59e0b', '#3b82f6', '#10b981'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
  };

  const paymentMethodSeries = [45, 35, 20];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>Analytics & Revenue Intelligence</span>
            {isDemo && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-extrabold uppercase">
                Demo Metrics Active
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm">
            Track sales volume, 3D menu engagement, peak ordering times, and average basket value.
          </p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 p-1.5 rounded-xl">
          {(['today', '7days', '30days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                timeRange === range
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
          <p className="text-xs uppercase font-semibold text-gray-400">Total Revenue</p>
          <p className="text-3xl font-extrabold text-white mt-2">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-emerald-400 mt-1.5 font-medium">↑ +22.4% vs previous period</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
          <p className="text-xs uppercase font-semibold text-gray-400">Total Orders Placed</p>
          <p className="text-3xl font-extrabold text-white mt-2">{totalOrdersCount}</p>
          <p className="text-xs text-emerald-400 mt-1.5 font-medium">↑ +14.2% order volume</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
          <p className="text-xs uppercase font-semibold text-gray-400">Average Order Value (AOV)</p>
          <p className="text-3xl font-extrabold text-white mt-2">${aov.toFixed(2)}</p>
          <p className="text-xs text-amber-400 mt-1.5 font-medium">✨ +$4.10 boost with 3D menu</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
          <p className="text-xs uppercase font-semibold text-gray-400">QR Table Scans</p>
          <p className="text-3xl font-extrabold text-white mt-2">1,240</p>
          <p className="text-xs text-blue-400 mt-1.5 font-medium">92% conversion rate</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-lg font-bold text-white">Revenue & Order Volume Trend</h3>
            <span className="text-xs text-amber-400 font-semibold">Weekly Growth</span>
          </div>

          {isMounted && (
            <Chart
              options={salesTrendOptions}
              series={salesTrendSeries}
              type="area"
              height={300}
            />
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
            Payment Method Split
          </h3>

          {isMounted && (
            <Chart
              options={paymentMethodOptions}
              series={paymentMethodSeries}
              type="donut"
              height={260}
            />
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">45% of guests prefer Pay at Table</p>
          </div>
        </div>
      </div>

      {/* Top Dishes Bar Chart */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
          Top Performing 3D Dishes (Units Sold)
        </h3>

        {isMounted && (
          <Chart
            options={topDishesOptions}
            series={topDishesSeries}
            type="bar"
            height={260}
          />
        )}
      </div>
    </div>
  );
}
