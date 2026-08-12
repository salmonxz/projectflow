import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingCardSkeleton } from '../components/common/LoadingSkeleton';
import { CreateEditProjectModal } from '../components/projects/CreateEditProjectModal';
import {
  FolderKanban,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  Users,
  ArrowRight,
  Trash2
} from 'lucide-react';

export const ProjectsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = `/projects?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projId, projName) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus project "${projName}"? Seluruh task, komentar, dan lampiran dalam project ini akan dihapus secara permanen.`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/projects/${projId}`);
      if (res.data.success) {
        fetchProjects();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus project.');
    }
  };

  const role = user?.role_name || 'Member';
  const canManageProjects = role === 'Project Manager';

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Daftar Project</h1>
          <p className="text-xs text-slate-500">
            {role === 'Member'
              ? 'Daftar proyek di mana Anda terdaftar sebagai anggota tim.'
              : 'Semua daftar proyek yang dikelola dalam sistem ProjectFlow.'}
          </p>
        </div>

        {canManageProjects && (
          <button
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Project Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama project atau client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none w-full"
            >
              <option value="">Semua Status</option>
              <option value="On Going">On Going</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingCardSkeleton count={6} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Tidak Ada Project Ditemukan"
          description="Belum ada project yang sesuai dengan kata kunci pencarian atau filter Anda."
          action={
            canManageProjects && (
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Buat Project Sekarang
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}`)}
              className="glass-card p-6 rounded-3xl border border-slate-200 hover:border-blue-400 cursor-pointer flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {proj.client_name || 'Internal Client'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={proj.status} />
                    {canManageProjects && proj.project_manager_id === user?.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(proj.id, proj.name);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {proj.description || 'Tidak ada deskripsi penjelas.'}
                </p>
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-100">
                <ProgressBar progress={proj.progress} />

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center space-x-2">
                    <Avatar name={proj.project_manager_name} src={proj.project_manager_avatar} size="xs" />
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[100px]">{proj.project_manager_name}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(proj.due_date).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit Project */}
      <CreateEditProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectData={selectedProject}
        onProjectSaved={fetchProjects}
      />
    </div>
  );
};
