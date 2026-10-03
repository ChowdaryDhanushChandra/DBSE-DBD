import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
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
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono uppercase tracking-wider">
          Admin
        </span>
      );
    }
    if (isWarden) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono uppercase tracking-wider">
          Warden / Staff
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono uppercase tracking-wider">
        Student Resident
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-purple-500/20 bg-[#0a0e27]/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left side: Hamburger button + Status Badge */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center text-xs font-medium text-zinc-300 bg-[#050816]/70 px-3 py-1.5 rounded-xl border border-purple-500/25">
          <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse shadow-[0_0_8px_#00E5FF]" />
          <span className="text-zinc-200 font-mono text-[11px]">Hostel Connect Space Cloud</span>
        </div>
      </div>

      {/* Right side: Quick Links + Notification + User Info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Access: Parcels & Visitors */}
        <div className="hidden sm:flex items-center space-x-2">
          <Link
            to={isAdmin ? '/admin/parcels' : isWarden ? '/warden/parcels' : '/student/parcels'}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all"
          >
            <span>📦</span>
            <span className="hidden md:inline">Parcels</span>
          </Link>
          <Link
            to={isAdmin ? '/admin/visitors' : isWarden ? '/warden/visitors' : '/student/visitors'}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 text-xs font-semibold text-slate-200 hover:text-purple-300 transition-all"
          >
            <span>🚪</span>
            <span className="hidden md:inline">Visitors</span>
          </Link>
        </div>

        <NotificationDropdown />

        <div className="h-6 w-px bg-purple-500/20" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left"
          >
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=7B61FF&color=fff`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-cyan-400/40 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
            />
            <div className="hidden md:block">
              <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
              <div className="mt-0.5">{getRoleBadge()}</div>
            </div>
            <ChevronDown className="hidden md:block w-3.5 h-3.5 text-zinc-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0a0e27]/95 backdrop-blur-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] border border-purple-500/30 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-purple-500/20">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-zinc-400 truncate font-mono">{user?.email}</p>
                {student && (
                  <p className="text-[10px] text-cyan-400 font-semibold font-mono mt-1">
                    ID: {student.studentId}
                  </p>
                )}
              </div>

              <div className="py-1">
                {isStudent && (
                  <Link
                    to="/student/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-cyan-300 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2 text-zinc-400" />
                    My Profile
                  </Link>
                )}
                <Link
                  to={isAdmin ? '/admin/settings' : isWarden ? '/warden/settings' : '/student/settings'}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-cyan-300 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2 text-zinc-400" />
                  Account Settings
                </Link>
              </div>

              <div className="border-t border-purple-500/20 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-xs font-medium text-pink-400 hover:bg-pink-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2 text-pink-400" />
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
