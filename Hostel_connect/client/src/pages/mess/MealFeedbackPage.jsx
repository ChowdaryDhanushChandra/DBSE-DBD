import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Star,
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  MessageSquare,
  Sparkles,
  History,
  Send,
  Coffee,
  Sun,
  Moon,
  Cookie,
  User,
  Search,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import confetti from 'canvas-confetti';

const CRITERIA = [
  { key: 'tasteRating', label: 'Taste', desc: 'Flavor, seasoning & freshness' },
  { key: 'qualityRating', label: 'Quality', desc: 'Ingredients & overall standard' },
  { key: 'quantityRating', label: 'Quantity', desc: 'Portion size & availability' },
  { key: 'cleanlinessRating', label: 'Cleanliness', desc: 'Dining hall & serving hygiene' },
  { key: 'temperatureRating', label: 'Temperature', desc: 'Served adequately warm/fresh' },
];

const CATEGORIES = [
  'Good Taste',
  'Poor Taste',
  'Insufficient Quantity',
  'Food Too Cold',
  'Food Too Spicy',
  'Hygiene Issue',
  'Menu Suggestion',
];

const MEAL_ICONS = {
  Breakfast: Coffee,
  Lunch: Sun,
  Snacks: Cookie,
  Dinner: Moon,
};

const MealFeedbackPage = () => {
  const { user, isStudent, isAdmin, isWarden } = useAuth();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history' | 'all'
  const [loading, setLoading] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [date, setDate] = useState('');
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Ratings form state
  const [ratings, setRatings] = useState({
    tasteRating: 5,
    qualityRating: 5,
    quantityRating: 5,
    cleanlinessRating: 5,
    temperatureRating: 5,
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // History & Admin states
  const [myHistory, setMyHistory] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminMealFilter, setAdminMealFilter] = useState('');

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mess-feedback/today');
      if (res.data.success) {
        setDayOfWeek(res.data.dayOfWeek);
        setDate(res.data.date);
        setMeals(res.data.meals);
        // Default select first meal
        if (res.data.meals.length > 0 && !selectedMeal) {
          setSelectedMeal(res.data.meals[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load today meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHistory = async () => {
    if (!isStudent) return;
    try {
      const res = await api.get('/mess-feedback/my');
      if (res.data.success) {
        setMyHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllFeedback = async () => {
    if (!isAdmin && !isWarden) return;
    try {
      const res = await api.get('/mess-feedback/analytics');
      if (res.data.success) {
        setAllFeedback(res.data.data.recentFeedback || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodayData();
    if (isStudent) fetchMyHistory();
    if (isAdmin || isWarden) fetchAllFeedback();
  }, []);

  const handleSelectMeal = (meal) => {
    setSelectedMeal(meal);
    setSubmitSuccess(false);
    // If meal was already submitted, reset or preserve ratings view
    if (meal.hasSubmitted && meal.myFeedback) {
      setRatings({
        tasteRating: meal.myFeedback.tasteRating,
        qualityRating: meal.myFeedback.qualityRating,
        quantityRating: meal.myFeedback.quantityRating,
        cleanlinessRating: meal.myFeedback.cleanlinessRating,
        temperatureRating: meal.myFeedback.temperatureRating,
      });
      setSelectedCategories(meal.myFeedback.categories || []);
      setComments(meal.myFeedback.comments || '');
    } else {
      setRatings({
        tasteRating: 5,
        qualityRating: 5,
        quantityRating: 5,
        cleanlinessRating: 5,
        temperatureRating: 5,
      });
      setSelectedCategories([]);
      setComments('');
    }
  };

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const currentOverallRating = (
    Object.values(ratings).reduce((acc, curr) => acc + Number(curr), 0) / 5
  ).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMeal) return;

    setSubmitting(true);
    try {
      const payload = {
        mealId: selectedMeal.mealId,
        mealType: selectedMeal.mealType,
        tasteRating: ratings.tasteRating,
        qualityRating: ratings.qualityRating,
        quantityRating: ratings.quantityRating,
        cleanlinessRating: ratings.cleanlinessRating,
        temperatureRating: ratings.temperatureRating,
        comments,
        feedbackCategories: selectedCategories,
      };

      const res = await api.post('/mess-feedback', payload);
      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setSubmitSuccess(true);
        // Refresh data
        await fetchTodayData();
        if (isStudent) await fetchMyHistory();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered all feedback for admin/warden
  const filteredAllFeedback = allFeedback.filter((item) => {
    const matchesMeal = !adminMealFilter || item.mealType === adminMealFilter;
    const matchesSearch =
      !adminSearch ||
      item.studentName?.toLowerCase().includes(adminSearch.toLowerCase()) ||
      item.comments?.toLowerCase().includes(adminSearch.toLowerCase()) ||
      item.roomNumber?.toString().includes(adminSearch);
    return matchesMeal && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Dining Quality Assurance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UtensilsCrossed className="w-6 h-6" />
            </span>
            Mess Meal Feedback
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Rate today's meals, give direct feedback to mess management, and maintain food excellence
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#070D22] p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today's Meals
          </button>
          {isStudent && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              My Feedback ({myHistory.length})
            </button>
          )}
          {(isAdmin || isWarden) && (
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Resident Feedback
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading dining operations..." />
      ) : activeTab === 'today' ? (
        <div className="space-y-6">
          {/* Day & Date Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#070D22]/80 border border-cyan-500/20 shadow-glass">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Menu for {dayOfWeek}
                </p>
                <p className="text-xs text-zinc-400">{date}</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
              4 Daily Meal Cycles
            </span>
          </div>

          {/* 4 Meal Selection Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {meals.map((m) => {
              const Icon = MEAL_ICONS[m.mealType] || UtensilsCrossed;
              const isSelected = selectedMeal?.mealType === m.mealType;
              return (
                <button
                  key={m.mealType}
                  onClick={() => handleSelectMeal(m)}
                  className={`p-4 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0f1738] to-[#070b19] border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                      : 'bg-[#070D22]/80 border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-white/[0.05] text-zinc-400 group-hover:text-cyan-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {m.hasSubmitted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Rated
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Open
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white">{m.mealType}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{m.timing}</p>
                </button>
              );
            })}
          </div>

          {/* Selected Meal Details & Feedback Form */}
          {selectedMeal && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Today's Menu Items */}
              <div className="p-6 rounded-3xl bg-[#070D22]/80 border border-white/10 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      {selectedMeal.mealType} Menu
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {selectedMeal.calories} kcal
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2">
                    Today's Serving Items
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Timings: {selectedMeal.timing} • Category: {selectedMeal.category}
                  </p>

                  <ul className="space-y-2.5">
                    {selectedMeal.foodItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 text-xs text-zinc-200 bg-white/[0.03] p-2.5 rounded-xl border border-white/5"
                      >
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        <span className="font-semibold">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-zinc-400">
                  Meal prepared fresh by Central Campus Mess Team.
                </div>
              </div>

              {/* Right Column: Rating Form or Confirmation */}
              <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#0a0f26]/90 border border-cyan-500/20 backdrop-blur-xl shadow-glass">
                {selectedMeal.hasSubmitted || submitSuccess ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">
                        Feedback Recorded!
                      </h3>
                      <p className="text-xs text-emerald-300 mt-1">
                        You rated today's {selectedMeal.mealType} ⭐{' '}
                        {selectedMeal.myFeedback?.overallRating || currentOverallRating}/5.0
                      </p>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2">
                        To maintain integrity, duplicate feedback for the same meal is locked. Your feedback has been forwarded to the hostel warden.
                      </p>
                    </div>

                    {/* Submitted details review */}
                    <div className="max-w-md mx-auto p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2 mt-4">
                      <div className="flex justify-between text-zinc-300">
                        <span>Taste: ⭐ {ratings.tasteRating}/5</span>
                        <span>Quality: ⭐ {ratings.qualityRating}/5</span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>Quantity: ⭐ {ratings.quantityRating}/5</span>
                        <span>Hygiene: ⭐ {ratings.cleanlinessRating}/5</span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>Temperature: ⭐ {ratings.temperatureRating}/5</span>
                        <span className="font-bold text-cyan-400">
                          Average: {currentOverallRating}/5.0
                        </span>
                      </div>
                      {comments && (
                        <p className="pt-2 border-t border-white/10 text-zinc-300 italic">
                          "{comments}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : !isStudent ? (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    <MessageSquare className="w-10 h-10 mx-auto text-zinc-500 mb-2" />
                    Resident meal feedback can be submitted by students. As an administrator/warden, view the "All Resident Feedback" tab or Mess Analytics.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
                      <div>
                        <h3 className="text-lg font-black text-white">
                          Rate {selectedMeal.mealType}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Rate each factor from 1 (Poor) to 5 (Outstanding)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-[#050816] px-4 py-2 rounded-2xl border border-cyan-500/30">
                        <span className="text-xs text-zinc-400 font-bold uppercase">Overall</span>
                        <span className="text-lg font-black text-cyan-300">
                          ⭐ {currentOverallRating} / 5
                        </span>
                      </div>
                    </div>

                    {/* 5 Rating Criteria */}
                    <div className="space-y-4">
                      {CRITERIA.map((crit) => (
                        <div
                          key={crit.key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 gap-2"
                        >
                          <div>
                            <span className="text-xs font-bold text-white">{crit.label}</span>
                            <p className="text-[11px] text-zinc-400">{crit.desc}</p>
                          </div>

                          <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatings({ ...ratings, [crit.key]: star })}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= ratings[crit.key]
                                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                                      : 'text-zinc-600'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-zinc-300 w-6 text-right">
                              {ratings[crit.key]}/5
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Feedback Category Chips */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-2">
                        Quick Feedback Tags (Select all that apply)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                          const isSelected = selectedCategories.includes(cat);
                          return (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => toggleCategory(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                                  : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] border border-white/10'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Written Comments */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        Written Remarks / Specific Suggestions (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="e.g. Sambar was excellent. Please keep rotis warmer in thermal containers."
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#050816] border border-white/10 text-white placeholder-zinc-500 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-neon-cyan flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting...' : `Submit ${selectedMeal.mealType} Feedback`}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'history' ? (
        /* Student Previous Feedback History */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">Your Past Submissions</h3>
            <span className="text-xs text-zinc-400">{myHistory.length} total entries</span>
          </div>

          {myHistory.length === 0 ? (
            <EmptyState
              icon={History}
              title="No previous feedback"
              description="You have not submitted feedback for any meals yet. Rate today's meal!"
              actionText="Rate Today's Meal"
              onAction={() => setActiveTab('today')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myHistory.map((fb) => (
                <div
                  key={fb.id}
                  className="p-5 rounded-3xl bg-[#070D22]/80 border border-white/10 hover:border-cyan-500/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-white px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10">
                        {fb.mealType}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(fb.mealDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-300 flex items-center gap-1">
                      ⭐ {fb.overallRating?.toFixed(1)} / 5
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-[10px] text-zinc-400 bg-white/[0.02] p-2 rounded-xl border border-white/5 text-center">
                    <div>Taste: {fb.tasteRating}★</div>
                    <div>Quality: {fb.qualityRating}★</div>
                    <div>Qty: {fb.quantityRating}★</div>
                    <div>Hygiene: {fb.cleanlinessRating}★</div>
                    <div>Temp: {fb.temperatureRating}★</div>
                  </div>

                  {fb.categories && fb.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {fb.categories.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {fb.comments && (
                    <p className="text-xs text-zinc-300 italic bg-white/[0.01] p-2 rounded-xl">
                      "{fb.comments}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Admin/Warden All Feedback List */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070D22]/80 p-4 rounded-2xl border border-white/10">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, room #, remarks..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#050816] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={adminMealFilter}
                onChange={(e) => setAdminMealFilter(e.target.value)}
                className="px-3 py-2 bg-[#050816] border border-white/10 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-cyan-400"
              >
                <option value="">All Meals</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Snacks</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
          </div>

          {filteredAllFeedback.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No feedback matching filter"
              description="Adjust search query or meal type filter."
            />
          ) : (
            <div className="bg-[#070D22]/80 rounded-2xl border border-white/10 overflow-hidden shadow-glass">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#050816] text-cyan-300 uppercase tracking-wider text-[11px] border-b border-white/10 font-bold">
                    <tr>
                      <th className="px-5 py-3.5">Student</th>
                      <th className="px-5 py-3.5">Meal / Date</th>
                      <th className="px-5 py-3.5">Scores</th>
                      <th className="px-5 py-3.5">Overall</th>
                      <th className="px-5 py-3.5">Tags & Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAllFeedback.map((fb) => (
                      <tr key={fb.id} className="hover:bg-cyan-500/5 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">
                          <p>{fb.studentName}</p>
                          <p className="text-[11px] text-zinc-400 font-normal">
                            Room {fb.roomNumber} • {fb.rollNumber}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-zinc-200">{fb.mealType}</span>
                          <p className="text-[10px] text-zinc-400">
                            {new Date(fb.mealDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-zinc-300">
                          T:{fb.tasteRating} | Q:{fb.qualityRating} | Qty:{fb.quantityRating} | H:{fb.cleanlinessRating} | Temp:{fb.temperatureRating}
                        </td>
                        <td className="px-5 py-3.5 font-black text-amber-300">
                          ⭐ {fb.overallRating?.toFixed(1)}/5
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          {fb.categories && fb.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {fb.categories.map((c, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                          {fb.comments && (
                            <p className="text-[11px] text-zinc-300 truncate" title={fb.comments}>
                              "{fb.comments}"
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealFeedbackPage;
