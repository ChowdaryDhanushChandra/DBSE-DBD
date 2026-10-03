import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  UtensilsCrossed,
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import api from '../../services/api';
import SpaceBackground from '../../components/common/SpaceBackground';

const defaultWeeklyMenu = [
  { dayOfWeek: 'Monday', mealType: 'Breakfast', timing: '07:30 AM - 09:30 AM', calories: 480, category: 'Vegetarian', foodItems: ['Idli & Crispy Medu Vada', 'Fresh Coconut & Tomato Chutney', 'Hot Vegetable Sambar', 'Filter Coffee / Tea'] },
  { dayOfWeek: 'Monday', mealType: 'Lunch', timing: '12:30 PM - 02:30 PM', calories: 720, category: 'Both', foodItems: ['Steamed Basmati Rice', 'Phulka Rotis with Ghee', 'Paneer Butter Masala', 'Tadka Dal Fry', 'Mixed Green Salad', 'Papad & Curd'] },
  { dayOfWeek: 'Monday', mealType: 'Snacks', timing: '05:00 PM - 06:30 PM', calories: 280, category: 'Vegetarian', foodItems: ['Crispy Onion Pakoda', 'Green Mint Chutney', 'Special Masala Chai', 'Cookies'] },
  { dayOfWeek: 'Monday', mealType: 'Dinner', timing: '07:30 PM - 09:45 PM', calories: 650, category: 'Vegetarian', foodItems: ['Jeera Rice', 'Aloo Gobi Adraki', 'Dal Tadka', 'Chapati', 'Gulab Jamun (1 pc)', 'Warm Milk'] },

  { dayOfWeek: 'Tuesday', mealType: 'Breakfast', timing: '07:30 AM - 09:30 AM', calories: 510, category: 'Vegetarian', foodItems: ['Masala Dosa with Potato Roast', 'Sambar & Two Chutneys', 'Sprouted Moong Salad', 'Tea / Coffee / Milk'] },
  { dayOfWeek: 'Tuesday', mealType: 'Lunch', timing: '12:30 PM - 02:30 PM', calories: 740, category: 'Vegetarian', foodItems: ['Veg Dum Biryani', 'Boondi Raita', 'Chole Masala', 'Whole Wheat Bhature', 'Pickle & Papad'] },
  { dayOfWeek: 'Tuesday', mealType: 'Snacks', timing: '05:00 PM - 06:30 PM', calories: 260, category: 'Vegetarian', foodItems: ['Samosa (1 pc) with Sweet Chutney', 'Filter Coffee', 'Ginger Tea'] },
  { dayOfWeek: 'Tuesday', mealType: 'Dinner', timing: '07:30 PM - 09:45 PM', calories: 630, category: 'Vegetarian', foodItems: ['Steamed Rice', 'Methi Malai Mutter', 'Dal Makhani', 'Soft Rotis', 'Fresh Curd', 'Seasonal Fruit'] },

  { dayOfWeek: 'Wednesday', mealType: 'Breakfast', timing: '07:30 AM - 09:30 AM', calories: 490, category: 'Both', foodItems: ['Aloo Paratha with Butter', 'Curd & Mixed Pickle', 'Boiled Eggs / Omelette counter', 'Tea / Coffee'] },
  { dayOfWeek: 'Wednesday', mealType: 'Lunch', timing: '12:30 PM - 02:30 PM', calories: 780, category: 'Both', foodItems: ['White Rice', 'Chicken Curry (Special)', 'Kadhai Paneer (Veg Special)', 'Yellow Dal', 'Chapatis', 'Cucumber Salad'] },
  { dayOfWeek: 'Wednesday', mealType: 'Snacks', timing: '05:00 PM - 06:30 PM', calories: 270, category: 'Vegetarian', foodItems: ['Poha with Roasted Peanuts & Sev', 'Lemon Wedges', 'Special Elaichi Tea'] },
  { dayOfWeek: 'Wednesday', mealType: 'Dinner', timing: '07:30 PM - 09:45 PM', calories: 640, category: 'Vegetarian', foodItems: ['Veg Pulao', 'Rajma Masala (Punjabi style)', 'Phulkas', 'Raita', 'Ice Cream Cup'] },

  { dayOfWeek: 'Thursday', mealType: 'Breakfast', timing: '07:30 AM - 09:30 AM', calories: 470, category: 'Vegetarian', foodItems: ['Rava Upma & Kesari Bath', 'Coconut Chutney', 'Boiled Sprouts', 'Tea / Coffee'] },
  { dayOfWeek: 'Thursday', mealType: 'Lunch', timing: '12:30 PM - 02:30 PM', calories: 710, category: 'Vegetarian', foodItems: ['Lemon Rice & Plain Rice', 'Sambar & Rasam', 'Bhindi Fry', 'Chapatis', 'Curd & Crispy Appalam'] },
  { dayOfWeek: 'Thursday', mealType: 'Snacks', timing: '05:00 PM - 06:30 PM', calories: 250, category: 'Vegetarian', foodItems: ['Veg Sandwich / Bread Butter Jam', 'Cutting Chai', 'Coffee'] },
  { dayOfWeek: 'Thursday', mealType: 'Dinner', timing: '07:30 PM - 09:45 PM', calories: 620, category: 'Vegetarian', foodItems: ['Ghee Rice', 'Palak Paneer', 'Dal Fry', 'Tawa Roti', 'Semiya Payasam (Kheer)'] },

  { dayOfWeek: 'Friday', mealType: 'Breakfast', timing: '07:30 AM - 09:30 AM', calories: 520, category: 'Both', foodItems: ['Poori with Aloo Masala Curry', 'Halwa (Suji)', 'Boiled Eggs / Bananas', 'Tea / Coffee'] },
  { dayOfWeek: 'Friday', mealType: 'Lunch', timing: '12:30 PM - 02:30 PM', calories: 790, category: 'Both', foodItems: ['Hyderabadi Chicken Dum Biryani', 'Shahi Paneer Dum Biryani (Veg)', 'Mirchi Ka Salan', 'Onion Raita', 'Sweet Kheer'] },
  { dayOfWeek: 'Friday', mealType: 'Snacks', timing: '05:00 PM - 06:30 PM', calories: 290, category: 'Vegetarian', foodItems: ['Pani Puri / Bhel Puri Counter', 'Masala Tea', 'Cold Drink'] },
  { dayOfWeek: 'Friday', mealType: 'Dinner', timing: '07:30 PM - 09:45 PM', calories: 660, category: 'Vegetarian', foodItems: ['Jeera Rice', 'Mix Veg Kolhapuri', 'Dal Tadka', 'Butter Naan / Roti', 'Fruit Custard'] },

  { dayOfWeek: 'Saturday', mealType: 'Breakfast', timing: '08:00 AM - 10:00 AM', calories: 480, category: 'Vegetarian', foodItems: ['Uttapam with Onion & Tomato', 'Coconut Chutney & Sambar', 'Fresh Seasonal Fruits', 'Coffee / Tea'] },
  { dayOfWeek: 'Saturday', mealType: 'Lunch', timing: '12:30 PM - 02:30 PM', calories: 730, category: 'Vegetarian', foodItems: ['Curd Rice & Bisibelebath', 'Boondi / Potato Chips', 'Puri with Chana Masala', 'Green Salad'] },
  { dayOfWeek: 'Saturday', mealType: 'Snacks', timing: '05:00 PM - 06:30 PM', calories: 280, category: 'Vegetarian', foodItems: ['Veg Cutlets with Mint Sauce', 'Hot Filter Coffee', 'Assorted Biscuits'] },
  { dayOfWeek: 'Saturday', mealType: 'Dinner', timing: '07:30 PM - 09:45 PM', calories: 670, category: 'Both', foodItems: ['Fried Rice & Veg Manchurian', 'Egg Fried Rice (Optional)', 'Chilli Chicken Gravy (Optional)', 'Hot Garlic Naan', 'Sweet Rasgulla'] },

  { dayOfWeek: 'Sunday', mealType: 'Breakfast', timing: '08:00 AM - 10:30 AM', calories: 540, category: 'Both', foodItems: ['Sunday Special Masala Dosa', 'Bread Omelette / Butter Toast', 'Medu Vada & Sambar', 'Fresh Juice / Coffee'] },
  { dayOfWeek: 'Sunday', mealType: 'Lunch', timing: '12:30 PM - 03:00 PM', calories: 850, category: 'Both', foodItems: ['Special Sunday Feast Biryani', 'Chicken Curry / Butter Chicken', 'Mushroom & Paneer Butter Masala', 'Roomali Roti', 'Ice Cream Sundae'] },
  { dayOfWeek: 'Sunday', mealType: 'Snacks', timing: '05:00 PM - 06:30 PM', calories: 240, category: 'Vegetarian', foodItems: ['Sweet Corn Chaat / Sundal', 'Masala Tea', 'Cookies'] },
  { dayOfWeek: 'Sunday', mealType: 'Dinner', timing: '07:30 PM - 09:45 PM', calories: 610, category: 'Vegetarian', foodItems: ['Light Khichdi / Steamed Rice', 'Gujarati Kadhi', 'Aloo Methi Sukha', 'Phulkas', 'Warm Turmeric Milk'] }
];

export default function DiningPage() {
  const [menu, setMenu] = useState(defaultWeeklyMenu);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/mess/menu');
        if (res.data?.success && res.data.weekly?.length > 0) {
          setMenu(res.data.weekly);
          if (res.data.currentDay) {
            setSelectedDay(res.data.currentDay);
          }
        }
      } catch (err) {
        console.log('Using default weekly dining menu');
      }
    };
    fetchMenu();
  }, []);

  const dayMeals = menu.filter((m) => m.dayOfWeek === selectedDay);

  const getMealIcon = (type) => {
    switch (type) {
      case 'Breakfast': return Coffee;
      case 'Lunch': return Sun;
      case 'Snacks': return Cookie;
      default: return Moon;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-white relative selection:bg-cyan-500 selection:text-black">
      <SpaceBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#070b19]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-wider uppercase text-white">
                Hostel <span className="text-cyan-400">Connect</span>
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
                Dining Logistics
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-zinc-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/explore-rooms" className="hover:text-cyan-400 transition-colors">Explore Rooms & PGs</Link>
            <Link to="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
            <Link to="/dining-info" className="text-cyan-400">Mess & Dining</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          Nutritious 4-Meal Service
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto">
          Hygienic Dining Operations & <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            7-Day Rotational Chef Menus
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Nutritious, home-cooked food served four times daily. Certified FSSAI ingredients, separate pure vegetarian prep counters, and special Sunday feasts for all residents.
        </p>

        {/* Day Selector Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg scale-105'
                    : 'bg-white/[0.04] text-zinc-300 border border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4-Meal Cards Grid */}
      <section className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((mealType) => {
            const slot = dayMeals.find((m) => m.mealType === mealType);
            const items = Array.isArray(slot?.foodItems)
              ? slot.foodItems
              : typeof slot?.foodItems === 'string'
              ? slot.foodItems.split(',').map((s) => s.trim()).filter(Boolean)
              : [];
            const MealIcon = getMealIcon(mealType);

            return (
              <div
                key={mealType}
                className="p-6 rounded-3xl bg-[#0a0f26]/85 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                      <MealIcon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {slot?.calories || 500} kcal
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">{mealType}</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 mb-3">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {slot?.timing || 'Standard Timing'}
                  </p>

                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-4 ${
                    slot?.category === 'Non-Vegetarian'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : slot?.category === 'Both'
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {slot?.category || 'Vegetarian'}
                  </span>

                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      Menu Offerings:
                    </span>
                    {items.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-zinc-200">
                        {items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">Menu not configured for this slot.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hygiene & Food Standards */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Kitchen Health & Safety</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Our Quality & Hygiene Commitments
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0a0f26]/70 border border-white/10">
            <ShieldCheck className="w-6 h-6 text-cyan-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">FSSAI Certified Ingredients</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every grocery batch, dairy supply, and vegetable basket is sourced from certified grade-A suppliers with daily freshness checks.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0f26]/70 border border-white/10">
            <CheckCircle2 className="w-6 h-6 text-purple-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Separate Pure Veg Preparation</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Strict segregation of cookware, chopping boards, and cooking stations ensures authentic vegetarian purity and Jain options upon request.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0f26]/70 border border-white/10">
            <Clock className="w-6 h-6 text-pink-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">RO Water & Hot Water Sanitization</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cooking and drinking water is purified through an industrial multi-stage RO filter. All dining utensils undergo high-temp steam cleaning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
