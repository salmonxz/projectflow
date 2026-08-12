import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { CheckSquare, Search, Filter, Calendar } from 'lucide-react';

export const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `/tasks?search=${encodeURIComponent(search)}&assigned_only=true`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Daftar Task Saya</h1>
        <p className="text-xs text-slate-500">
          Pantau seluruh pekerjaan yang ditugaskan kepada Anda dan perbarui status pengerjaannya.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari judul task atau nama project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">Semua Status</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">Semua Prioritas</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse">Memuat task...</div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Tidak ada task"
            description="Tidak ada task yang cocok dengan filter pencarian Anda."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Task</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Required Position</th>
                  <th className="p-4">Prioritas</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      setIsDetailOpen(true);
                    }}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900">{t.title}</td>
                    <td className="p-4 font-bold text-blue-600">{t.project_name}</td>
                    <td className="p-4">
                      {t.required_position_name ? (
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[11px] font-semibold">
                          {t.required_position_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="p-4"><StatusBadge status={t.status} /></td>
                    <td className="p-4 font-semibold text-slate-500">
                      {t.due_date ? new Date(t.due_date).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onTaskUpdated={fetchTasks}
      />
    </div>
  );
};
