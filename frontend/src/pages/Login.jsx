import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  FolderKanban,
  User,
  CheckCircle2
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'Administrator',
    email: 'demo-admin@projectflow.demo',
    password: 'DemoAdmin123!',
    description: 'Full system access',
    icon: ShieldCheck
  },
  {
    role: 'Project Manager',
    email: 'demo-manager@projectflow.demo',
    password: 'DemoManager123!',
    description: 'Manage projects and tasks',
    icon: FolderKanban
  },
  {
    role: 'Member',
    email: 'demo-member@projectflow.demo',
    password: 'DemoMember123!',
    description: 'Explore assigned tasks',
    icon: User
  }
];

export const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
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
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setServerError(res.message || 'Login gagal. Silakan periksa kembali email dan password Anda.');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Terjadi kesalahan jaringan atau server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setServerError('');
    setDemoLoadingRole(account.role);
    try {
      const res = await login(account.email, account.password);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setServerError('Demo account sedang tidak tersedia. Silakan coba lagi.');
      }
    } catch (err) {
      setServerError('Demo account sedang tidak tersedia. Silakan coba lagi.');
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh-glow flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Decorative Badges */}
      <div className="hidden lg:flex absolute top-12 left-16 items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm animate-float">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-slate-700">ProjectFlow Portfolio Demo</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        {/* Logo Brand */}
        <div className="inline-flex items-center justify-center space-x-3 bg-white p-3 rounded-3xl border border-slate-200 shadow-lg shadow-blue-500/5 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight font-sans">
            Project<span className="text-blue-600">Flow</span>
          </span>
        </div>

        {/* Heading & Subheading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
          Selamat Datang Kembali
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Masuk untuk melanjutkan ke ProjectFlow
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card-premium p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xl space-y-5">
          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 flex items-center space-x-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Input Email */}
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
                  disabled={loading || !!demoLoadingRole}
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

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  disabled={loading || !!demoLoadingRole}
                  className={`w-full bg-slate-50/80 border rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600 hover:text-slate-900 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span>Ingat saya</span>
              </label>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Silakan hubungi Administrator untuk meriset password Anda.');
                }}
                className="text-blue-600 hover:text-blue-700 hover:underline font-bold"
              >
                Lupa password?
              </a>
            </div>

            {/* Button "Masuk" */}
            <button
              type="submit"
              disabled={loading || !!demoLoadingRole}
              className="w-full py-3 px-4 rounded-2xl btn-gradient-primary text-white text-xs font-bold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link Register */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-extrabold">
              Daftar
            </Link>
          </div>

          {/* DEMO ACCESS SECTION (Requirement 2 & 9) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="relative mb-3 text-center">
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Demo Access
              </span>
            </div>

            <p className="text-center text-xs text-slate-500 font-medium mb-3">
              Explore ProjectFlow with a demo account
            </p>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const IconComp = acc.icon;
                const isThisLoading = demoLoadingRole === acc.role;
                const isAnyLoading = loading || !!demoLoadingRole;

                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleDemoLogin(acc)}
                    disabled={isAnyLoading}
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {acc.role}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{acc.description}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 pl-2">
                      {isThisLoading ? (
                        <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-bold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="hidden sm:inline">Masuk...</span>
                        </div>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
