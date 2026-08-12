import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CreateEditUserModal } from '../components/users/CreateEditUserModal';
import { Users, Search, Plus, Filter, Trash2, Edit2, ShieldCheck, Briefcase } from 'lucide-react';

export const UsersList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPositions();
  }, [search, roleFilter, positionFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/users?search=${encodeURIComponent(search)}`;
      if (roleFilter) url += `&role_id=${roleFilter}`;
      if (positionFilter) url += `&position_id=${positionFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      if (res.data.success) setRoles(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await api.get('/positions?activeOnly=true');
      if (res.data.success) setPositions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (targetId) => {
    if (targetId === user?.id) {
      alert('Anda tidak dapat menghapus akun sendiri.');
      return;
    }
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;

    try {
      const res = await api.delete(`/users/${targetId}`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  };

  const isAdmin = user?.role_name === 'Administrator';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-500">
            Daftar seluruh anggota tim, hak akses (Access Category), dan spesialisasi keahlian (Job Position).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">Semua Access Category</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">Semua Job Position</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse">Memuat pengguna...</div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Pengguna tidak ditemukan"
            description="Tidak ada pengguna yang sesuai dengan kriteria pencarian Anda."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Pengguna</th>
                  <th className="p-4">Access Category</th>
                  <th className="p-4">Job Position</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Project</th>
                  {isAdmin && <th className="p-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-3">
                        <Avatar name={u.name} src={u.avatar} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><RoleBadge role={u.role_name} /></td>
                    <td className="p-4 font-semibold text-slate-700">
                      {u.position_name ? (
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-semibold">
                          {u.position_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Tanpa Posisi</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-blue-600">{u.projects_count || 0} Project</td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateEditUserModal
        userData={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};
