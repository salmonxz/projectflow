import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  Briefcase,
  Activity,
  BarChart3,
  Bell,
  Layers,
  User,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role_name || 'Member';

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto shadow-sm`}
      >
        {/* Logo Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 font-sans tracking-tight">Project<span className="text-blue-600">Flow</span></span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">SaaS Enterprise</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Persona Quick Info */}
        <div
          onClick={() => {
            navigate('/profile');
            if (onClose) onClose();
          }}
          className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3 cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all shadow-xs group"
          title="Klik untuk edit profil"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.position_name || user?.role_name}</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Main Dashboard */}
          <div>
            <NavLink to="/dashboard" onClick={onClose} className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* WORKSPACE */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
            <div className="space-y-1">
              <NavLink to="/projects" onClick={onClose} className={navItemClass}>
                <FolderKanban className="w-4 h-4" />
                <span>{role === 'Member' ? 'My Projects' : 'Projects'}</span>
              </NavLink>
              {role !== 'Administrator' && (
                <NavLink to="/tasks" onClick={onClose} className={navItemClass}>
                  <CheckSquare className="w-4 h-4" />
                  <span>My Tasks</span>
                </NavLink>
              )}
              <NavLink to="/calendar" onClick={onClose} className={navItemClass}>
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </NavLink>
            </div>
          </div>

          {/* MANAGEMENT (Admin) or TEAM (PM) */}
          {role === 'Administrator' && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Management</p>
              <div className="space-y-1">
                <NavLink to="/users" onClick={onClose} className={navItemClass}>
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </NavLink>
                <NavLink to="/positions" onClick={onClose} className={navItemClass}>
                  <Briefcase className="w-4 h-4" />
                  <span>Job Positions</span>
                </NavLink>
              </div>
            </div>
          )}

          {role === 'Project Manager' && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Team & Reports</p>
              <div className="space-y-1">
                <NavLink to="/users" onClick={onClose} className={navItemClass}>
                  <Users className="w-4 h-4" />
                  <span>Team Members</span>
                </NavLink>
                <NavLink to="/reports" onClick={onClose} className={navItemClass}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </NavLink>
              </div>
            </div>
          )}

          {/* SYSTEM */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">System</p>
            <div className="space-y-1">
              {role === 'Administrator' && (
                <NavLink to="/activities" onClick={onClose} className={navItemClass}>
                  <Activity className="w-4 h-4" />
                  <span>Activity Logs</span>
                </NavLink>
              )}
              {role === 'Administrator' && (
                <NavLink to="/reports" onClick={onClose} className={navItemClass}>
                  <BarChart3 className="w-4 h-4" />
                  <span>System Reports</span>
                </NavLink>
              )}
              <NavLink to="/notifications" onClick={onClose} className={navItemClass}>
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </NavLink>
              <NavLink to="/profile" onClick={onClose} className={navItemClass}>
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 text-center text-xs text-slate-400">
          ProjectFlow &copy; 2026 SaaS App
        </div>
      </aside>
    </>
  );
};
