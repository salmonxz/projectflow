import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Avatar } from '../common/Avatar';
import { X, Search, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export const AddMemberModal = ({ projectId, existingMemberIds = [], isOpen, onClose, onSuccess }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  const fetchAvailableUsers = async () => {
    setFetching(true);
    try {
      const res = await api.get('/users?status=Active&exclude_admin=true');
      if (res.data.success) {
        const filtered = (res.data.data || []).filter((u) => !existingMemberIds.includes(u.id));
        setAvailableUsers(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedUserId) {
      setError('Pilih pengguna yang ingin ditambahkan.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, {
        user_id: parseInt(selectedUserId)
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan anggota.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Tambah Anggota Tim</span>
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Anggota Tim
            </label>
            {fetching ? (
              <p className="text-xs text-slate-400 py-4 animate-pulse">Memuat pengguna aktif...</p>
            ) : availableUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic">Semua pengguna aktif sudah menjadi anggota project ini.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availableUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(String(u.id))}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      selectedUserId === String(u.id)
                        ? 'bg-blue-50 border-blue-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Avatar name={u.name} src={u.avatar} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{u.position_name || 'Member'}</p>
                      </div>
                    </div>
                    {selectedUserId === String(u.id) && (
                      <span className="text-xs font-bold text-blue-600">Terpilih</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUserId}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Tambah ke Project</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
