import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingCardSkeleton } from '../components/common/LoadingSkeleton';
import {
  Users,
  FolderKanban,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  Plus,
  TrendingUp
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role_name || 'Member';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
              {role} Dashboard
            </span>
            <span className="text-xs text-slate-500 font-medium">&bull; {user?.position_name || 'No Position'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-xs text-slate-500">
            Berikut adalah ringkasan aktivitas proyek, status task, dan tenggat waktu Anda hari ini.
          </p>
        </div>

        {role === 'Project Manager' && (
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Kelola Project</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingCardSkeleton />
          <LoadingCardSkeleton />
          <LoadingCardSkeleton />
          <LoadingCardSkeleton />
        </div>
      ) : (
        <>
          {/* STATS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {role === 'Administrator' && (
              <>
                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Total Users</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.total_users || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Active Users</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.active_users || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Total Projects</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.total_projects || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Total Tasks</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.total_tasks || 0}</h3>
                  </div>
                </div>
              </>
            )}

            {role === 'Project Manager' && (
              <>
                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">My Managed Projects</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.total_projects || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Active Projects</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.active_projects || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Completed Tasks</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {stats?.completed_tasks || 0} <span className="text-xs text-slate-400 font-normal">/ {stats?.total_tasks || 0}</span>
                    </h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Overdue Tasks</span>
                    <h3 className="text-2xl font-extrabold text-rose-600">{stats?.overdue_tasks || 0}</h3>
                  </div>
                </div>
              </>
            )}

            {role === 'Member' && (
              <>
                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Joined Projects</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.my_projects_count || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">My Active Tasks</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.my_active_tasks || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Completed Tasks</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats?.completed_tasks || 0}</h3>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Overdue Tasks</span>
                    <h3 className="text-2xl font-extrabold text-rose-600">{stats?.overdue_tasks || 0}</h3>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MAIN CONTENT SPLIT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Projects & Deadlines */}
            <div className="lg:col-span-2 space-y-6">
              {/* Projects List Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-blue-600" />
                    <span>Project Utama</span>
                  </h3>
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {(stats?.my_projects || []).length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Belum ada project yang diikuti.</p>
                  ) : (
                    (stats?.my_projects || []).map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => navigate(`/projects/${proj.id}`)}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-white cursor-pointer transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{proj.name}</h4>
                            <span className="text-[11px] text-slate-500">{proj.client_name || 'Internal Client'}</span>
                          </div>
                          <StatusBadge status={proj.status} />
                        </div>
                        <ProgressBar progress={proj.progress} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Member Upcoming Deadlines */}
              {role === 'Member' && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span>Tenggat Waktu Mendatang</span>
                    </h3>
                    <button
                      onClick={() => navigate('/calendar')}
                      className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                    >
                      Buka Kalender <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(stats?.upcoming_deadlines || []).length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Tidak ada tenggat waktu dalam waktu dekat.</p>
                    ) : (
                      (stats?.upcoming_deadlines || []).map((t) => (
                        <div key={t.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-900 block">{t.title}</span>
                            <span className="text-[11px] text-slate-500 block">{t.project_name}</span>
                          </div>
                          <div className="text-right">
                            <PriorityBadge priority={t.priority} />
                            <span className="text-[11px] font-bold text-rose-600 block mt-1">
                              Due: {new Date(t.due_date).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Recent Activities Feed */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Aktivitas Terbaru</span>
                </h3>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {(stats?.recent_activities || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Belum ada log aktivitas.</p>
                  ) : (
                    (stats?.recent_activities || []).map((act) => (
                      <div key={act.id} className="flex items-start space-x-3 text-xs">
                        <Avatar name={act.user_name} src={act.user_avatar} size="xs" />
                        <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 space-y-1">
                          <p className="text-slate-800 leading-snug">{act.description}</p>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {new Date(act.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
