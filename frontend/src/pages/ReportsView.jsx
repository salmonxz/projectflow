import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  BarChart3,
  Users,
  CheckSquare,
  FolderKanban,
  TrendingUp,
  Printer,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PieChart as PieIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export const ReportsView = () => {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = '/reports/workload';
      if (selectedProjectId) {
        url += `?project_id=${selectedProjectId}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statusColors = {
    'Todo': '#94a3b8',
    'In Progress': '#f59e0b',
    'Review': '#a855f7',
    'Completed': '#10b981'
  };

  const priorityColors = {
    'Low': '#3b82f6',
    'Medium': '#f59e0b',
    'High': '#f97316',
    'Urgent': '#f43f5e'
  };

  const pieData = (data?.task_status_distribution || []).map((item) => ({
    name: item.status,
    value: item.count,
    color: statusColors[item.status] || '#2563eb'
  }));

  const priorityChartData = (data?.task_priority_distribution || []).map((item) => ({
    name: item.priority,
    'Jumlah Task': item.count,
    fill: priorityColors[item.priority] || '#3b82f6'
  }));

  const workloadChartData = (data?.position_workload || []).map((item) => ({
    name: item.position_name,
    'Total Task': item.total_tasks,
    'Selesai': item.completed_tasks
  }));

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      {/* Printable Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Laporan & Analisis Proyek</h1>
          <p className="text-xs text-slate-500">
            Visualisasi grafik statistik beban kerja tim per Job Position dan distribusi status pengerjaan task.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto print:hidden">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value="">Semua Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Export Laporan</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400 animate-pulse">Memuat data laporan...</div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Project</span>
                <h3 className="text-2xl font-extrabold text-slate-900">{summary.total_projects || 0}</h3>
                <span className="text-[10px] text-slate-400 block font-medium">{summary.active_projects || 0} On Going</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-slate-500 font-medium">Total Task</span>
                <h3 className="text-2xl font-extrabold text-slate-900">{summary.total_tasks || 0}</h3>
                <div className="mt-1">
                  <ProgressBar progress={summary.completion_rate} height="h-1.5" />
                </div>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Task Selesai</span>
                <h3 className="text-2xl font-extrabold text-emerald-600">{summary.completed_tasks || 0}</h3>
                <span className="text-[10px] text-emerald-600 font-bold block">{summary.completion_rate || 0}% Completion Rate</span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Task Overdue</span>
                <h3 className="text-2xl font-extrabold text-rose-600">{summary.overdue_tasks || 0}</h3>
                <span className="text-[10px] text-rose-500 font-medium block">Perlu Perhatian Tim</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Status Distribution Pie Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-600" />
                <span>Distribusi Status Task System</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', color: '#0f172a', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                {pieData.map((p) => (
                  <div key={p.name} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-600 font-medium text-[11px] truncate">{p.name}: <strong className="text-slate-900">{p.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Position Workload Bar Chart */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Beban Kerja Per Job Position</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', color: '#0f172a', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Total Task" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Selesai" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Member Workload Breakdown Table */}
          <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Detail Beban Kerja & Produktivitas Anggota Tim</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">{(data?.member_workload || []).length} Anggota Terdaftar</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Anggota Tim</th>
                    <th className="p-4">Access Category</th>
                    <th className="p-4">Job Position</th>
                    <th className="p-4 text-center">Total Task</th>
                    <th className="p-4 text-center">Todo</th>
                    <th className="p-4 text-center">In Progress</th>
                    <th className="p-4 text-center">Review</th>
                    <th className="p-4 text-center">Completed</th>
                    <th className="p-4 w-36">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.member_workload || []).map((m) => (
                    <tr key={m.user_id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <Avatar name={m.user_name} src={m.user_avatar} size="xs" />
                          <div>
                            <p className="font-bold text-slate-900">{m.user_name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{m.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><RoleBadge role={m.role_name} /></td>
                      <td className="p-4 font-semibold text-slate-600">{m.position_name}</td>
                      <td className="p-4 text-center font-extrabold text-slate-900">{m.total_assigned_tasks}</td>
                      <td className="p-4 text-center text-slate-500 font-semibold">{m.todo_count}</td>
                      <td className="p-4 text-center text-amber-600 font-semibold">{m.in_progress_count}</td>
                      <td className="p-4 text-center text-purple-600 font-semibold">{m.review_count}</td>
                      <td className="p-4 text-center text-emerald-600 font-extrabold">{m.completed_count}</td>
                      <td className="p-4">
                        <ProgressBar progress={m.completion_percentage} height="h-2" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
