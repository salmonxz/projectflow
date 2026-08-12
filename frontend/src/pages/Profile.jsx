import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Key,
  Camera,
  Upload
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef(null);

  // Info Tab State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');
  const [infoError, setInfoError] = useState('');

  // Password Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarUploading(true);
    setInfoError('');
    setInfoSuccess('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAvatar(res.data.data.avatar);
        updateUserProfile(res.data.data);
        setInfoSuccess('Foto profil berhasil diunggah.');
      } else {
        setInfoError(res.data.message || 'Gagal mengunggah foto profil.');
      }
    } catch (err) {
      setInfoError(err.response?.data?.message || 'Gagal mengunggah file foto profil.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');

    if (!name.trim()) {
      setInfoError('Nama lengkap wajib diisi.');
      return;
    }

    if (!email.trim()) {
      setInfoError('Alamat email wajib diisi.');
      return;
    }

    setInfoLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: avatar.trim()
      };

      const res = await api.put('/auth/profile', payload);

      if (res.data.success) {
        setInfoSuccess('Profil Anda berhasil diperbarui.');
        updateUserProfile(res.data.data);
      } else {
        setInfoError(res.data.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      setInfoError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword) {
      setPassError('Password saat ini wajib diisi.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPassError('Password baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });

      if (res.data.success) {
        setPassSuccess('Password Anda berhasil diperbarui.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(res.data.message || 'Gagal memperbarui password.');
      }
    } catch (err) {
      setPassError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">Pengaturan Profil</h1>
        <p className="text-xs text-slate-500">
          Kelola informasi akun pribadi, foto profil, dan keamanan password Anda.
        </p>
      </div>

      {/* Header Profile Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 shadow-sm">
        {/* Avatar with Camera Overlay & Upload Button */}
        <div className="relative group">
          <Avatar name={user?.name} src={avatar || user?.avatar} size="xl" className="shadow-md" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg border-2 border-white transition-all transform group-hover:scale-110"
            title="Unggah Foto Profil Baru"
          >
            {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <h2 className="text-xl font-extrabold text-slate-900">{user?.name}</h2>
          <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
            <RoleBadge role={user?.role_name} />
            <span className="text-xs text-slate-400 font-medium">&bull;</span>
            <span className="text-xs text-slate-700 font-semibold flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              {user?.position_name || 'Member'}
            </span>
          </div>
        </div>

        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleAvatarFileUpload}
          className="hidden"
        />
      </div>

      {/* Tabs Header */}
      <div className="flex border border-slate-200 bg-white rounded-2xl px-2 shadow-xs">
        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Informasi Profil</span>
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'password'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Ubah Password</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: INFORMASI PROFIL */}
      {activeTab === 'info' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
            {infoError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{infoError}</span>
              </div>
            )}

            {infoSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-600 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{infoSuccess}</span>
              </div>
            )}

            {/* Direct Image Upload Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Unggah Foto Profile Baru</h4>
                  <p className="text-[11px] text-slate-500">Format: JPG, PNG, WEBP (Maks 10MB)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {avatarUploading ? 'Mengunggah...' : 'Pilih Foto'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Avatar / Path Foto
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Anda dapat memilih foto dari komputer atau memasukkan URL gambar secara manual.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Access Category (Role)
                </label>
                <div className="mt-1">
                  <RoleBadge role={user?.role_name} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Job Position (Spesialisasi)
                </label>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 inline-block mt-1">
                  {user?.position_name || 'Member'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={infoLoading}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {infoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: UBAH PASSWORD */}
      {activeTab === 'password' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
            {passError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-600 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Saat Ini <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Konfirmasi Password Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {passLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Perbarui Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
