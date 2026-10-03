import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  BedDouble,
  UtensilsCrossed,
  CreditCard,
  AlertCircle,
  Megaphone,
  FileText,
  BarChart3,
  Settings,
  X,
  Sparkles,
  LogOut,
  CalendarCheck,
  Home,
  Star,
  LineChart,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  Package,
  DoorOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isWarden, isStudent, logout } = useAuth();

  // Role-based Nav Configuration with Groups
  const adminSections = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Student Management', path: '/admin/students', icon: Users },
        { label: 'Room Management', path: '/admin/rooms', icon: Building2 },
        { label: 'Room Allocation', path: '/admin/allocations', icon: BedDouble },
        { label: 'Fee Management', path: '/admin/fees', icon: CreditCard },
        { label: 'Maintenance Issues', path: '/admin/complaints', icon: AlertCircle },
      ],
    },
    {
      title: 'MESS & DINING',
      items: [
        { label: "Today's Menu", path: '/admin/mess', icon: UtensilsCrossed },
        { label: 'Meal Feedback', path: '/admin/mess-feedback', icon: Star },
        { label: 'Mess Analytics', path: '/admin/mess-analytics', icon: TrendingUp },
        { label: 'Weekly Mess Report', path: '/admin/mess-report', icon: FileText },
      ],
    },
    {
      title: 'HOSTEL HYGIENE',
      items: [
        { label: 'Cleanliness Score', path: '/admin/hygiene-cleanliness', icon: Sparkles },
        { label: 'Weekly Inspection', path: '/admin/hygiene-inspections', icon: ClipboardCheck },
        { label: 'Hygiene Complaints', path: '/admin/hygiene-complaints', icon: AlertTriangle },
        { label: 'Hygiene Analytics', path: '/admin/hygiene-analytics', icon: LineChart },
      ],
    },
    {
      title: 'PARCEL & VISITOR',
      items: [
        { label: 'Parcel Deliveries', path: '/admin/parcels', icon: Package },
        { label: 'Visitor Management', path: '/admin/visitors', icon: DoorOpen },
      ],
    },
    {
      title: 'SYSTEM & LOGS',
      items: [
        { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { label: 'Documents', path: '/admin/documents', icon: FileText },
        { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const wardenSections = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { label: 'Dashboard', path: '/warden/dashboard', icon: LayoutDashboard },
        { label: 'Student Directory', path: '/warden/students', icon: Users },
        { label: 'Room Management', path: '/warden/rooms', icon: Building2 },
        { label: 'Room Allocation', path: '/warden/allocations', icon: BedDouble },
        { label: 'Maintenance Issues', path: '/warden/complaints', icon: AlertCircle },
      ],
    },
    {
      title: 'MESS & DINING',
      items: [
        { label: 'Today Menu & Attendance', path: '/warden/mess', icon: UtensilsCrossed },
        { label: 'Meal Feedback', path: '/warden/mess-feedback', icon: Star },
        { label: 'Mess Analytics', path: '/warden/mess-analytics', icon: TrendingUp },
        { label: 'Weekly Mess Report', path: '/warden/mess-report', icon: FileText },
      ],
    },
    {
      title: 'HOSTEL HYGIENE',
      items: [
        { label: 'Cleanliness Score', path: '/warden/hygiene-cleanliness', icon: Sparkles },
        { label: 'Weekly Inspection', path: '/warden/hygiene-inspections', icon: ClipboardCheck },
        { label: 'Hygiene Complaints', path: '/warden/hygiene-complaints', icon: AlertTriangle },
        { label: 'Hygiene Analytics', path: '/warden/hygiene-analytics', icon: LineChart },
      ],
    },
    {
      title: 'PARCEL & VISITOR',
      items: [
        { label: 'Parcel Deliveries', path: '/warden/parcels', icon: Package },
        { label: 'Visitor Management', path: '/warden/visitors', icon: DoorOpen },
      ],
    },
    {
      title: 'SYSTEM & LOGS',
      items: [
        { label: 'Announcements', path: '/warden/announcements', icon: Megaphone },
        { label: 'Documents', path: '/warden/documents', icon: FileText },
        { label: 'Reports', path: '/warden/reports', icon: BarChart3 },
        { label: 'Settings', path: '/warden/settings', icon: Settings },
      ],
    },
  ];

  const studentSections = [
    {
      title: 'RESIDENT PORTAL',
      items: [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/student/profile', icon: Users },
        { label: 'My Room', path: '/student/my-room', icon: Home },
        { label: 'Fees & Payments', path: '/student/fees', icon: CreditCard },
        { label: 'Maintenance Issues', path: '/student/complaints', icon: AlertCircle },
      ],
    },
    {
      title: 'PARCEL & VISITOR',
      items: [
        { label: 'My Parcels', path: '/student/parcels', icon: Package },
        { label: 'Visitor Requests', path: '/student/visitors', icon: DoorOpen },
      ],
    },
    {
      title: 'MESS & DINING',
      items: [
        { label: "Today's Menu", path: '/student/mess-menu', icon: UtensilsCrossed },
        { label: 'Meal Feedback', path: '/student/meal-feedback', icon: Star },
        { label: 'Meal Attendance', path: '/student/attendance', icon: CalendarCheck },
      ],
    },
    {
      title: 'HOSTEL HYGIENE',
      items: [
        { label: 'Cleanliness Score', path: '/student/hygiene-cleanliness', icon: Sparkles },
        { label: 'Hygiene Complaints', path: '/student/hygiene-complaints', icon: AlertTriangle },
      ],
    },
    {
      title: 'COMMUNICATIONS',
      items: [
        { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
        { label: 'Documents', path: '/student/documents', icon: FileText },
        { label: 'Settings', path: '/student/settings', icon: Settings },
      ],
    },
  ];

  const sections = isAdmin ? adminSections : isWarden ? wardenSections : studentSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#0a0e27]/95 backdrop-blur-2xl text-zinc-300 flex flex-col justify-between border-r border-purple-500/20 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex h-16 items-center justify-between px-6 border-b border-purple-500/20 shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-wide">HOSTEL</span>{' '}
                <span className="font-extrabold text-cyan-400 text-sm">CONNECT</span>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
                  Hostel & Mess
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="p-4 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="px-3.5 text-[10px] font-mono tracking-wider uppercase font-bold text-zinc-500">
                  {section.title}
                </p>
                <div className="space-y-0.5 pt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-600/30 via-purple-500/15 to-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_0_15px_rgba(0,229,255,0.1)]'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Dossier & Logout */}
        <div className="p-4 border-t border-purple-500/20 bg-[#050816]/70 shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-[0_0_10px_rgba(123,97,255,0.4)]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Resident'}</p>
                <span className="inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  {user?.role || 'Guest'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10 border border-transparent hover:border-pink-500/25 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
