'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FoodModelViewer from '@/components/3d/FoodModelViewer';
import {
  getDemoItems,
  getDemoOrders,
  saveDemoOrders,
  getDemoCustomization,
  DemoMenuItem,
  DemoOrder,
} from '@/lib/demoData';

interface CartItem {
  menuItem: DemoMenuItem;
  quantity: number;
  notes?: string;
}

function MenuContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const tableNumber = searchParams.get('table') || '1';
  const hotelSlug = slug;

  const [hotelName, setHotelName] = useState('Demo Restaurant');
  const [menuItems, setMenuItems] = useState<DemoMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<DemoMenuItem | null>(null);

  // Customization State
  const [theme, setTheme] = useState({
    primary_color: '#f59e0b',
    welcome_banner: 'Experience our gourmet dishes in 360° 3D & Augmented Reality!',
    card_style: 'glassmorphic',
  });

  // Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_table' | 'card' | 'upi'>('pay_at_table');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isDemo || slug === 'demo-restaurant') {
      const items = getDemoItems();
      setMenuItems(items);

      const cust = getDemoCustomization();
      setTheme({
        primary_color: cust.primary_color || '#f59e0b',
        welcome_banner: cust.welcome_banner || 'Experience our gourmet dishes in 360° 3D!',
        card_style: cust.card_style || 'glassmorphic',
      });

      const uniqueCats = Array.from(new Set(items.map((i) => i.category || 'Main Course')));
      setCategories(['All', ...uniqueCats]);
      setHotelName('Demo Restaurant');
    }
  }, [slug]);

  const addToCart = (item: DemoMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const newOrderCode = `ORD-${Math.floor(500 + Math.random() * 400)}`;
    const newOrderId = `demo-ord-${Date.now()}`;

    const newOrder: DemoOrder = {
      id: newOrderId,
      order_code: newOrderCode,
      table_number: `Table ${tableNumber}`,
      customer_name: customerName || 'Guest Diner',
      customer_phone: customerPhone,
      status: 'PLACED',
      total_amount: totalCartPrice,
      payment_method: paymentMethod === 'pay_at_table' ? 'Pay at Table' : paymentMethod === 'card' ? 'Card / POS' : 'UPI / Wallet',
      payment_status: paymentMethod === 'pay_at_table' ? 'Unpaid' : 'Paid',
      created_at: new Date().toISOString(),
      notes: orderNotes,
      items: cart.map((c) => ({
        id: c.menuItem.id,
        name: c.menuItem.name,
        quantity: c.quantity,
        price: c.menuItem.price,
      })),
    };

    if (isDemo || slug === 'demo-restaurant') {
      const existingOrders = getDemoOrders();
      saveDemoOrders([newOrder, ...existingOrders]);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/order-status/${newOrderId}`);
    }, 600);
  };

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-32">
      {/* Header Banner */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-extrabold text-base shadow-lg"
            style={{ backgroundColor: theme.primary_color }}
          >
            3D
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">{hotelName}</h1>
            <div className="flex items-center space-x-2 text-xs text-amber-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Table #{tableNumber}</span>
            </div>
          </div>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-3.5 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-200 flex items-center space-x-2 hover:bg-gray-750 transition"
        >
          <span>🛒 Cart</span>
          {totalCartCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-black font-extrabold flex items-center justify-center text-[11px]"
              style={{ backgroundColor: theme.primary_color }}
            >
              {totalCartCount}
            </span>
          )}
        </button>
      </header>

      {/* Welcome Banner */}
      <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-gray-900 to-amber-950/40 border border-amber-500/20 text-xs text-amber-300 font-semibold flex items-center space-x-2">
        <span>✨</span>
        <span>{theme.welcome_banner}</span>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-3 overflow-x-auto no-scrollbar flex space-x-2 border-b border-gray-800/80 bg-gray-950/60 sticky top-14 z-20 backdrop-blur-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'text-black shadow-md'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
            }`}
            style={{
              backgroundColor: selectedCategory === cat ? theme.primary_color : undefined,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Dishes Menu Grid */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const inCart = cart.find((c) => c.menuItem.id === item.id);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between shadow-lg transition ${
                  theme.card_style === 'glassmorphic'
                    ? 'bg-gray-900/90 border-gray-800 backdrop-blur'
                    : theme.card_style === 'minimal'
                    ? 'bg-gray-900 border-none'
                    : 'bg-gray-900 border-amber-500/30'
                }`}
              >
                {/* 3D Viewer Canvas */}
                <div className="p-2.5 relative">
                  <FoodModelViewer
                    modelUrlGlb={item.model_url_glb}
                    className="h-52 w-full rounded-xl"
                  />
                  <button
                    onClick={() => setInspectItem(item)}
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-[11px] text-amber-300 font-medium border border-amber-500/30"
                  >
                    🔍 Inspect 3D
                  </button>

                  <div className="absolute top-4 left-4 flex gap-1">
                    {item.is_veg ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500 text-black">
                        🌱 VEG
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-500 text-white">
                        🍗 NON-VEG
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">{item.name}</h3>
                      <span className="text-base font-extrabold" style={{ color: theme.primary_color }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-gray-500 mt-2">
                      <span>🔥 {item.calories} kcal</span>
                      <span>⏱ {item.preparation_time_mins} mins</span>
                      <span>⭐ {item.rating || 4.8}</span>
                    </div>
                  </div>

                  {/* Add / Modify Cart Controls */}
                  <div className="pt-2 flex items-center justify-between">
                    {inCart ? (
                      <div className="flex items-center space-x-2 bg-gray-800 rounded-xl p-1 border border-gray-700 w-full justify-between">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-lg bg-gray-700 text-white font-bold flex items-center justify-center hover:bg-gray-650"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-2">{inCart.quantity} in order</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-lg text-black font-bold flex items-center justify-center"
                          style={{ backgroundColor: theme.primary_color }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full py-2.5 rounded-xl text-black font-extrabold text-xs shadow-md transition"
                        style={{ backgroundColor: theme.primary_color }}
                      >
                        + Add to Order (${item.price.toFixed(2)})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Bottom Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40">
          <div
            onClick={() => setIsCartOpen(true)}
            className="text-black p-4 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer transform hover:scale-[1.01] transition"
            style={{ backgroundColor: theme.primary_color }}
          >
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center font-extrabold text-sm">
                {totalCartCount}
              </span>
              <div>
                <p className="font-extrabold text-sm leading-tight">View Your Order</p>
                <p className="text-xs font-semibold opacity-80">Table #{tableNumber}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg">${totalCartPrice.toFixed(2)}</span>
              <span className="text-lg">→</span>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Up Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Your Order Summary</h2>
                <p className="text-xs text-amber-400">Table #{tableNumber}</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 divide-y divide-gray-800">
              {cart.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="pt-3 flex items-center justify-between text-sm">
                  <div>
                    <h4 className="font-semibold text-white">{menuItem.name}</h4>
                    <p className="text-xs text-gray-400">${menuItem.price.toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => removeFromCart(menuItem.id)}
                        className="w-6 h-6 rounded bg-gray-700 text-white font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold px-1.5">{quantity}</span>
                      <button
                        onClick={() => addToCart(menuItem)}
                        className="w-6 h-6 rounded text-black font-bold flex items-center justify-center"
                        style={{ backgroundColor: theme.primary_color }}
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-amber-400 min-w-[50px] text-right">
                      ${(menuItem.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form Details */}
            <form onSubmit={handlePlaceOrder} className="space-y-3 pt-4 border-t border-gray-800">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Special Instructions
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Extra spicy, sauce on side..."
                  className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pay_at_table')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                      paymentMethod === 'pay_at_table'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    💵 Pay at Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                      paymentMethod === 'card'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    💳 Card / POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                      paymentMethod === 'upi'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    📲 UPI / Wallet
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-base font-bold text-white pt-3 border-t border-gray-800">
                <span>Total Amount:</span>
                <span className="text-xl text-amber-400">${totalCartPrice.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3.5 px-6 rounded-xl text-black font-extrabold text-sm shadow-xl transition transform active:scale-98 disabled:opacity-50"
                style={{ backgroundColor: theme.primary_color }}
              >
                {isSubmitting ? 'Sending Order to Kitchen...' : 'Confirm & Place Demo Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3D Dish Fullscreen Inspector Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">{inspectItem.name}</h3>
              <button
                onClick={() => setInspectItem(null)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <FoodModelViewer
              modelUrlGlb={inspectItem.model_url_glb}
              modelUrlUsdz={inspectItem.model_url_usdz}
              className="h-64 w-full rounded-xl"
            />

            <p className="text-gray-300 text-xs leading-relaxed">{inspectItem.description}</p>

            {inspectItem.ingredients && inspectItem.ingredients.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Key Ingredients</h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectItem.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-2.5 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 border border-gray-700"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <span className="text-xl font-extrabold text-amber-400">
                ${inspectItem.price.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  addToCart(inspectItem);
                  setInspectItem(null);
                }}
                className="px-5 py-2.5 rounded-xl text-black font-bold text-xs shadow-lg"
                style={{ backgroundColor: theme.primary_color }}
              >
                + Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerMenuPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading Digital 3D Menu...</div>}>
      <MenuContent slug={params.slug} />
    </Suspense>
  );
}
