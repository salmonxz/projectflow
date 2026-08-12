import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import {
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  Check,
  Briefcase,
  User,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isDemoUser = user?.email?.includes('projectflow.demo');

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current user role banner indicator */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <RoleBadge role={user?.role_name} />
          <span className="text-xs text-slate-300 font-medium">|</span>
          <span className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            {user?.position_name || 'Tidak ada posisi'}
          </span>
          {isDemoUser && (
            <>
              <span className="text-xs text-slate-300 font-medium">|</span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Demo Mode
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Tandai Semua Dibaca
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">Tidak ada notifikasi</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 text-xs cursor-pointer transition-colors ${
                        notif.is_read ? 'bg-white text-slate-500' : 'bg-blue-50/50 text-slate-900 font-semibold'
                      } hover:bg-slate-50 flex items-start space-x-3`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.is_read ? 'bg-slate-300' : 'bg-blue-600'}`} />
                      <div className="flex-1">
                        <p>{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-normal">
                          {new Date(notif.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center space-x-2 p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <span className="hidden sm:inline text-xs font-bold max-w-[120px] truncate">{user?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
              <div className="p-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <RoleBadge role={user?.role_name} />
                  {isDemoUser && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Demo Mode
                    </span>
                  )}
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 transition-colors"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Edit Profile</span>
              </Link>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
