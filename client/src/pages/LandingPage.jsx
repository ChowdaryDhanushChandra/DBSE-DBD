import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (email, password, redirectPath) => {
    const result = await login(email, password);
    if (result.success) {
      navigate(redirectPath);
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Student Management',
      desc: 'Centralized directory for comprehensive student records, guardian contacts, academic courses, and resident status.',
      color: 'indigo',
    },
    {
      icon: BedDouble,
      title: 'Smart Room Allocation',
      desc: 'Automated occupancy tracking, room capacity enforcement, bed availability indicators, and seamless room transfers.',
      color: 'purple',
    },
    {
      icon: UtensilsCrossed,
      title: 'Mess Operations',
      desc: 'Weekly 7-day meal schedules, dietary classifications (Veg/Non-Veg), calorie tracking, and student attendance check-ins.',
      color: 'cyan',
    },
    {
      icon: CreditCard,
      title: 'Fee Tracking & Receipts',
      desc: 'Automated semester fee billing, overdue tracking, instant simulated payments, and printable PDF payment vouchers.',
      color: 'emerald',
    },
    {
      icon: AlertCircle,
      title: 'Complaint Resolution',
      desc: 'Student ticketing with priority flags, image attachments, staff assignment, and interactive status timelines.',
      color: 'amber',
    },
    {
      icon: Megaphone,
      title: 'Announcements & Alerts',
      desc: 'Targeted broadcast notifications by hostel or audience with instant real-time notification bell alerts.',
      color: 'rose',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      desc: 'Visual dashboards with occupancy donut charts, monthly fee collection bars, and one-click CSV export.',
      color: 'indigo',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access',
      desc: 'Secure JWT authentication with dedicated portals for Administrators, Hostel Wardens, and University Students.',
      color: 'purple',
    },
  ];

  const steps = [
    { step: '01', title: 'Student Registration', desc: 'Students register online with academic and emergency details.' },
    { step: '02', title: 'Hostel & Room Setup', desc: 'Wardens configure hostels, floors, room capacities, and amenities.' },
    { step: '03', title: 'Smart Room Allocation', desc: 'Admin allocates rooms ensuring real-time capacity and bed counts.' },
    { step: '04', title: 'Mess & Daily Dining', desc: 'Daily meal plans are published and meal attendance is recorded.' },
    { step: '05', title: 'Fee Payment & Receipt', desc: 'Students track dues and instantly generate verified payment receipts.' },
    { step: '06', title: 'Maintenance & Support', desc: 'Instant issue resolution with transparent chronological updates.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">HOSTEL</span>{' '}
              <span className="font-bold text-xl text-indigo-600">CONNECT</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/50 via-purple-200/40 to-cyan-200/40 rounded-full blur-3xl opacity-70 animate-pulse" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Next-Generation Campus Accommodation Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Smart Hostel & Mess Management{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
              Made Simple
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Manage accommodation, rooms, mess operations, payments, and student services from one centralized platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center"
            >
              Sign In to Portal
            </Link>
          </div>

          {/* Quick Demo Logins Bar */}
          <div className="mt-12 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-card max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1-Click Demo Login (Instant Evaluation)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickDemo('admin@hostelconnect.com', 'Admin@123', '/admin/dashboard')}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Login as Admin</span>
              </button>
              <button
                onClick={() => handleQuickDemo('warden@hostelconnect.com', 'Warden@123', '/warden/dashboard')}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold border border-purple-200 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Login as Warden</span>
              </button>
              <button
                onClick={() => handleQuickDemo('student@hostelconnect.com', 'Student@123', '/student/dashboard')}
                className="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-xl text-xs font-bold border border-cyan-200 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Login as Student</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Powerful Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for Campus Excellence
            </h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Say goodbye to scattered spreadsheets and paper logbooks. Everything you need is integrated seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-indigo-600 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{f.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Unified Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Hostel Connect Works
            </h3>
            <p className="mt-3 text-slate-600 text-sm">
              Student → Hostel Management → Room Allocation → Mess Services → Payments → Support
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative p-6 bg-white rounded-2xl border border-slate-200/80 shadow-card"
              >
                <div className="text-2xl font-black text-indigo-600/30 mb-2">{s.step}</div>
                <h4 className="text-base font-bold text-slate-800 mb-1">{s.title}</h4>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Overview Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Role-Based Experience</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored Portals for Every Stakeholder
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100 shadow-card flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-200">
                  A
                </div>
                <h4 className="text-xl font-bold text-slate-900">Administrator</h4>
                <p className="text-xs font-semibold text-indigo-600 mb-4">Complete Institutional Control</p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Student registration & profile management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Hostel & room capacity analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Fee billing & receipt generation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Campus announcements & broadcast alerts
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemo('admin@hostelconnect.com', 'Admin@123', '/admin/dashboard')}
                className="mt-8 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
              >
                Access Admin Portal
              </button>
            </div>

            {/* Warden Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-100 shadow-card flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-purple-200">
                  W
                </div>
                <h4 className="text-xl font-bold text-slate-900">Warden / Staff</h4>
                <p className="text-xs font-semibold text-purple-600 mb-4">Day-to-Day Hostel Operations</p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Assigned hostel room status & inspections
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Student room allocations & transfers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Complaint status updates & staff assignment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Mess meal attendance tracking
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemo('warden@hostelconnect.com', 'Warden@123', '/warden/dashboard')}
                className="mt-8 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
              >
                Access Warden Portal
              </button>
            </div>

            {/* Student Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-cyan-50/50 to-white border border-cyan-100 shadow-card flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-cyan-200">
                  S
                </div>
                <h4 className="text-xl font-bold text-slate-900">Student</h4>
                <p className="text-xs font-semibold text-cyan-600 mb-4">Self-Service Resident Hub</p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    View assigned room & roommate profiles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Daily & weekly mess menu with calories
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Pay semester fees & download receipts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                    Submit complaints & track resolution timeline
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemo('student@hostelconnect.com', 'Student@123', '/student/dashboard')}
                className="mt-8 w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
              >
                Access Student Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base">HOSTEL CONNECT</span>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} Hostel Connect Campus Management System. All rights reserved.
          </p>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
