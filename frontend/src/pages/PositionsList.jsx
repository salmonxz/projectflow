import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { CreateEditPositionModal } from '../components/positions/CreateEditPositionModal';
import { Briefcase, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const PositionsList = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/positions');
      if (res.data.success) {
        setPositions(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus Job Position ini?')) return;
    try {
      const res = await api.delete(`/positions/${id}`);
      if (res.data.success) {
        fetchPositions();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus Job Position.');
    }
  };

  const isAdmin = user?.role_name === 'Administrator';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Manajemen Job Position</h1>
          <p className="text-xs text-slate-500">
            Kelola spesialisasi bidang keahlian anggota tim software development dan rekomendasi tugas.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedPosition(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Position Baru</span>
          </button>
        )}
      </div>

      <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse">Memuat Job Positions...</div>
        ) : positions.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Belum ada Job Position"
            description="Tambahkan posisi keahlian baru untuk pengelompokan anggota."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Nama Position</th>
                  <th className="p-4">Deskripsi Peran</th>
                  <th className="p-4">Status</th>
                  {isAdmin && <th className="p-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {positions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4 text-slate-500 max-w-md">{p.description || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.is_active === 1
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {p.is_active === 1 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{p.is_active === 1 ? 'Aktif' : 'Non-Aktif'}</span>
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPosition(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      <CreateEditPositionModal
        positionData={selectedPosition}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPositions}
      />
    </div>
  );
};
