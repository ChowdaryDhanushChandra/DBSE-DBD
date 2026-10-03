import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Flame,
  Plus,
  Edit2,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const MessMenuPage = () => {
  const { isAdmin, isWarden } = useAuth();
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [currentDay, setCurrentDay] = useState('Monday');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [menuModal, setMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    dayOfWeek: 'Monday',
    mealType: 'Breakfast',
    foodItems: '',
    category: 'Vegetarian',
    calories: 500,
    timing: '07:30 AM - 09:30 AM',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mess/menu');
      if (res.data.success) {
        setWeeklyMenu(res.data.weekly);
        if (res.data.currentDay) {
          setCurrentDay(res.data.currentDay);
          setSelectedDay(res.data.currentDay);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleOpenEdit = (mealType) => {
    const existing = weeklyMenu.find((m) => m.dayOfWeek === selectedDay && m.mealType === mealType);
    let itemsStr = '';
    if (existing) {
      if (Array.isArray(existing.foodItems)) {
        itemsStr = existing.foodItems.join(', ');
      } else if (typeof existing.foodItems === 'string') {
        itemsStr = existing.foodItems;
      }
    }
    setMenuForm({
      dayOfWeek: selectedDay,
      mealType,
      foodItems: itemsStr,
      category: existing ? existing.category : 'Vegetarian',
      calories: existing ? existing.calories : 500,
      timing: existing
        ? existing.timing
        : mealType === 'Breakfast'
        ? '07:30 AM - 09:30 AM'
        : mealType === 'Lunch'
        ? '12:30 PM - 02:30 PM'
        : '07:30 PM - 09:45 PM',
      description: existing ? existing.description : '',
    });
    setMenuModal(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/mess/menu', {
        ...menuForm,
        foodItems: menuForm.foodItems.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setMenuModal(false);
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update menu');
    } finally {
      setSubmitting(false);
    }
  };

  const dayMeals = weeklyMenu.filter((m) => m.dayOfWeek === selectedDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UtensilsCrossed className="w-6 h-6" />
            </span>
            Weekly Mess Menu
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Institutional dining schedule, dietary nutrition, and daily meal plans
          </p>
        </div>

        {(isAdmin || isWarden) && (
          <button
            onClick={() => handleOpenEdit('Breakfast')}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Update Meal Plan
          </button>
        )}
      </div>

      {/* Days Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-cyan-500/10 pb-2">
        {days.map((day) => {
          const isToday = day === currentDay;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-neon-cyan'
                  : 'bg-[#070D22]/80 text-zinc-400 hover:bg-cyan-500/10 hover:text-cyan-300 border border-cyan-500/15'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                    isSelected ? 'bg-white text-purple-900' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Meal Cards Grid */}
      {loading ? (
        <LoadingSpinner size="md" message="Loading meal schedule..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
            const slot = dayMeals.find((m) => m.mealType === mealType);
            const items = Array.isArray(slot?.foodItems)
              ? slot.foodItems
              : typeof slot?.foodItems === 'string'
              ? slot.foodItems.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={mealType}
                className="bg-[#070D22]/80 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/15 shadow-glass flex flex-col justify-between hover:border-cyan-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">{mealType}</h3>
                        <p className="text-[11px] text-zinc-400 flex items-center mt-0.5">
                          <Clock className="w-3 h-3 mr-1 text-cyan-400/70" />
                          {slot?.timing || 'Standard Timing'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#050816] text-amber-400 border border-amber-500/30 flex items-center shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                      <Flame className="w-3 h-3 mr-1 text-amber-400" />
                      {slot?.calories || 500} kcal
                    </span>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        slot?.category === 'Non-Vegetarian'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : slot?.category === 'Both'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {slot?.category || 'Vegetarian'}
                    </span>
                  </div>

                  {slot?.description && (
                    <p className="text-xs text-zinc-400 italic mb-4">{slot.description}</p>
                  )}

                  {/* Food Items */}
                  <div className="space-y-2 border-t border-cyan-500/10 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
                      Menu Offerings
                    </p>
                    {items.length > 0 ? (
                      <ul className="space-y-2 text-xs text-zinc-300">
                        {items.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
                            <span className="font-semibold">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No menu registered for this slot.</p>
                    )}
                  </div>
                </div>

                {(isAdmin || isWarden) && (
                  <div className="mt-6 pt-3 border-t border-cyan-500/10 flex justify-end">
                    <button
                      onClick={() => handleOpenEdit(mealType)}
                      className="inline-flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit Slot
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Menu Modal */}
      <Modal
        isOpen={menuModal}
        onClose={() => setMenuModal(false)}
        title={`Plan ${menuForm.mealType} (${menuForm.dayOfWeek})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleMenuSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Day of Week</label>
              <select
                value={menuForm.dayOfWeek}
                onChange={(e) => setMenuForm({ ...menuForm, dayOfWeek: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Meal Type</label>
              <select
                value={menuForm.mealType}
                onChange={(e) => setMenuForm({ ...menuForm, mealType: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Special">Special Feast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">
              Food Items (comma-separated) *
            </label>
            <textarea
              rows="3"
              required
              value={menuForm.foodItems}
              onChange={(e) => setMenuForm({ ...menuForm, foodItems: e.target.value })}
              placeholder="e.g. Idli & Sambar, Coconut Chutney, Filter Coffee, Boiled Eggs"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Category</label>
              <select
                value={menuForm.category}
                onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white rounded-xl font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Both">Both Veg & Non-Veg</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Estimated Calories (kcal)</label>
              <input
                type="number"
                value={menuForm.calories}
                onChange={(e) => setMenuForm({ ...menuForm, calories: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Serving Timings</label>
            <input
              type="text"
              value={menuForm.timing}
              onChange={(e) => setMenuForm({ ...menuForm, timing: e.target.value })}
              placeholder="e.g. 07:30 AM - 09:30 AM"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">Description / Chef Note</label>
            <input
              type="text"
              value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              placeholder="e.g. High protein breakfast with fresh fruit"
              className="w-full px-3 py-2 bg-[#050816] border border-cyan-500/20 text-white placeholder-zinc-500 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-cyan-500/10">
            <button
              type="button"
              onClick={() => setMenuModal(false)}
              className="px-4 py-2 bg-[#050816] hover:bg-zinc-800 rounded-xl font-semibold text-zinc-300 border border-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-neon-cyan disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : 'Save Menu'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MessMenuPage;
