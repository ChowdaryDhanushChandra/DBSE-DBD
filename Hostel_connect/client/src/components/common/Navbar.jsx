import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, LogOut, User, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { Link } from 'react-router-dom';

const Navbar = ({ onMobileToggle }) => {
  const { user, student, logout, isAdmin, isWarden, isStudent } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          Admin
        </span>
      );
    }
    if (isWarden) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
          Warden / Staff
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
        Student
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left side: Hamburger button + Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          <span>Hostel Connect Campus Cloud</span>
        </div>
      </div>

      {/* Right side: Notification + User Info */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=4f46e5&color=fff`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
            />
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
              <div className="mt-0.5">{getRoleBadge()}</div>
            </div>
            <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                {student && (
                  <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                    ID: {student.studentId}
                  </p>
                )}
              </div>

              <div className="py-1">
                {isStudent && (
                  <Link
                    to="/student/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    My Profile
                  </Link>
                )}
                <Link
                  to={isAdmin ? '/admin/settings' : isWarden ? '/warden/settings' : '/student/settings'}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2 text-slate-400" />
                  Account Settings
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
