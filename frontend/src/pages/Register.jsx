import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';

const DEFAULT_POSITIONS_FALLBACK = [
  { id: 2, name: 'Project Manager' },
  { id: 3, name: 'Frontend Developer' },
  { id: 4, name: 'Backend Developer' },
  { id: 5, name: 'Fullstack Developer' },
  { id: 6, name: 'UI/UX Designer' },
  { id: 7, name: 'Mobile Developer' },
  { id: 8, name: 'QA Engineer' },
  { id: 9, name: 'DevOps Engineer' },
  { id: 10, name: 'Data Analyst' },
  { id: 11, name: 'Product Manager' },
  { id: 12, name: 'Content Writer' }
];

export const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [roleId, setRoleId] = useState('3');
  const [positionId, setPositionId] = useState('');

  const [positions, setPositions] = useState(DEFAULT_POSITIONS_FALLBACK);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchPositions = async () => {
      try {
        const res = await api.get('/positions?activeOnly=true');
        if (res.data.success && isMounted && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setPositions(res.data.data);
        }
      } catch (err) {
        console.error('Error loading positions:', err);
      }
    };
    fetchPositions();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (roleId === '2') {
      const pmPos = positions.find((p) => p.name.toLowerCase() === 'project manager');
      if (pmPos) {
        setPositionId(String(pmPos.id));
      } else {
        setPositionId('2');
      }
    } else if (roleId === '3' && positionId) {
      const pmPos = positions.find((p) => p.name.toLowerCase() === 'project manager');
      if (pmPos && String(pmPos.id) === positionId) {
        setPositionId('');
      }
    }
  }, [roleId, positions]);

  const validate = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = 'Nama lengkap wajib diisi';
    }

    if (!email.trim()) {
      errs.email = 'Email wajib diisi';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Format email tidak valid';
      }
    }

    if (!password) {
      errs.password = 'Password wajib diisi';
    } else if (password.length < 8) {
      errs.password = 'Password minimal 8 karakter';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password tidak cocok dengan password';
    }

    if (!roleId) {
      errs.roleId = 'Access Category wajib dipilih';
    }

    if (!positionId) {
      errs.positionId = 'Job Position wajib dipilih';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role_id: parseInt(roleId),
        position_id: parseInt(positionId)
      };

      const res = await api.post('/auth/register', payload);

      if (res.data.success) {
        setSuccessMessage('Pendaftaran akun berhasil! Mengalihkan ke halaman masuk...');
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      } else {
        setServerError(res.data.message || 'Pendaftaran gagal.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Terjadi kesalahan pada server saat pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const availablePositions = positions.filter((p) => p.name.toLowerCase() !== 'system administrator');

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh-glow flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Badges */}
      <div className="hidden lg:flex absolute top-12 right-16 items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm animate-float">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold text-slate-700">Multi-Role Access & Team Workspace</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center space-x-3 bg-white p-3 rounded-3xl border border-slate-200 shadow-lg shadow-blue-500/5 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight font-sans">
            Project<span className="text-blue-600">Flow</span>
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
          Buat Akun Baru
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Daftar sekarang untuk mulai berkolaborasi dan mengelola proyek bersama tim
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card-premium p-8 rounded-3xl border border-slate-200/90 shadow-2xl space-y-5">
          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 flex items-center space-x-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-600 flex items-center space-x-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Contoh: Ryehan Alfiansyah"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  className={`w-full bg-slate-50/80 border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    errors.name
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  className={`w-full bg-slate-50/80 border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.email}</p>
              )}
            </div>

            {/* Password & Konfirmasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 karakter"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    className={`w-full bg-slate-50/80 border rounded-2xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[10px] text-rose-500 font-semibold">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Konfirmasi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                    }}
                    className={`w-full bg-slate-50/80 border rounded-2xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.confirmPassword
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[10px] text-rose-500 font-semibold">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Access Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Access Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={roleId}
                onChange={(e) => {
                  setRoleId(e.target.value);
                  if (errors.roleId) setErrors({ ...errors, roleId: null });
                }}
                className={`w-full bg-slate-50/80 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none transition-all ${
                  errors.roleId ? 'border-rose-400' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                }`}
              >
                <option value="3">Member (Anggota Tim Pekerja)</option>
                <option value="2">Project Manager (Pengelola Proyek)</option>
              </select>
              {errors.roleId && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.roleId}</p>
              )}
            </div>

            {/* Job Position */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Position (Spesialisasi) <span className="text-rose-500">*</span>
              </label>
              <select
                value={positionId}
                onChange={(e) => {
                  setPositionId(e.target.value);
                  if (errors.positionId) setErrors({ ...errors, positionId: null });
                }}
                disabled={roleId === '2'}
                className={`w-full bg-slate-50/80 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none transition-all disabled:opacity-75 ${
                  errors.positionId ? 'border-rose-400' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                }`}
              >
                <option value="">-- Pilih Job Position --</option>
                {availablePositions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
              {errors.positionId && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.positionId}</p>
              )}
            </div>

            {/* Button "Daftar Akun" */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl btn-gradient-primary text-white text-xs font-bold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link Login */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-extrabold">
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
