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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isWarden, isStudent, logout } = useAuth();

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Student Management', path: '/admin/students', icon: Users },
    { label: 'Room Management', path: '/admin/rooms', icon: Building2 },
    { label: 'Room Allocation', path: '/admin/allocations', icon: BedDouble },
    { label: 'Mess Management', path: '/admin/mess', icon: UtensilsCrossed },
    { label: 'Fee Management', path: '/admin/fees', icon: CreditCard },
    { label: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Documents', path: '/admin/documents', icon: FileText },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const wardenNav = [
    { label: 'Dashboard', path: '/warden/dashboard', icon: LayoutDashboard },
    { label: 'Student Directory', path: '/warden/students', icon: Users },
    { label: 'Room Management', path: '/warden/rooms', icon: Building2 },
    { label: 'Room Allocation', path: '/warden/allocations', icon: BedDouble },
    { label: 'Mess & Attendance', path: '/warden/mess', icon: UtensilsCrossed },
    { label: 'Complaints', path: '/warden/complaints', icon: AlertCircle },
    { label: 'Announcements', path: '/warden/announcements', icon: Megaphone },
    { label: 'Documents', path: '/warden/documents', icon: FileText },
    { label: 'Reports', path: '/warden/reports', icon: BarChart3 },
    { label: 'Settings', path: '/warden/settings', icon: Settings },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: Users },
    { label: 'My Room', path: '/student/my-room', icon: Home },
    { label: 'Mess Menu', path: '/student/mess-menu', icon: UtensilsCrossed },
    { label: 'Meal Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'Fees & Payments', path: '/student/fees', icon: CreditCard },
    { label: 'Complaints', path: '/student/complaints', icon: AlertCircle },
    { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
    { label: 'Documents', path: '/student/documents', icon: FileText },
    { label: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const links = isAdmin ? adminNav : isWarden ? wardenNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">HOSTEL</span>{' '}
                <span className="font-bold text-cyan-400 text-base">CONNECT</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Campus Suite</p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-bold'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
