import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { CreateEditTaskModal } from '../components/tasks/CreateEditTaskModal';
import { CreateEditProjectModal } from '../components/projects/CreateEditProjectModal';
import { AddMemberModal } from '../components/projects/AddMemberModal';

import {
  FolderKanban,
  CheckSquare,
  Users,
  Activity,
  Calendar,
  Clock,
  Briefcase,
  Plus,
  Search,
  Filter,
  UserPlus,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
  GripVertical
} from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Tasks tab
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');
  const [taskPositionFilter, setTaskPositionFilter] = useState('');

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Kanban drag state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  useEffect(() => {
    fetchProjectDetail();
    fetchPositions();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'tasks' || activeTab === 'kanban') {
      fetchTasks();
    } else if (activeTab === 'activity') {
      fetchProjectActivities();
    }
  }, [id, activeTab, taskSearch, taskStatusFilter, taskPriorityFilter, taskPositionFilter]);

  const fetchProjectDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await api.get('/positions?activeOnly=true');
      if (res.data.success) {
        setPositions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      let url = `/projects/${id}/tasks?search=${encodeURIComponent(taskSearch)}`;
      if (taskStatusFilter) url += `&status=${taskStatusFilter}`;
      if (taskPriorityFilter) url += `&priority=${taskPriorityFilter}`;
      if (taskPositionFilter) url += `&required_position_id=${taskPositionFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchProjectActivities = async () => {
    try {
      const res = await api.get(`/projects/${id}/activity`);
      if (res.data.success) {
        setActivities(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Yakin ingin menghapus anggota ini dari project?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      if (res.data.success) {
        fetchProjectDetail();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus anggota.');
    }
  };

  // Kanban Drag & Drop Status Handler
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchTasks();
        fetchProjectDetail();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memindahkan status task.');
    } finally {
      setDraggedTaskId(null);
    }
  };

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus project "${project?.name}"? Seluruh task, komentar, dan lampiran dalam project ini akan dihapus secara permanen.`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/projects/${id}`);
      if (res.data.success) {
        alert('Project berhasil dihapus.');
        navigate('/projects');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus project.');
    }
  };

  const role = user?.role_name || 'Member';
  const canManage = role === 'Project Manager' && project?.project_manager_id === user?.id;

  if (loading && !project) {
    return <div className="p-12 text-center text-sm text-slate-500 animate-pulse">Memuat data project...</div>;
  }

  const kanbanColumns = ['Todo', 'In Progress', 'Review', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {project?.client_name || 'Internal Client'}
              </span>
              <StatusBadge status={project?.status} />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight mt-1">
              {project?.name}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {project?.description || 'Tidak ada deskripsi penjelas.'}
            </p>
          </div>

          {canManage && (
            <div className="flex items-center space-x-2 self-start flex-wrap gap-y-2">
              <button
                onClick={() => setIsEditProjectOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Project</span>
              </button>
              <button
                onClick={() => {
                  setEditingTaskData(null);
                  setIsCreateTaskOpen(true);
                }}
                className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Project Meta Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Project Manager</span>
            <div className="flex items-center space-x-2 mt-1">
              <Avatar name={project?.project_manager_name} src={project?.project_manager_avatar} size="xs" />
              <span className="text-slate-900 font-bold truncate">{project?.project_manager_name}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Mulai</span>
            <span className="text-slate-900 font-semibold flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {project?.start_date ? new Date(project.start_date).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tenggat Waktu</span>
            <span className="text-slate-900 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {project?.due_date ? new Date(project.due_date).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Progress Selesai</span>
            <div className="mt-1">
              <ProgressBar progress={project?.progress} height="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex border border-slate-200 bg-white rounded-2xl px-2 shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'tasks'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks ({project?.task_stats?.total || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'kanban'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Kanban Board</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members ({project?.members?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Task Breakdown Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-500 font-medium">Todo</span>
                <h4 className="text-xl font-extrabold text-slate-900">{project?.task_stats?.todo || 0}</h4>
              </div>
              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-xs text-amber-600 font-medium">In Progress</span>
                <h4 className="text-xl font-extrabold text-amber-600">{project?.task_stats?.in_progress || 0}</h4>
              </div>
              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-xs text-purple-600 font-medium">Review</span>
                <h4 className="text-xl font-extrabold text-purple-600">{project?.task_stats?.review || 0}</h4>
              </div>
              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-xs text-emerald-600 font-medium">Completed</span>
                <h4 className="text-xl font-extrabold text-emerald-600">{project?.task_stats?.completed || 0}</h4>
              </div>
            </div>

            {/* Overview Description */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Project</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {project?.description || 'Belum ada penjelasan detail untuk proyek ini.'}
              </p>
            </div>
          </div>

          {/* Team Summary Sidebar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tim Project</h3>
              {canManage && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(project?.members || []).map((m) => (
                <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar name={m.name} src={m.avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                      <span className="text-[10px] text-slate-500 block truncate">{m.position_name || 'Member'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari judul task..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="">Semua Status</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="">Semua Prioritas</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              <select
                value={taskPositionFilter}
                onChange={(e) => setTaskPositionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="">Semua Required Position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>{pos.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks List Table */}
          <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">Belum ada task pada project ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Task</th>
                      <th className="p-4">Required Position</th>
                      <th className="p-4">Assignee</th>
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
                          setIsTaskDetailOpen(true);
                        }}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-bold text-slate-900">
                          {t.title}
                          {t.comments_count > 0 && (
                            <span className="ml-2 text-[10px] text-slate-400 font-semibold">
                              💬 {t.comments_count}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {t.required_position_name ? (
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[11px] font-semibold">
                              {t.required_position_name}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {t.assignee_name ? (
                            <div className="flex items-center space-x-2">
                              <Avatar name={t.assignee_name} src={t.assignee_avatar} size="xs" />
                              <span className="font-semibold text-slate-900">{t.assignee_name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditugaskan</span>
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
        </div>
      )}

      {/* 3. KANBAN BOARD TAB */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((colStatus) => {
            const colTasks = tasks.filter((t) => t.status === colStatus);

            return (
              <div
                key={colStatus}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colStatus)}
                className="kanban-col p-4 flex flex-col min-h-[500px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{colStatus}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-bold border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-2xl bg-white/50">
                      Tarik task ke sini
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setIsTaskDetailOpen(true);
                        }}
                        className="glass-card p-4 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-grab active:cursor-grabbing transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <PriorityBadge priority={t.priority} />
                          {t.required_position_name && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium truncate max-w-[120px]">
                              {t.required_position_name}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {t.title}
                        </h4>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          {t.assignee_name ? (
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <Avatar name={t.assignee_name} src={t.assignee_avatar} size="xs" />
                              <span className="truncate max-w-[90px] text-slate-700 font-semibold">{t.assignee_name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}

                          <span className="text-[10px] font-bold text-slate-500">
                            {t.due_date ? new Date(t.due_date).toLocaleDateString('id-ID', { month: 'numeric', day: 'numeric' }) : ''}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MEMBERS TAB */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Anggota Project</h3>
            {canManage && (
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Anggota</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(project?.members || []).map((m) => (
              <div key={m.id} className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <Avatar name={m.name} src={m.avatar} size="md" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{m.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                    <span className="inline-block mt-1.5 text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                      {m.position_name || 'Member'}
                    </span>
                  </div>
                </div>

                {canManage && m.id !== project?.project_manager_id && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus dari project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Log Aktivitas Project</h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada aktivitas tercatat pada project ini.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs">
                  <Avatar name={act.user_name} src={act.user_avatar} size="xs" />
                  <div className="flex-1 space-y-1">
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
      )}

      {/* Modals */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onTaskUpdated={() => {
          fetchTasks();
          fetchProjectDetail();
        }}
      />

      <CreateEditTaskModal
        projectId={id}
        taskData={editingTaskData}
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSuccess={() => {
          fetchTasks();
          fetchProjectDetail();
        }}
      />

      <CreateEditProjectModal
        projectData={project}
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSuccess={fetchProjectDetail}
      />

      <AddMemberModal
        projectId={id}
        existingMemberIds={(project?.members || []).map((m) => m.id)}
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={fetchProjectDetail}
      />
    </div>
  );
};
