import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Avatar } from '../common/Avatar';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const CreateEditTaskModal = ({ projectId, taskData, isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [requiredPositionId, setRequiredPositionId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const [positions, setPositions] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPositions();
      if (projectId) fetchProjectMembers(projectId);

      if (taskData) {
        setTitle(taskData.title || '');
        setDescription(taskData.description || '');
        setPriority(taskData.priority || 'Medium');
        setStatus(taskData.status || 'Todo');
        setStartDate(taskData.start_date ? taskData.start_date.split('T')[0] : '');
        setDueDate(taskData.due_date ? taskData.due_date.split('T')[0] : '');
        setRequiredPositionId(taskData.required_position_id ? String(taskData.required_position_id) : '');
        setAssignedTo(taskData.assigned_to ? String(taskData.assigned_to) : '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setStatus('Todo');
        setStartDate('');
        setDueDate('');
        setRequiredPositionId('');
        setAssignedTo('');
      }
    }
  }, [isOpen, taskData, projectId]);

  const fetchPositions = async () => {
    try {
      const res = await api.get('/positions?activeOnly=true');
      if (res.data.success) setPositions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectMembers = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}`);
      if (res.data.success) {
        setProjectMembers(res.data.data.members || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Job Position Suggestion Engine
  const recommendedMembers = projectMembers.filter((m) => {
    if (!requiredPositionId) return false;
    return String(m.position_id) === requiredPositionId;
  });

  const otherMembers = projectMembers.filter((m) => {
    if (!requiredPositionId) return true;
    return String(m.position_id) !== requiredPositionId;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul task wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        project_id: parseInt(projectId),
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        start_date: startDate || null,
        due_date: dueDate || null,
        required_position_id: requiredPositionId ? parseInt(requiredPositionId) : null,
        assigned_to: assignedTo ? parseInt(assignedTo) : null
      };

      let res;
      if (taskData) {
        res = await api.put(`/tasks/${taskData.id}`, payload);
      } else {
        res = await api.post(`/projects/${projectId}/tasks`, payload);
      }

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900 font-sans">
            {taskData ? 'Edit Task' : 'Tambah Task Baru'}
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
              Judul Task <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Implementasi REST API Auth JWT"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Deskripsi</label>
            <textarea
              rows={3}
              placeholder="Penjelasan detail langkah pengerjaan task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tenggat Waktu</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Required Job Position (Rekomendasi Spesialisasi)
            </label>
            <select
              value={requiredPositionId}
              onChange={(e) => setRequiredPositionId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Bebas (Semua Keahlian) --</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Job Position Suggestion Engine Banner */}
          {requiredPositionId && recommendedMembers.length > 0 && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Rekomendasi Anggota Sesuai Posisi ({recommendedMembers.length})</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {recommendedMembers.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setAssignedTo(String(m.id))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition-all ${
                      assignedTo === String(m.id)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-800 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <Avatar name={m.name} src={m.avatar} size="xs" />
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assignee (Penanggung Jawab)
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Belum Ditugaskan --</option>

              {recommendedMembers.length > 0 && (
                <optgroup label="🌟 Rekomendasi (Sesuai Job Position)">
                  {recommendedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.position_name})
                    </option>
                  ))}
                </optgroup>
              )}

              <optgroup label="Anggota Lainnya">
                {otherMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.position_name || 'Member'})
                  </option>
                ))}
              </optgroup>
            </select>
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
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Task</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
