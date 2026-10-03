import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  UtensilsCrossed,
  CreditCard,
  AlertCircle,
  Megaphone,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  Database,
  Cpu,
  Lock,
  Layers,
  Send,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Globe,
  Check,
  QrCode,
  Receipt,
  Wallet,
  Banknote,
  Shield,
  Calendar,
  Clock,
  Info,
  Wifi,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SpaceBackground from '../components/common/SpaceBackground';

const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [feeTab, setFeeTab] = useState('hostel'); // 'hostel' | 'pg' | 'mess' | 'payment-methods'

  const handleQuickDemo = async (email, password, redirectPath, roleName) => {
    setDemoLoading(roleName);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(redirectPath);
      }
    } finally {
      setDemoLoading('');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  const features = [
    {
      icon: Users,
      title: 'Student Dossier & Admissions',
      desc: 'Centralized directory for comprehensive academic courses, emergency guardians, room tenure, and resident status.',
      color: 'cyan',
    },
    {
      icon: BedDouble,
      title: 'Visual Bed Allocation Engine',
      desc: 'Automated occupancy counters, room capacity enforcement, bed availability indicators, and instant transfers.',
      color: 'purple',
    },
    {
      icon: UtensilsCrossed,
      title: '4-Meal Mess Operations',
      desc: 'Weekly 7-day meal schedules, dietary classifications (Veg/Non-Veg), nutritional calories, and meal attendance check-ins.',
      color: 'cyan',
    },
    {
      icon: CreditCard,
      title: 'Digital Invoicing & Fee Receipts',
      desc: 'Automated semester fee billing, overdue tracking, multi-channel payment options, and printable official receipts.',
      color: 'pink',
    },
    {
      icon: AlertCircle,
      title: 'Complaint Resolution Pipeline',
      desc: 'Student ticketing with priority levels, image attachments, staff assignments, and transparent status timelines.',
      color: 'purple',
    },
    {
      icon: Megaphone,
      title: 'Targeted Announcements',
      desc: 'Broadcast notices by hostel or audience with instant real-time notification bell alerts.',
      color: 'cyan',
    },
    {
      icon: BarChart3,
      title: 'Reports & Financial Analytics',
      desc: 'Visual dashboards with occupancy donut charts, monthly fee collection bars, and one-click CSV export.',
      color: 'pink',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      desc: 'Secure authentication with 2FA OTP verification and dedicated portals for Administrators, Wardens, and Students.',
      color: 'purple',
    },
  ];

  const galleryModules = [
    {
      title: 'Administrative Control Center',
      category: 'Admin Control Center',
      desc: 'Real-time KPI metrics, room occupancy ratios, financial collection summaries, and complaint velocity.',
      icon: BarChart3,
      highlight: 'Live MySQL Data',
    },
    {
      title: 'Interactive Bed & Room Manager',
      category: 'Accommodations',
      desc: 'Multi-floor room grid with bed capacity meters, gender allocation safeguards, and room transfers.',
      icon: BedDouble,
      highlight: 'Zero Overbooking Guard',
    },
    {
      title: 'Dining Schedule & Attendance',
      category: 'Mess Hall',
      desc: '7-day weekly menu planner with dietary categories, calories, and daily attendance records.',
      icon: UtensilsCrossed,
      highlight: '4 Meals Every Day',
    },
    {
      title: 'Digital Fee Ledger & Receipts',
      category: 'Finance Desk',
      desc: 'Automated invoice generation, payment status tracking, and printable transaction receipts.',
      icon: CreditCard,
      highlight: 'Official Receipts',
    },
    {
      title: 'Maintenance Ticket Timeline',
      category: 'Resident Care',
      desc: 'End-to-end status audit trail tracking issues from initial submission to technician resolution.',
      icon: AlertCircle,
      highlight: 'Chronological Audit',
    },
  ];

  const stats = [
    { label: 'Hostel Blocks', value: '4+', desc: 'Boys, Girls & PG Wings' },
    { label: 'Rooms Configured', value: '35+', desc: 'Single, Double & Deluxe' },
    { label: 'Bed Capacity', value: '200+', desc: 'Real-Time Allocation' },
    { label: 'Daily Meals', value: '4 Slots', desc: 'Breakfast to Dinner' },
    { label: 'Payment Success', value: '100%', desc: 'Instant Digital Receipts' },
  ];

  return (
    <div className="relative min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black">
      {/* Clean modern subtle background */}
      <SpaceBackground />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#070b19]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                Hostel <span className="text-cyan-400">Connect</span>
              </span>
              <span className="block text-[10px] tracking-widest text-zinc-400 uppercase font-semibold">
                Hostel & Mess Management
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-zinc-300">
            <Link to="/explore-rooms" className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-bold text-white">
              <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
              Rooms & PGs
            </Link>
            <Link to="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
            <Link to="/dining-info" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <UtensilsCrossed className="w-3.5 h-3.5 text-purple-400" />
              Mess & Dining
            </Link>
            <a href="#fee-structure" className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-semibold text-cyan-300">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              Fee Structure
            </a>
            <a href="#about-pg" className="hover:text-cyan-400 transition-colors">Hostel vs PG</a>
            <a href="#stats" className="hover:text-cyan-400 transition-colors">Metrics</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 hover:border-cyan-400/40 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(123,97,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#070b19]/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-5 space-y-3 text-sm">
            <Link to="/explore-rooms" onClick={() => setMobileMenuOpen(false)} className="block text-white font-bold hover:text-cyan-400">🏢 Explore Rooms & PGs</Link>
            <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-cyan-400">⚡ System Features</Link>
            <Link to="/dining-info" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-cyan-400">🍽️ Mess & 7-Day Dining</Link>
            <a href="#fee-structure" onClick={() => setMobileMenuOpen(false)} className="block text-cyan-400 font-semibold">💳 Fee Structure & Payments</a>
            <a href="#about-pg" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-cyan-400">Hostel vs PG</a>
            <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-cyan-400">Metrics</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-300 hover:text-cyan-400">Contact</a>
            <div className="pt-2 flex gap-2">
              <Link to="/login" className="flex-1 py-2 text-center text-xs font-bold bg-white/[0.06] rounded-xl border border-white/10">Sign In</Link>
              <Link to="/register" className="flex-1 py-2 text-center text-xs font-bold bg-cyan-500 text-black rounded-xl">Register</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - STRICTLY "Hostel & Mess Management" */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Campus & Residential Living Portal</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Hostel & Mess <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Management
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-zinc-300/90 max-w-2xl mx-auto leading-relaxed">
          The complete digital platform for student accommodation, real-time room occupancy, 4-meal daily dining logistics, transparent fee billing, and campus maintenance.
        </p>

        {/* Hero Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-[0_0_30px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Login to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#fee-structure"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 hover:border-cyan-400/40 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Fee Structure & Payment</span>
          </a>
          <Link
            to="/explore-rooms"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 border border-white/5 font-semibold text-sm transition-all"
          >
            Explore Rooms & PGs
          </Link>
        </div>

        {/* 1-Click Interactive Demo Login */}
        <div className="mt-14 max-w-3xl mx-auto p-5 rounded-3xl bg-[#0a0f26]/80 backdrop-blur-xl border border-cyan-500/20 shadow-[0_10px_40px_-10px_rgba(0,229,255,0.15)]">
          <div className="flex items-center justify-between mb-3 text-left">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                1-Click Quick Access Demo
              </span>
              <p className="text-[11px] text-zinc-400">Click any role below to authenticate directly with demo credentials:</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Ready to Test
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => handleQuickDemo('admin@hostelconnect.com', 'Admin@123', '/admin/dashboard', 'admin')}
              disabled={!!demoLoading}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-purple-500/15 to-purple-600/5 hover:from-purple-500/25 hover:to-purple-600/15 border border-purple-500/30 text-left transition-all hover:border-purple-400"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-1">
                <span>ADMIN PORTAL</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">admin@hostelconnect.com</p>
              <p className="text-[10px] text-zinc-400">Full institutional control</p>
            </button>

            <button
              onClick={() => handleQuickDemo('warden@hostelconnect.com', 'Warden@123', '/warden/dashboard', 'warden')}
              disabled={!!demoLoading}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-cyan-500/15 to-cyan-600/5 hover:from-cyan-500/25 hover:to-cyan-600/15 border border-cyan-500/30 text-left transition-all hover:border-cyan-400"
            >
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-1">
                <span>WARDEN PORTAL</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">warden@hostelconnect.com</p>
              <p className="text-[10px] text-zinc-400">Hostel & mess management</p>
            </button>

            <button
              onClick={() => handleQuickDemo('student@hostelconnect.com', 'Student@123', '/student/dashboard', 'student')}
              disabled={!!demoLoading}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-pink-500/15 to-pink-600/5 hover:from-pink-500/25 hover:to-pink-600/15 border border-pink-500/30 text-left transition-all hover:border-pink-400"
            >
              <div className="flex items-center justify-between text-xs font-bold text-pink-300 mb-1">
                <span>STUDENT PORTAL</span>
                <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">student@hostelconnect.com</p>
              <p className="text-[10px] text-zinc-400">Room, menu & fee portal</p>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Rooms & Luxury PGs Showcase */}
      <section id="rooms" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5" />
              Verified Accommodations
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Featured Rooms & Luxury PGs
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-2xl">
              Fully furnished accommodations with air conditioning, attached washrooms, high-speed WiFi, and 4 daily home-style meals included.
            </p>
          </div>
          <Link
            to="/explore-rooms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shrink-0"
          >
            <span>View All Rooms & PGs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Showcase Grid with Real Photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Deluxe Single PG */}
          <div className="rounded-3xl bg-[#0a0f26]/80 border border-white/10 overflow-hidden hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group">
            <div>
              <div className="relative h-52 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80"
                  alt="Single Deluxe PG Room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f26] via-transparent to-black/30" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white shadow-lg">
                  🏢 Luxury PG
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Available
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-black text-white">Single Deluxe PG Suite</h3>
                  <p className="text-[11px] text-zinc-300">Sunrise Executive PG for Men</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-zinc-400">Single Bed • Private Room</span>
                  <span className="text-base font-black text-cyan-400">₹12,000<span className="text-[10px] text-zinc-400">/mo</span></span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-300">
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Inverter AC</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Attached Bath</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ 100Mbps WiFi</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ 4 Meals Included</span>
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/explore-rooms"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold text-center block shadow-md"
              >
                Book or Inquire
              </Link>
            </div>
          </div>

          {/* Card 2: Double Sharing AC PG */}
          <div className="rounded-3xl bg-[#0a0f26]/80 border border-white/10 overflow-hidden hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group">
            <div>
              <div className="relative h-52 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
                  alt="Double Sharing AC Room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f26] via-transparent to-black/30" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white shadow-lg">
                  🏢 Luxury PG
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Available
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-black text-white">Double Sharing AC Room</h3>
                  <p className="text-[11px] text-zinc-300">Serene Living Luxury PG for Women</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-zinc-400">2 Beds • Twin Desks</span>
                  <span className="text-base font-black text-cyan-400">₹8,500<span className="text-[10px] text-zinc-400">/mo</span></span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-300">
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Split AC</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Daily Cleaning</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Geyser</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ 4 Meals</span>
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/explore-rooms"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold text-center block shadow-md"
              >
                Book or Inquire
              </Link>
            </div>
          </div>

          {/* Card 3: Campus Hostel Double */}
          <div className="rounded-3xl bg-[#0a0f26]/80 border border-white/10 overflow-hidden hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group">
            <div>
              <div className="relative h-52 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                  alt="Campus Hostel Room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f26] via-transparent to-black/30" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-500 text-black shadow-lg">
                  🎓 Campus Hostel
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Few Slots Left
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-black text-white">Aryabhata Campus Hall</h3>
                  <p className="text-[11px] text-zinc-300">University Campus Residency</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-zinc-400">Double Sharing • Study Hall</span>
                  <span className="text-base font-black text-cyan-400">₹35,000<span className="text-[10px] text-zinc-400">/sem</span></span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-300">
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Campus WiFi</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Attached Mess</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Biometric Entry</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">✓ Sports Area</span>
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/explore-rooms"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold text-center block shadow-md"
              >
                Book or Inquire
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BRAND NEW SECTION: PAYMENT & FEE STRUCTURE DETAILS */}
      {/* ============================================================ */}
      <section id="fee-structure" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Official Tariff & Payment Guide</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Transparent Fee Structure & Payment Details
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-300">
            Zero hidden charges. Clear, upfront breakdown of room accommodation, 4-meal daily dining, caution deposits, and instant online payment channels.
          </p>

          {/* Fee Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setFeeTab('hostel')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                feeTab === 'hostel'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              🎓 College Hostel Fees
            </button>
            <button
              onClick={() => setFeeTab('pg')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                feeTab === 'pg'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              🏢 PG Monthly Rentals
            </button>
            <button
              onClick={() => setFeeTab('mess')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                feeTab === 'mess'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              🍽️ 4-Meal Mess Tariff
            </button>
            <button
              onClick={() => setFeeTab('payment-methods')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                feeTab === 'payment-methods'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              💳 Payment Methods & Policy
            </button>
          </div>
        </div>

        {/* Tab Content 1: College Hostels */}
        {feeTab === 'hostel' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-white/10 hover:border-cyan-400/40 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Single Occupancy</span>
                <h3 className="text-xl font-black text-white mt-1">Single AC Deluxe</h3>
                <div className="mt-3 pb-3 border-b border-white/10">
                  <span className="text-2xl font-black text-cyan-400">₹45,000</span>
                  <span className="text-xs text-zinc-400"> / semester</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Attached Private Bathroom</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Individual AC & Geyser</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 100Mbps Wi-Fi & Twin Desks</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 4 Daily Meals Included</li>
                </ul>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all">
                <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-1">
                  Most Popular
                </div>
                <h3 className="text-xl font-black text-white">Double Sharing</h3>
                <div className="mt-3 pb-3 border-b border-white/10">
                  <span className="text-2xl font-black text-cyan-400">₹32,000</span>
                  <span className="text-xs text-zinc-400"> / semester</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Attached Washroom & Balcony</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Dedicated Study Table & Lockers</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> High-Speed Internet Access</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 4 Daily Meals Included</li>
                </ul>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-white/10 hover:border-cyan-400/40 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Triple Sharing</span>
                <h3 className="text-xl font-black text-white mt-1">Triple Standard</h3>
                <div className="mt-3 pb-3 border-b border-white/10">
                  <span className="text-2xl font-black text-cyan-400">₹24,000</span>
                  <span className="text-xs text-zinc-400"> / semester</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Spacious Ventilated Room</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Individual Cupboards</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Floor Shared Geyser Bathrooms</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 4 Daily Meals Included</li>
                </ul>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-white/10 hover:border-cyan-400/40 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Budget Friendly</span>
                <h3 className="text-xl font-black text-white mt-1">Four Sharing</h3>
                <div className="mt-3 pb-3 border-b border-white/10">
                  <span className="text-2xl font-black text-cyan-400">₹18,000</span>
                  <span className="text-xs text-zinc-400"> / semester</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Bunk Bed Setup with Desks</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Daily Housekeeping & Cleaning</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 24/7 Security & RO Water</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 4 Daily Meals Included</li>
                </ul>
              </div>
            </div>

            {/* University Additional Surcharges Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Refundable Caution Deposit:</strong> ₹5,000 (One-time, 100% refundable upon room handover).
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>
                  <strong>Campus Maintenance & Fiber Internet:</strong> ₹1,200 / semester.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: PG Monthly Rentals */}
        {feeTab === 'pg' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-[#0a0f26]/80 border border-white/10 hover:border-purple-400/40 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Private Living</span>
                <h3 className="text-xl font-black text-white mt-1">Single Deluxe PG Suite</h3>
                <div className="mt-3 pb-3 border-b border-white/10">
                  <span className="text-3xl font-black text-purple-400">₹12,000</span>
                  <span className="text-xs text-zinc-400"> / month</span>
                </div>
                <ul className="mt-4 space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Attached Private Bathroom with Geyser</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 1.5 Ton Split AC with Remote</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Refrigerator Access & Electric Kettle</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Daily Room Cleaning & Dusting</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 4 Home-Style Meals Every Day</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-[#0a0f26]/80 border border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_25px_rgba(123,97,255,0.15)] transition-all">
                <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
                  Best Value PG
                </div>
                <h3 className="text-xl font-black text-white">Double Sharing AC PG</h3>
                <div className="mt-3 pb-3 border-b border-white/10">
                  <span className="text-3xl font-black text-purple-400">₹8,500</span>
                  <span className="text-xs text-zinc-400"> / month</span>
                </div>
                <ul className="mt-4 space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Attached Balcony & Private Washroom</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> High-Speed 100Mbps Dedicated WiFi</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Semi-automatic Washing Machine Access</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Daily Housekeeping & Garbage Disposal</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 4 Meals (Veg & Non-Veg Days)</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-[#0a0f26]/80 border border-white/10 hover:border-purple-400/40 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Economy PG</span>
                <h3 className="text-xl font-black text-white mt-1">Triple Sharing PG</h3>
                <div className="mt-3 pb-3 border-b border-white/10">
                  <span className="text-3xl font-black text-purple-400">₹6,500</span>
                  <span className="text-xs text-zinc-400"> / month</span>
                </div>
                <ul className="mt-4 space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Attached Washroom with Hot Water</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Air Cooler & Ceiling Fans</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Individual Wardrobes with Digital Locks</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> RO Drinking Water on Every Floor</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 4 Daily Meals Included</li>
                </ul>
              </div>
            </div>

            {/* PG Terms Banner */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <strong>Zero Brokerage:</strong> Direct booking with 1-month advance security deposit (100% refundable).
              </span>
              <span className="text-zinc-400">Notice period for move out: 30 days.</span>
            </div>
          </div>
        )}

        {/* Tab Content 3: 4-Meal Mess Tariff */}
        {feeTab === 'mess' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
                  <Coffee className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Slot 1 • 07:30 - 09:30 AM</span>
                <h4 className="text-lg font-bold text-white mt-0.5">Healthy Breakfast</h4>
                <p className="text-xs text-zinc-300 mt-2">Dosa, Idli-Vada, Poori, Parathas, Boiled Eggs, Tea, Coffee & Fresh Juice.</p>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Included in Plan</span>
                  <span className="font-bold text-cyan-400">Guest: ₹50</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-3">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Slot 2 • 12:30 - 02:30 PM</span>
                <h4 className="text-lg font-bold text-white mt-0.5">Full Executive Lunch</h4>
                <p className="text-xs text-zinc-300 mt-2">Basmati Rice, Phulkas, Paneer / Chicken curry, Dal Tadka, Curd, Salad & Papad.</p>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Included in Plan</span>
                  <span className="font-bold text-cyan-400">Guest: ₹90</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-3">
                  <Cookie className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Slot 3 • 05:00 - 06:30 PM</span>
                <h4 className="text-lg font-bold text-white mt-0.5">Evening Snacks & Tea</h4>
                <p className="text-xs text-zinc-300 mt-2">Samosa, Pakoda, Poha, Cutlets, Biscuits with Ginger Masala Chai / Filter Coffee.</p>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Included in Plan</span>
                  <span className="font-bold text-cyan-400">Guest: ₹30</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Slot 4 • 07:30 - 09:45 PM</span>
                <h4 className="text-lg font-bold text-white mt-0.5">Wholesome Dinner</h4>
                <p className="text-xs text-zinc-300 mt-2">Rotis, Veg Pulao, Paneer Gravy / Egg Curry, Dal Makhani, Dessert / Ice Cream.</p>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Included in Plan</span>
                  <span className="font-bold text-cyan-400">Guest: ₹90</span>
                </div>
              </div>
            </div>

            {/* Standalone Mess Subscription Card */}
            <div className="p-6 rounded-3xl bg-[#0a0f26]/85 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">External / Day-Scholar Plan</span>
                <h3 className="text-xl font-black text-white mt-1">Standalone 4-Meal Mess Pass</h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                  Not staying in the hostel? Students and working professionals can subscribe to our nutritious 4-meal daily catering independently.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-3xl font-black text-cyan-400">₹3,800</span>
                <span className="text-xs text-zinc-400"> / month</span>
                <p className="text-[11px] text-zinc-400 mt-1">₹19,000 / full semester pass</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Payment Methods & Policy */}
        {feeTab === 'payment-methods' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Instant UPI & QR Code</h4>
                <p className="text-xs text-zinc-300 mt-2">
                  Scan dynamically generated UPI QR code using Google Pay, PhonePe, Paytm, or BHIM. Zero processing charges.
                </p>
                <div className="mt-4 pt-2 border-t border-white/10 text-[11px] text-cyan-400 font-semibold">
                  ⚡ 5-second instant receipt
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-purple-500/20 hover:border-purple-400/50 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Debit & Credit Cards</h4>
                <p className="text-xs text-zinc-300 mt-2">
                  Accepting Visa, MasterCard, RuPay, and Maestro. Protected with 256-bit bank-grade SSL and 3D OTP security.
                </p>
                <div className="mt-4 pt-2 border-t border-white/10 text-[11px] text-purple-300 font-semibold">
                  🔒 Encrypted gateway
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-pink-500/20 hover:border-pink-400/50 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Net Banking & NEFT</h4>
                <p className="text-xs text-zinc-300 mt-2">
                  Direct net-banking support for 50+ banks including SBI, HDFC, ICICI, Axis Bank, and Punjab National Bank.
                </p>
                <div className="mt-4 pt-2 border-t border-white/10 text-[11px] text-pink-300 font-semibold">
                  🏛️ All major banks
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#0a0f26]/80 border border-emerald-500/20 hover:border-emerald-400/50 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
                  <Banknote className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Hostel Office Cash Desk</h4>
                <p className="text-xs text-zinc-300 mt-2">
                  Physical fee submission at administrative desk. Cashier issues digital receipt stamped with unique invoice ID.
                </p>
                <div className="mt-4 pt-2 border-t border-white/10 text-[11px] text-emerald-400 font-semibold">
                  🧾 Printable official voucher
                </div>
              </div>
            </div>

            {/* Fee Policies & Due Dates */}
            <div className="p-6 rounded-3xl bg-[#0a0f26]/85 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase">Due Date Schedule</h5>
                  <p className="text-xs text-zinc-400 mt-1">
                    Semester fees are due within 15 days of term opening. Monthly PG rent is due by the 5th of each calendar month.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase">Grace Period & Late Fee</h5>
                  <p className="text-xs text-zinc-400 mt-1">
                    A generous 7-day grace period is provided. Afterward, a nominal late fee of ₹50/day applies to overdue balances.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Receipt className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white uppercase">Instant Digital Invoicing</h5>
                  <p className="text-xs text-zinc-400 mt-1">
                    Every transaction creates an unalterable digital receipt stored on MySQL, printable at any time from student portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">System Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            Comprehensive Hostel & Mess Features
          </h2>
          <p className="mt-3 text-sm text-zinc-300/80">
            Eight interconnected modules working synchronously to deliver a streamlined hostel experience for all stakeholders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-3xl bg-[#0a0f26]/60 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-5px_rgba(0,229,255,0.2)]"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                  f.color === 'cyan' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                  f.color === 'purple' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                  'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dual Accommodation System: Hostels & PGs Section */}
      <section id="about-pg" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">Dual Operational Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            Built for Both College Hostels & Modern PGs
          </h2>
          <p className="mt-3 text-sm text-zinc-300">
            Whether managing a multi-block university campus hostel or a network of private paying guest residences, Hostel Connect provides purpose-built workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: College & University Hostels */}
          <div className="p-8 rounded-3xl bg-[#0a0f26]/85 border border-cyan-500/25 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-400/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Institutional Tier
            </span>
            <h3 className="text-2xl font-black text-white mt-3">University & College Hostels</h3>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Designed for educational institutions managing hundreds of enrolled students across multiple campus blocks.
            </p>

            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Semester-Based Invoicing:</strong> Auto-bills accommodation, caution deposit, and mess fees per academic term.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Warden Approval Hierarchy:</strong> Multi-tiered permissions for room allocation, room switches, and gate leave passes.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Academic Department Integration:</strong> Organizes student dossiers by degree, batch year, and guardian contacts.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Biometric Dining Headcount:</strong> Prevents proxy meal claims with anti-duplicate meal verification.</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link
                to="/features"
                className="inline-flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 gap-1.5"
              >
                <span>Learn about university workflows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Private PGs & Co-Living Spaces */}
          <div className="p-8 rounded-3xl bg-[#0a0f26]/85 border border-purple-500/25 backdrop-blur-xl relative overflow-hidden group hover:border-purple-400/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
              <BedDouble className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Co-Living & Commercial Tier
            </span>
            <h3 className="text-2xl font-black text-white mt-3">Paying Guest (PG) Accommodations</h3>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Optimized for students and working professionals seeking flexible, fully-managed, high-comfort residential stays.
            </p>

            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>Flexible Monthly Rent Cycles:</strong> Automated monthly due dates with instant digital receipt generation.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>Zero Brokerage & Move-in Ease:</strong> Direct tenant onboarding with minimal security deposits and ID proof upload.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>4-Meal Home-Style Catering:</strong> Healthy breakfast, lunch, evening snacks & tea, and dinner included.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>Housekeeping & High-Speed Fiber:</strong> Scheduled room cleaning, laundry support, and 24/7 power backup.</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link
                to="/explore-rooms"
                className="inline-flex items-center text-xs font-bold text-purple-400 hover:text-purple-300 gap-1.5"
              >
                <span>Browse available PG accommodations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Project Gallery / Module Previews */}
      <section id="gallery" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-pink-400 tracking-widest uppercase">System Overview</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            Integrated Application Modules
          </h2>
          <p className="mt-3 text-sm text-zinc-300/80">
            Explore the specialized interfaces tailored for campus administrators, wardens, and student residents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryModules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#0a0f26]/80 border border-white/10 backdrop-blur-xl hover:border-cyan-400/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {m.highlight}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium">{m.category}</span>
                <h3 className="text-base font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                  {m.title}
                </h3>
                <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-purple-900/30 via-[#0a0f26]/80 to-cyan-900/30 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,229,255,0.15)]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {s.value}
                </span>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">{s.label}</h4>
                <p className="text-[11px] text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0a0f26]/80 border border-white/10 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,229,255,0.1)]">
          <div className="text-center max-w-md mx-auto mb-8">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Get in Touch</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Hostel & Mess Inquiries & Support
            </h2>
            <p className="mt-2 text-xs text-zinc-300">
              Have questions regarding admissions, room allotments, or fee schedules? Send us a message.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Message Sent Successfully</h4>
              <p className="text-xs text-emerald-300">Our hostel administration office will respond within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Arthur Mitchell"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050816] border border-white/10 text-white placeholder-zinc-500 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="student@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050816] border border-white/10 text-white placeholder-zinc-500 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Message</label>
                <textarea
                  rows="3"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How can we assist with your hostel and mess inquiry?"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050816] border border-white/10 text-white placeholder-zinc-500 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050816]/90 backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-black text-white uppercase tracking-wider block">
                Hostel <span className="text-cyan-400">Connect</span>
              </span>
              <span className="text-[10px] text-zinc-400 tracking-wider">Hostel & Mess Management</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 text-center">
            © {new Date().getFullYear()} Hostel Connect — Hostel & Mess Management System.
          </p>

          <div className="flex items-center space-x-6 text-xs text-zinc-400">
            <Link to="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
            <a href="#fee-structure" className="hover:text-cyan-400 transition-colors">Fee Structure</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
