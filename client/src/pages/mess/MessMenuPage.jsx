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
    setMenuForm({
      dayOfWeek: selectedDay,
      mealType,
      foodItems: existing ? existing.foodItems.join(', ') : '',
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Weekly Mess Menu</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Institutional dining schedule, dietary nutrition, and daily meal plans
          </p>
        </div>

        {(isAdmin || isWarden) && (
          <button
            onClick={() => handleOpenEdit('Breakfast')}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Update Meal Plan
          </button>
        )}
      </div>

      {/* Days Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {days.map((day) => {
          const isToday = day === currentDay;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                    isSelected ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
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
            return (
              <div
                key={mealType}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{mealType}</h3>
                        <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {slot?.timing || 'Standard Timing'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center">
                      <Flame className="w-3 h-3 mr-1 text-amber-500" />
                      {slot?.calories || 500} kcal
                    </span>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        slot?.category === 'Non-Vegetarian'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : slot?.category === 'Both'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {slot?.category || 'Vegetarian'}
                    </span>
                  </div>

                  {slot?.description && (
                    <p className="text-xs text-slate-500 italic mb-4">{slot.description}</p>
                  )}

                  {/* Food Items */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Menu Offerings
                    </p>
                    {slot?.foodItems && slot.foodItems.length > 0 ? (
                      <ul className="space-y-2 text-xs text-slate-700">
                        {slot.foodItems.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            <span className="font-semibold">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No menu registered for this slot.</p>
                    )}
                  </div>
                </div>

                {(isAdmin || isWarden) && (
                  <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleOpenEdit(mealType)}
                      className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700"
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
              <label className="block font-bold text-slate-700 mb-1">Day of Week</label>
              <select
                value={menuForm.dayOfWeek}
                onChange={(e) => setMenuForm({ ...menuForm, dayOfWeek: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Meal Type</label>
              <select
                value={menuForm.mealType}
                onChange={(e) => setMenuForm({ ...menuForm, mealType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Special">Special Feast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Food Items (comma-separated) *
            </label>
            <textarea
              rows="3"
              required
              value={menuForm.foodItems}
              onChange={(e) => setMenuForm({ ...menuForm, foodItems: e.target.value })}
              placeholder="e.g. Idli & Sambar, Coconut Chutney, Filter Coffee, Boiled Eggs"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={menuForm.category}
                onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Both">Both Veg & Non-Veg</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Calories (kcal)</label>
              <input
                type="number"
                value={menuForm.calories}
                onChange={(e) => setMenuForm({ ...menuForm, calories: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Serving Timings</label>
            <input
              type="text"
              value={menuForm.timing}
              onChange={(e) => setMenuForm({ ...menuForm, timing: e.target.value })}
              placeholder="e.g. 07:30 AM - 09:30 AM"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Chef Note</label>
            <input
              type="text"
              value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              placeholder="e.g. High protein breakfast with fresh fruit"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMenuModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
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
