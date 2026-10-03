import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  Filter,
  CheckCircle2,
  Search,
  Wifi,
  Wind,
  ShieldCheck,
  UtensilsCrossed,
  ArrowRight,
  Phone,
  Calendar,
  Sparkles,
  MapPin,
  X,
  Users
} from 'lucide-react';
import api from '../../services/api';
import SpaceBackground from '../../components/common/SpaceBackground';

const defaultRooms = [
  {
    id: 1,
    roomNumber: 'PG-101',
    category: 'pg',
    hostelName: 'Sunrise Executive PG for Men',
    roomType: 'Single Deluxe PG',
    capacity: 1,
    currentOccupancy: 1,
    status: 'Fully Occupied',
    pricePerSemester: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80',
    amenities: 'Attached Private Bathroom, Inverter AC, 100Mbps Fiber WiFi, Orthopedic Mattress, Wardrobe, Refrigerator Access, 3 Daily Meals',
    gender: 'Boys'
  },
  {
    id: 2,
    roomNumber: 'PG-102',
    category: 'pg',
    hostelName: 'Sunrise Executive PG for Men',
    roomType: 'Double Sharing AC',
    capacity: 2,
    currentOccupancy: 1,
    status: 'Available',
    pricePerSemester: 8500,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    amenities: 'Split AC, High-Speed WiFi, Individual Lockers, Attached Balcony, Geyser, Daily Housekeeping, Laundry Machine Access',
    gender: 'Boys'
  },
  {
    id: 3,
    roomNumber: 'SPG-101',
    category: 'pg',
    hostelName: 'Serene Living Luxury PG for Women',
    roomType: 'Single Deluxe PG',
    capacity: 1,
    currentOccupancy: 0,
    status: 'Available',
    pricePerSemester: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: 'Private En-Suite Bath, Split AC, Full-Length Mirror Wardrobe, High-Speed WiFi, Biometric Entry, CCTV Corridor, 4 Daily Meals',
    gender: 'Girls'
  },
  {
    id: 4,
    roomNumber: 'SPG-102',
    category: 'pg',
    hostelName: 'Serene Living Luxury PG for Women',
    roomType: 'Double Sharing AC',
    capacity: 2,
    currentOccupancy: 1,
    status: 'Available',
    pricePerSemester: 9000,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    amenities: 'Air Conditioning, Twin Study Desks, Attached Washroom with Geyser, Weekly Linen Wash, WiFi, Pure Veg / Non-Veg Meals',
    gender: 'Girls'
  },
  {
    id: 5,
    roomNumber: 'PG-201',
    category: 'pg',
    hostelName: 'Sunrise Executive PG for Men',
    roomType: 'Triple Sharing Economy',
    capacity: 3,
    currentOccupancy: 2,
    status: 'Available',
    pricePerSemester: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    amenities: 'Study Tables, High-Speed WiFi, Purified RO Drinking Water, 3-Tier Security, 3 Hot Meals, Power Backup',
    gender: 'Boys'
  },
  {
    id: 6,
    roomNumber: 'A-101',
    category: 'hostel',
    hostelName: 'Aryabhata Cyber Hall',
    roomType: 'Double Sharing',
    capacity: 2,
    currentOccupancy: 1,
    status: 'Available',
    pricePerSemester: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    amenities: 'High-Speed WiFi, Study Desks, Wardrobes, Daily Room Cleaning, 24/7 Power Backup, Mess Attached',
    gender: 'Boys'
  },
  {
    id: 7,
    roomNumber: 'K-201',
    category: 'hostel',
    hostelName: 'Kalpana Chawla Hall',
    roomType: 'Triple Sharing',
    capacity: 3,
    currentOccupancy: 2,
    status: 'Available',
    pricePerSemester: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    amenities: 'Campus WiFi, Study Tables, Wardrobe with Lock, Biometric Gate, Attached Mess, Indoor Games Lounge',
    gender: 'Girls'
  },
  {
    id: 8,
    roomNumber: 'PG-202',
    category: 'pg',
    hostelName: 'Sunrise Executive PG for Men',
    roomType: 'Executive Studio PG',
    capacity: 1,
    currentOccupancy: 0,
    status: 'Available',
    pricePerSemester: 14000,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: 'Private Balcony, Smart TV, AC, Kitchenette, Fiber WiFi, Washing Machine, Daily Deep Cleaning, Power Backup',
    gender: 'Boys'
  }
];

export default function ExploreRoomsPage() {
  const [rooms, setRooms] = useState(defaultRooms);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiryModal, setInquiryModal] = useState({ isOpen: false, room: null });
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', date: '' });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await api.get('/rooms');
        if (res.data?.success && res.data.data?.length > 0) {
          const apiRooms = res.data.data.map(r => ({
            id: r.id || r._id,
            roomNumber: r.roomNumber || r.room_number,
            category: r.category || (String(r.roomNumber).includes('PG') ? 'pg' : 'hostel'),
            hostelName: r.hostelName || r.hostel_name || 'Campus Accommodation',
            roomType: r.roomType || r.room_type || 'Double',
            capacity: r.capacity || 2,
            currentOccupancy: r.currentOccupancy || r.current_occupancy || 0,
            status: r.status || 'Available',
            pricePerSemester: r.pricePerSemester || r.price_per_semester || 8500,
            imageUrl: r.imageUrl || r.image_url || 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
            amenities: r.amenities || 'High-Speed WiFi, AC, Study Table, Wardrobe, Daily Cleaning',
            gender: r.hostelGender || r.hostel_gender || 'Co-ed'
          }));
          setRooms(apiRooms);
        }
      } catch (err) {
        console.log('Using default showcase rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesType = selectedType === 'all' || r.roomType.toLowerCase().includes(selectedType.toLowerCase());
    const matchesSearch = !searchQuery ||
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hostelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryModal({ isOpen: false, room: null });
      setInquiryForm({ name: '', phone: '', email: '', date: '' });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-white relative selection:bg-cyan-500 selection:text-black">
      <SpaceBackground />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#070b19]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-wider uppercase text-white">
                Hostel <span className="text-cyan-400">Connect</span>
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
                Hostel & PG Directory
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-zinc-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/explore-rooms" className="text-cyan-400">Explore Rooms & PGs</Link>
            <Link to="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
            <Link to="/dining-info" className="hover:text-cyan-400 transition-colors">Mess & Dining</Link>
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
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
          <BedDouble className="w-3.5 h-3.5" />
          Verified Accommodations
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto">
          Explore College Hostels & <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Luxury Paying Guest (PG) Rooms
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Filter through furnished Single, Double, Triple sharing, and Executive PG suites. All accommodations feature 24/7 security, high-speed WiFi, power backup, and home-style meals.
        </p>

        {/* Filter Controls Bar */}
        <div className="mt-8 p-4 rounded-2xl bg-[#0d132a]/80 backdrop-blur-xl border border-white/10 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search room, PG name, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 focus:border-cyan-400 text-white placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Toggle */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCategory === 'all' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory('pg')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCategory === 'pg' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                🏢 PGs Only
              </button>
              <button
                onClick={() => setSelectedCategory('hostel')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCategory === 'hostel' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                🎓 Hostels Only
              </button>
            </div>

            {/* Room Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-zinc-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all" className="bg-[#0a0e27]">All Room Types</option>
              <option value="Single" className="bg-[#0a0e27]">Single Rooms</option>
              <option value="Double" className="bg-[#0a0e27]">Double Sharing</option>
              <option value="Triple" className="bg-[#0a0e27]">Triple Sharing</option>
              <option value="Studio" className="bg-[#0a0e27]">Executive Studio</option>
            </select>
          </div>
        </div>
      </section>

      {/* Rooms Showcase Grid */}
      <section className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-zinc-400">
            Showing <span className="font-bold text-white">{filteredRooms.length}</span> verified accommodations
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Bed Inventory
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isPG = room.category === 'pg';
            const amenitiesList = typeof room.amenities === 'string'
              ? room.amenities.split(',').map(s => s.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={room.id}
                className="rounded-3xl bg-[#0a0f26]/85 border border-white/10 overflow-hidden hover:border-cyan-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Badges */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={room.roomNumber}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f26] via-transparent to-black/40" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPG ? 'bg-purple-600 text-white shadow-lg' : 'bg-cyan-500 text-black shadow-lg'
                      }`}>
                        {isPG ? 'Luxury PG' : 'Campus Hostel'}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10">
                        {room.gender}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        room.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : room.status === 'Partially Occupied'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {room.status}
                      </span>
                    </div>

                    {/* Room title & PG Name on Photo Bottom */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-black text-white drop-shadow">
                        Room {room.roomNumber} — {room.roomType}
                      </h3>
                      <p className="text-xs text-zinc-300 flex items-center gap-1 mt-0.5 drop-shadow">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {room.hostelName}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Capacity & Price Row */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>Capacity: <strong className="text-white">{room.capacity} Bed{room.capacity > 1 ? 's' : ''}</strong></span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-cyan-400">
                          ₹{Number(room.pricePerSemester).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-400 block -mt-1">
                          {isPG ? 'per month' : 'per semester'}
                        </span>
                      </div>
                    </div>

                    {/* Amenities Chips */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                        Included Amenities:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {amenitiesList.slice(0, 4).map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-white/[0.04] text-zinc-300 border border-white/10"
                          >
                            ✓ {a}
                          </span>
                        ))}
                        {amenitiesList.length > 4 && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                            +{amenitiesList.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setInquiryModal({ isOpen: true, room })}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Check Availability & Inquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PG & Hostel Guidelines Section */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0a0f26]/70 border border-white/10">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Zero Brokerage & Transparent Leases
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct booking with institution and PG operators. No middleman brokerage fees, fully refundable security deposits, and digital rental agreements.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0f26]/70 border border-white/10">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-purple-400" />
              Hygienic 4-Meal Dining Included
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every resident enjoys breakfast, lunch, evening tea with snacks, and wholesome dinner prepared in certified hygienic kitchens.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0f26]/70 border border-white/10">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Wind className="w-4 h-4 text-pink-400" />
              Housekeeping & Maintenance On-Demand
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Daily room cleaning, weekly linen change, and rapid ticket resolution for plumbing, electrical, and WiFi concerns.
            </p>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      {inquiryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0f26] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setInquiryModal({ isOpen: false, room: null })}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white">Inquire for Room {inquiryModal.room?.roomNumber}</h3>
            <p className="text-xs text-zinc-400 mt-1">
              {inquiryModal.room?.hostelName} — {inquiryModal.room?.roomType}
            </p>

            {inquirySubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-zinc-400">
                  The property warden/manager will contact you via phone or email within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Estimated Move-in Date</label>
                  <input
                    type="date"
                    value={inquiryForm.date}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setInquiryModal({ isOpen: false, room: null })}
                    className="flex-1 py-2 text-xs rounded-xl bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400 shadow-md"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
