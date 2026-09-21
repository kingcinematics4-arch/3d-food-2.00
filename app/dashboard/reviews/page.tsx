'use client';

import React, { useState } from 'react';

interface Review {
  id: string;
  dishName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  tableNumber: string;
}

export default function ReviewsDashboardPage() {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const reviews: Review[] = [
    {
      id: 'rev-1',
      dishName: 'Signature Wagyu Burger',
      customerName: 'Marcus Vance',
      rating: 5,
      comment: 'The 3D model looked amazing on my phone, and the real dish tasted even better! Truffle aioli is incredible.',
      createdAt: '2 hours ago',
      tableNumber: 'Table 5',
    },
    {
      id: 'rev-2',
      dishName: 'Wood-Fired Margherita Pizza',
      customerName: 'Emily Stone',
      rating: 5,
      comment: 'Authentic Neapolitan crust with perfectly melted buffalo mozzarella. Love the QR ordering experience.',
      createdAt: '5 hours ago',
      tableNumber: 'Table 2',
    },
    {
      id: 'rev-3',
      dishName: 'Mediterranean Salad Bowl',
      customerName: 'Carlos R.',
      rating: 4,
      comment: 'Very fresh ingredients and generous portion size of French feta. Will order again!',
      createdAt: '1 day ago',
      tableNumber: 'Table 9',
    },
    {
      id: 'rev-4',
      dishName: 'Decadent Chocolate Lava Cake',
      customerName: 'Sophia Lin',
      rating: 5,
      comment: 'The molten dark chocolate center was absolute perfection with the Madagascar gelato.',
      createdAt: '2 days ago',
      tableNumber: 'Table 4',
    },
  ];

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  });

  const renderStars = (count: number) => {
    return '⭐'.repeat(count);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Reviews & Dish Feedback</h1>
          <p className="text-gray-400 text-sm">
            Monitor diner ratings, feedback on 3D dishes, and customer satisfaction scores.
          </p>
        </div>
      </div>

      {/* Summary Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase font-semibold text-gray-400">Average Rating</p>
          <p className="text-5xl font-extrabold text-amber-400 mt-2">4.8</p>
          <div className="text-lg mt-1">⭐⭐⭐⭐⭐</div>
          <p className="text-xs text-gray-400 mt-2">Based on 148 verified diner reviews</p>
        </div>

        <div className="md:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-2 flex flex-col justify-center">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Rating Distribution</h3>
          {[
            { stars: '5 Stars', pct: '82%', count: 121 },
            { stars: '4 Stars', pct: '14%', count: 20 },
            { stars: '3 Stars', pct: '3%', count: 5 },
            { stars: '2 Stars', pct: '1%', count: 2 },
            { stars: '1 Star', pct: '0%', count: 0 },
          ].map((item) => (
            <div key={item.stars} className="flex items-center space-x-3 text-xs">
              <span className="w-14 text-gray-400 font-medium">{item.stars}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: item.pct }}
                ></div>
              </div>
              <span className="w-10 text-right text-gray-400 font-mono">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-3 overflow-x-auto">
        {(['all', 5, 4, 3] as const).map((r) => (
          <button
            key={String(r)}
            onClick={() => setFilterRating(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterRating === r
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {r === 'all' ? 'All Reviews' : `${r} Star Ratings`}
          </button>
        ))}
      </div>

      {/* Reviews Feed Grid */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {rev.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{rev.customerName}</h4>
                  <p className="text-xs text-gray-400">
                    Ordered <strong className="text-amber-300">{rev.dishName}</strong> at {rev.tableNumber}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm">{renderStars(rev.rating)}</span>
                <p className="text-[11px] text-gray-500 mt-0.5">{rev.createdAt}</p>
              </div>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed bg-gray-950/60 p-3 rounded-xl border border-gray-800">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
