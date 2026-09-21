'use client';

import React, { useState, useEffect } from 'react';
import { getDemoOrders, saveDemoOrders, DemoOrder } from '@/lib/demoData';
import { supabaseClient } from '@/lib/supabaseClient';

export default function LiveOrdersPage() {
  const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    if (isDemo) {
      setOrders(getDemoOrders());
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        // Live database query logic when not demo
      }
    } catch (e) {
      console.warn('Backend fetch failed, using demo orders:', e);
    }
    setOrders(getDemoOrders());
    setLoading(false);
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  ) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);

    if (isDemo) {
      saveDemoOrders(updated);
      return;
    }

    try {
      await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus.toLowerCase() }),
      });
    } catch (e) {
      console.warn('Order status update error:', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab.toUpperCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ACCEPTED':
      case 'PREPARING':
      case 'preparing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'READY':
      case 'ready':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'COMPLETED':
      case 'completed':
        return 'bg-gray-800 text-gray-400 border-gray-700';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getMinutesAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>Kitchen Display System (KDS)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {isDemo && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-extrabold uppercase">
                Demo Mode Active
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm">
            Live real-time order stream for kitchen staff & waiters.
          </p>
        </div>

        {/* Counter Summary Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
            {orders.filter((o) => o.status === 'PLACED').length} Placed
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
            {orders.filter((o) => o.status === 'PREPARING' || o.status === 'ACCEPTED').length} Cooking
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
            {orders.filter((o) => o.status === 'READY').length} Ready
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-3 overflow-x-auto">
        {['all', 'placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === tab
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab} ({orders.filter((o) => (tab === 'all' ? true : o.status === tab.toUpperCase())).length})
          </button>
        ))}
      </div>

      {/* Live Orders Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading live orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-gray-900 rounded-2xl border border-gray-800 text-gray-400">
          No orders under "{activeTab.toUpperCase()}". Place a new demo order at{' '}
          <a href="/menu/demo-restaurant" target="_blank" className="text-amber-400 underline font-semibold">
            /menu/demo-restaurant
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const minsAgo = getMinutesAgo(order.created_at);
            return (
              <div
                key={order.id}
                className={`bg-gray-900 rounded-2xl border ${
                  order.status === 'PLACED'
                    ? 'border-amber-500/50 shadow-amber-500/5'
                    : 'border-gray-800'
                } p-5 flex flex-col justify-between shadow-xl space-y-4`}
              >
                {/* Order Top Card Header */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-lg text-white">
                        {order.table_number}
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        ({order.order_code})
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{order.customer_name}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">⏱ {minsAgo}m ago</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 flex-1">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-gray-800/60 border border-gray-750 flex items-start justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">
                          {item.quantity}x {item.name}
                        </span>
                        {item.notes && (
                          <p className="text-[11px] text-amber-300 mt-0.5 font-medium">
                            ⚠️ Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-400">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total & Payment Method */}
                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Payment: <strong className="text-gray-200">{order.payment_method}</strong> ({order.payment_status})
                  </span>
                  <span className="text-base font-extrabold text-amber-400">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex items-center gap-2">
                  {order.status === 'PLACED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20"
                    >
                      👍 Accept Order
                    </button>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                      className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
                    >
                      🔥 Start Cooking
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20"
                    >
                      🔔 Mark Ready to Serve
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                      className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-extrabold text-xs border border-gray-700"
                    >
                      ✅ Complete Order
                    </button>
                  )}

                  {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                      className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
