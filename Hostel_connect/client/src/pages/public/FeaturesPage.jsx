import React from 'react';
import { Link } from 'react-router-dom';
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
  FileCheck,
  Clock,
  Key
} from 'lucide-react';
import SpaceBackground from '../../components/common/SpaceBackground';

export default function FeaturesPage() {
  const capabilities = [
    {
      icon: BedDouble,
      title: 'Smart Room & Bed Allocation Engine',
      category: 'Accommodations',
      color: 'cyan',
      description: 'Automated bed capacity enforcement preventing double bookings. Supports multi-floor allocation, room transfers, room type classification (Single, Double, Triple, Deluxe PG), and live visual occupancy gauges.',
      highlights: ['Zero-overbooking database guards', 'AC and Non-AC room tagging', 'Automated vacancy detection', 'Room transfer audit history']
    },
    {
      icon: UtensilsCrossed,
      title: '4-Meal Daily Dining & Mess Logistics',
      category: 'Dining & Kitchen',
      color: 'purple',
      description: 'Weekly 7-day rotational menu management spanning Breakfast, Lunch, Evening Snacks, and Dinner. Includes dietary tagging (Pure Veg, Non-Veg, Jain), nutritional calories, and daily biometric/manual meal check-ins.',
      highlights: ['Breakfast, Lunch, Snacks & Dinner slots', 'Real-time dining headcount attendance', 'Weekly rotational chef menus', 'Nutritional calories & allergens']
    },
    {
      icon: CreditCard,
      title: 'Automated Billing & Digital Official Receipts',
      category: 'Finance Desk',
      color: 'pink',
      description: 'Semester and monthly fee scheduling with automated invoice generation, itemized fee breakdowns (Room rent, Mess fee, Caution deposit, Maintenance), overdue tracking, and printable cryptographic receipt vouchers.',
      highlights: ['Automated recurring invoicing', 'Printable verified receipts with QR', 'Flexible payment status tracking', 'Line-item financial breakdown']
    },
    {
      icon: AlertCircle,
      title: 'Maintenance Grievance & Ticketing Pipeline',
      category: 'Student & Resident Care',
      color: 'purple',
      description: 'Comprehensive ticketing system for plumbing, electrical, WiFi, carpentry, and housekeeping issues. Residents submit tickets with priority flags; wardens assign technicians and track chronological progress.',
      highlights: ['Emergency, High, Medium, Low priorities', 'Chronological status audit trail', 'Warden staff assignments', 'Resolution time tracking']
    },
    {
      icon: Megaphone,
      title: 'Targeted Campus & Resident Announcements',
      category: 'Broadcast Communications',
      color: 'cyan',
      description: 'Broadcast notices to specific hostels, PGs, or roles. Features high-priority sticky pinning, expiration dates, and immediate real-time dashboard notification alerts.',
      highlights: ['Target by Hostel or Role', 'Important notice pinning', 'Real-time alert delivery', 'Archived announcements log']
    },
    {
      icon: FileCheck,
      title: 'Compliance Document & Identity Vault',
      category: 'Administration',
      color: 'pink',
      description: 'Secure digital repository for resident compliance files, student ID proofs, guardian declarations, and rental agreements. Wardens review and approve or reject submissions with feedback notes.',
      highlights: ['Direct file uploads with Multer', 'Staff verification & approval workflow', 'Encrypted resident dossiers', 'Downloadable audit copies']
    },
    {
      icon: BarChart3,
      title: 'Executive Analytics & Telemetry Desk',
      category: 'Reporting & Insights',
      color: 'cyan',
      description: 'Visual business intelligence for hostel directors and PG managers. Real-time occupancy donut charts, monthly fee collection area graphs, complaint resolution metrics, and one-click CSV export.',
      highlights: ['Live bed utilization rates', 'Monthly fee collection versus dues', 'Grievance resolution velocity', 'One-click CSV data export']
    },
    {
      icon: Key,
      title: 'Enterprise Security & Two-Factor OTP RBAC',
      category: 'Platform Security',
      color: 'purple',
      description: 'State-of-the-art authentication with 6-digit OTP verification for Administrators and Wardens, salted Bcrypt password hashing, and strict role-based access control protecting student privacy.',
      highlights: ['2FA OTP verification for staff', 'Cryptographic JWT session tokens', 'Strict role-based route protection', 'Normalized MySQL 8.0 ACID storage']
    }
  ];

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
                System Features
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-zinc-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/explore-rooms" className="hover:text-cyan-400 transition-colors">Explore Rooms & PGs</Link>
            <Link to="/features" className="text-cyan-400">Features</Link>
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
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise Platform Capabilities
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto">
          The Complete Management Suite for <br />
          <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Hostels & Paying Guest (PG) Networks
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          From multi-floor bed allocations to 4-meal daily dining schedules, automated invoicing, and maintenance tracking — everything you need to run accommodations at scale.
        </p>
      </section>

      {/* Capabilities Grid */}
      <section className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#0a0f26]/85 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      cap.color === 'cyan' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                      cap.color === 'purple' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                      'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-white/10">
                      {cap.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{cap.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-5">{cap.description}</p>

                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/90 block">
                      Core Advantages:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                      {cap.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#0a0f26] to-cyan-900/40 border border-cyan-500/30 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Ready to Modernize Your Accommodation?</h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-xl mx-auto">
            Experience our role-based portal today. Sign in as Admin, Warden, or Student with our 1-click demo accounts or register your custom facility.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:scale-105 transition-all shadow-lg"
            >
              Create Account
            </Link>
            <Link
              to="/explore-rooms"
              className="px-6 py-3 text-xs font-semibold rounded-xl bg-white/[0.05] text-zinc-200 border border-white/10 hover:border-cyan-400/40 transition-all"
            >
              Browse Rooms & PGs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
