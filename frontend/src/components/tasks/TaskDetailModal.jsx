import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  X,
  MessageSquare,
  Paperclip,
  Activity,
  Calendar,
  User,
  Briefcase,
  Upload,
  Trash2,
  Edit2,
  Check,
  Download,
  FileText,
  Clock,
  Send,
  Sparkles,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const TaskDetailModal = ({ taskId, isOpen, onClose, onTaskUpdated }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchTaskDetail = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${taskId}`);
      if (res.data.success) {
        const taskData = res.data.data;
        setTask(taskData);
        if (taskData.project_id) {
          fetchProjectMembers(taskData.project_id);
        }
      }
    } catch (error) {
      console.error('Error fetching task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}`);
      if (res.data.success) {
        // Exclude Administrators from project worker selection
        const members = (res.data.data.members || []).filter((m) => m.role_name !== 'Administrator');
        setProjectMembers(members);
      }
    } catch (err) {
      console.error('Error fetching project members:', err);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetail();
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setTask((prev) => ({ ...prev, status: newStatus }));
        if (onTaskUpdated) onTaskUpdated();
        fetchTaskDetail();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengubah status task.');
    }
  };

  const handleAssignUser = async (newAssigneeId) => {
    setAssigning(true);
    try {
      const res = await api.put(`/tasks/${taskId}`, {
        assigned_to: newAssigneeId ? parseInt(newAssigneeId) : null
      });
      if (res.data.success) {
        fetchTaskDetail();
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menugaskan task.');
    } finally {
      setAssigning(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { content: commentText });
      if (res.data.success) {
        setCommentText('');
        fetchTaskDetail();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan komentar.');
    }
  };

  const handleSaveEditedComment = async (commentId) => {
    if (!editCommentContent.trim()) return;
    try {
      const res = await api.put(`/comments/${commentId}`, { content: editCommentContent });
      if (res.data.success) {
        setEditingCommentId(null);
        fetchTaskDetail();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengubah komentar.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Yakin ingin menghapus komentar ini?')) return;
    try {
      const res = await api.delete(`/comments/${commentId}`);
      if (res.data.success) {
        fetchTaskDetail();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus komentar.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        fetchTaskDetail();
      }
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Gagal mengunggah file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Yakin ingin menghapus file ini?')) return;
    try {
      const res = await api.delete(`/attachments/${attachmentId}`);
      if (res.data.success) {
        fetchTaskDetail();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus attachment.');
    }
  };

  const canChangeStatus =
    user?.role_name === 'Project Manager' || (user?.role_name === 'Member' && task && task.assigned_to === user?.id);

  const canAssign =
    user?.role_name === 'Project Manager' && (task && task.project_manager_id === user?.id);

  const recommendedMembers = projectMembers.filter((m) => {
    if (!task?.required_position_id) return false;
    return m.position_id === task.required_position_id;
  });

  const otherMembers = projectMembers.filter((m) => {
    if (!task?.required_position_id) return true;
    return m.position_id !== task.required_position_id;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="space-y-1 pr-6">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {task?.project_name || 'Project'}
              </span>
              <PriorityBadge priority={task?.priority} />
              <StatusBadge status={task?.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{task?.title || 'Detail Task'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Informasi</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Komentar ({task?.comments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'attachments'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Lampiran ({task?.attachments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Aktivitas ({task?.activities?.length || 0})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400 animate-pulse">Memuat detail task...</div>
          ) : (
            <>
              {/* INFO TAB */}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Task</h4>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                        {task?.description || 'Tidak ada deskripsi penjelas.'}
                      </div>
                    </div>

                    {/* Status Change Control */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ubah Status Task</h4>
                      {canChangeStatus ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['Todo', 'In Progress', 'Review', 'Completed'].map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(st)}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                                task?.status === st
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          Anda hanya dapat mengubah status task yang ditugaskan kepada Anda.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Info Panel */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {/* ASSIGNEE SELECTOR & RECOMMENDATION ENGINE */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Assignee (Penanggung Jawab)
                      </span>

                      {canAssign ? (
                        <div className="space-y-2">
                          <select
                            value={task?.assigned_to || ''}
                            onChange={(e) => handleAssignUser(e.target.value)}
                            disabled={assigning}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 shadow-xs disabled:opacity-50"
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
                            <optgroup label="Anggota Proyek Lainnya">
                              {otherMembers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.position_name || 'Member'})
                                </option>
                              ))}
                            </optgroup>
                          </select>

                          {/* Quick Recommendation Pills */}
                          {recommendedMembers.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Penugasan 1-Click Sesuai Posisi:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {recommendedMembers.map((m) => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => handleAssignUser(m.id)}
                                    disabled={assigning}
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center space-x-1.5 transition-all ${
                                      task?.assigned_to === m.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white text-slate-800 border-blue-200 hover:border-blue-500 hover:bg-blue-50'
                                    }`}
                                  >
                                    <Avatar name={m.name} src={m.avatar} size="xs" />
                                    <span>{m.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : task?.assigned_to ? (
                        <div className="flex items-center space-x-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                          <Avatar name={task.assignee_name} src={task.assignee_avatar} size="md" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{task.assignee_name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{task.assignee_position || 'Member'}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic block">Belum ditugaskan</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Required Position</span>
                      {task?.required_position_name ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{task.required_position_name}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Semua keahlian</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Mulai</span>
                        <span className="text-xs text-slate-800 font-semibold flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {task?.start_date ? new Date(task.start_date).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tenggat Waktu</span>
                        <span className={`text-xs font-semibold flex items-center gap-1 mt-1 ${
                          task?.status !== 'Completed' && task?.due_date && new Date(task.due_date) < new Date()
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-800'
                        }`}>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {task?.due_date ? new Date(task.due_date).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                      Dibuat oleh: <span className="text-slate-700 font-bold">{task?.creator_name || 'Admin'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMENTS TAB */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  {/* Comments Feed */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {task?.comments?.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">Belum ada komentar pada task ini.</p>
                    ) : (
                      task?.comments?.map((comment) => (
                        <div key={comment.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar name={comment.user_name} src={comment.user_avatar} size="sm" />
                              <div>
                                <span className="text-xs font-bold text-slate-900">{comment.user_name}</span>
                                {comment.user_position && (
                                  <span className="ml-2 text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                    {comment.user_position}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                                rows={3}
                              />
                              <div className="flex space-x-2 justify-end">
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => handleSaveEditedComment(comment.id)}
                                  className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white font-semibold"
                                >
                                  Simpan
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-700 leading-relaxed pl-11 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          )}

                          {comment.user_id === user?.id && editingCommentId !== comment.id && (
                            <div className="flex space-x-3 justify-end pt-1">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentContent(comment.content);
                                }}
                                className="text-[11px] text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-200 flex space-x-3">
                    <Avatar name={user?.name} src={user?.avatar} size="sm" />
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        placeholder="Tulis komentar..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ATTACHMENTS TAB */}
              {activeTab === 'attachments' && (
                <div className="space-y-6">
                  {/* Upload Box */}
                  <div className="p-5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl bg-slate-50/50 text-center transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.zip"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-bold text-blue-600 block">Klik untuk mengunggah file lampiran</span>
                      <span className="text-[11px] text-slate-400 mt-1 block">Format: PDF, PNG, JPG, DOC, XLS, ZIP (Maks 10MB)</span>
                    </label>
                    {uploading && <p className="text-xs text-amber-600 mt-2 animate-pulse font-bold">Mengunggah file...</p>}
                    {uploadError && <p className="text-xs text-rose-600 mt-2 font-bold">{uploadError}</p>}
                  </div>

                  {/* Attachment Files List */}
                  <div className="space-y-3">
                    {task?.attachments?.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">Belum ada file lampiran.</p>
                    ) : (
                      task?.attachments?.map((att) => (
                        <div key={att.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{att.file_name}</p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {(att.file_size / 1024).toFixed(1)} KB &bull; Oleh {att.uploader_name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <a
                              href={`http://localhost:5000${att.file_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
                              title="Download / View"
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            {(att.uploaded_by === user?.id || user?.role_name !== 'Member') && (
                              <button
                                onClick={() => handleDeleteAttachment(att.id)}
                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ACTIVITY TAB */}
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {task?.activities?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Belum ada riwayat aktivitas pada task ini.</p>
                  ) : (
                    task?.activities?.map((act) => (
                      <div key={act.id} className="flex items-start space-x-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                          <p className="text-slate-800 leading-snug">{act.description}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                            {new Date(act.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
