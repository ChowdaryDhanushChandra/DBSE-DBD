import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Info, AlertTriangle, AlertCircle, Building, Package, UserCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'room':
        return <Building className="w-4 h-4 text-cyan-400" />;
      case 'fee':
        return <AlertCircle className="w-4 h-4 text-purple-400" />;
      case 'complaint':
        return <AlertTriangle className="w-4 h-4 text-pink-400" />;
      case 'parcel':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'visitor':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-300" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-cyan-400 hover:bg-white/[0.05] rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black shadow-[0_0_10px_#00E5FF] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0a0e27]/95 backdrop-blur-2xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.8)] border border-purple-500/30 py-3 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-purple-500/20">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No notifications to display
              </div>
            ) : (
              notifications.map((notif) => {
                const notifId = notif.id || notif._id;
                return (
                  <div
                    key={notifId}
                    className={`p-3.5 hover:bg-white/[0.03] transition-colors flex items-start space-x-3 ${
                      !notif.isRead ? 'bg-purple-500/[0.07]' : ''
                    }`}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notifId);
                    }}
                  >
                    <div className="p-2 rounded-xl bg-[#050816] border border-white/10 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5 leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 mt-1.5"
                        >
                          View Details <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
