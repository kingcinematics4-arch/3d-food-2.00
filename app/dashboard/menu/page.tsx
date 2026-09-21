'use client';

import React, { useState, useEffect } from 'react';
import FoodModelViewer from '@/components/3d/FoodModelViewer';
import { PRESET_3D_MODELS } from '@/lib/menu';
import { supabaseClient } from '@/lib/supabaseClient';
import {
  getDemoItems,
  saveDemoItems,
  DemoMenuItem,
  INITIAL_DEMO_CATEGORIES,
} from '@/lib/demoData';

export default function MenuManagementPage() {
  const isDemo = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const [menuItems, setMenuItems] = useState<DemoMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(INITIAL_DEMO_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DemoMenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 14.99,
    category: 'Main Course',
    image_url: '',
    model_url_glb: '',
    model_url_usdz: '',
    is_available: true,
    is_featured: false,
    is_popular: false,
    is_veg: true,
    calories: 450,
    preparation_time_mins: 15,
    ingredients: '' as string,
    allergens: '' as string,
    dietary_tags: [] as string[],
  });

  const availableDietary = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Chef Special', 'Spicy', 'Organic'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);

    if (isDemo) {
      setMenuItems(getDemoItems());
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        const { data: userLink } = await supabaseClient
          .from('hotel_users')
          .select('hotel_id')
          .eq('user_id', session.user.id)
          .single();

        if (userLink?.hotel_id) {
          const res = await fetch(`/api/menu?hotel_id=${userLink.hotel_id}`);
          const json = await res.json();
          if (json.success && json.menuItems.length > 0) {
            setMenuItems(json.menuItems);
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Backend fetch failed, falling back to local demo items:', e);
    }
    setMenuItems(getDemoItems());
    setLoading(false);
  };

  const updateItemsState = (newItems: DemoMenuItem[]) => {
    setMenuItems(newItems);
    if (isDemo) {
      saveDemoItems(newItems);
    }
  };

  const handleOpenModal = (item?: DemoMenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category || 'Main Course',
        image_url: item.image_url || '',
        model_url_glb: item.model_url_glb || '',
        model_url_usdz: item.model_url_usdz || '',
        is_available: item.is_available,
        is_featured: item.is_featured,
        is_popular: item.is_popular || false,
        is_veg: item.is_veg !== undefined ? item.is_veg : true,
        calories: item.calories || 450,
        preparation_time_mins: item.preparation_time_mins || 15,
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
        allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : '',
        dietary_tags: item.dietary_tags || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: 14.99,
        category: 'Main Course',
        image_url: '',
        model_url_glb: PRESET_3D_MODELS[0].glb,
        model_url_usdz: '',
        is_available: true,
        is_featured: false,
        is_popular: false,
        is_veg: true,
        calories: 500,
        preparation_time_mins: 15,
        ingredients: 'Fresh Herbs, Olive Oil, Salt, Garlic',
        allergens: 'Dairy, Gluten',
        dietary_tags: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedItem: DemoMenuItem = {
      id: editingItem ? editingItem.id : `demo-item-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      image_url: formData.image_url,
      model_url_glb: formData.model_url_glb,
      model_url_usdz: formData.model_url_usdz,
      is_available: formData.is_available,
      is_featured: formData.is_featured,
      is_popular: formData.is_popular,
      is_veg: formData.is_veg,
      calories: formData.calories,
      preparation_time_mins: formData.preparation_time_mins,
      ingredients: formData.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
      allergens: formData.allergens.split(',').map((s) => s.trim()).filter(Boolean),
      dietary_tags: formData.dietary_tags,
      rating: editingItem ? editingItem.rating : 4.8,
      order_count: editingItem ? editingItem.order_count : 0,
    };

    if (editingItem) {
      const updated = menuItems.map((item) => (item.id === editingItem.id ? formattedItem : item));
      updateItemsState(updated);
    } else {
      const updated = [formattedItem, ...menuItems];
      updateItemsState(updated);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      const updated = menuItems.filter((item) => item.id !== id);
      updateItemsState(updated);
    }
  };

  const toggleAvailability = (id: string) => {
    const updated = menuItems.map((item) =>
      item.id === id ? { ...item, is_available: !item.is_available } : item
    );
    updateItemsState(updated);
  };

  const toggleFeatured = (id: string) => {
    const updated = menuItems.map((item) =>
      item.id === id ? { ...item, is_featured: !item.is_featured } : item
    );
    updateItemsState(updated);
  };

  const toggleDietaryTag = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.dietary_tags.includes(tag);
      return {
        ...prev,
        dietary_tags: exists
          ? prev.dietary_tags.filter((t) => t !== tag)
          : [...prev.dietary_tags, tag],
      };
    });
  };

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>3D Menu & Dish Manager</span>
            {isDemo && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-extrabold uppercase">
                Demo Interactive Mode
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your 3D models, categories, pricing, calories, prep times, and dietary badges.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
        >
          + Add New 3D Dish
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex space-x-2 border-b border-gray-800 pb-3 overflow-x-auto">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {cat} ({menuItems.filter((i) => (cat === 'All' ? true : i.category === cat)).length})
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading 3D Menu Items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-gray-900 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-base">No menu items found in category "{selectedCategory}".</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-sm"
          >
            + Create New Dish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col justify-between shadow-xl hover:border-gray-700 transition"
            >
              {/* 3D Interactive Canvas Box */}
              <div className="p-3 relative">
                <FoodModelViewer
                  modelUrlGlb={item.model_url_glb}
                  modelUrlUsdz={item.model_url_usdz}
                  className="h-56 w-full rounded-xl"
                />

                {/* Badges Overlay */}
                <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
                  {item.is_veg ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-black border border-emerald-400">
                      🌱 VEG
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500 text-white border border-red-400">
                      🍗 NON-VEG
                    </span>
                  )}
                  {item.is_featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-black border border-amber-400">
                      ⭐ FEATURED
                    </span>
                  )}
                  {item.is_popular && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500 text-white border border-purple-400">
                      🔥 POPULAR
                    </span>
                  )}
                </div>
              </div>

              {/* Content Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    <span className="text-base font-extrabold text-amber-400">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">
                    {item.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-2.5">
                    <span>🔥 {item.calories} kcal</span>
                    <span>⏱ {item.preparation_time_mins} mins</span>
                    <span>⭐ {item.rating}</span>
                  </div>

                  {/* Dietary Tags */}
                  {item.dietary_tags && item.dietary_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.dietary_tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`flex items-center space-x-1.5 font-semibold ${
                      item.is_available ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.is_available ? 'bg-emerald-400' : 'bg-red-400'
                      }`}
                    ></span>
                    <span>{item.is_available ? 'Available' : 'Sold Out'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFeatured(item.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        item.is_featured
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {item.is_featured ? '★ Starred' : '☆ Feature'}
                    </button>
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit 3D Dish */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Edit 3D Dish' : 'Add New 3D Dish'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Preset 3D Model Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">
                  Select Preset 3D Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_3D_MODELS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, model_url_glb: preset.glb })}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                        formData.model_url_glb === preset.glb
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-xl">{preset.icon}</span>
                      <span className="text-xs font-semibold">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Preview Canvas */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Real-time 3D Model Preview
                </label>
                <FoodModelViewer
                  modelUrlGlb={formData.model_url_glb}
                  modelUrlUsdz={formData.model_url_usdz}
                  className="h-44 w-full rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Dish Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Signature Truffle Burger"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    value={formData.preparation_time_mins}
                    onChange={(e) => setFormData({ ...formData, preparation_time_mins: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 py-2 border-y border-gray-800 text-xs font-semibold">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_veg}
                    onChange={(e) => setFormData({ ...formData, is_veg: e.target.checked })}
                    className="rounded bg-gray-800 border-gray-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>🌱 Vegetarian Dish</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded bg-gray-800 border-gray-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>⭐ Mark as Featured</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="rounded bg-gray-800 border-gray-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>🔥 Mark as Popular / Best Seller</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, taste profile, chef commentary..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Ingredients (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="Wagyu beef, Brioche, Cheese, Aioli"
                    className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Allergens (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    placeholder="Gluten, Dairy, Nuts"
                    className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20"
                >
                  Save 3D Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
