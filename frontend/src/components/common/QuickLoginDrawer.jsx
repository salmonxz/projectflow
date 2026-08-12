import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from './Avatar';
import { RoleBadge } from './Badge';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export const QuickLoginDrawer = ({ isOpen, onClose }) => {
  const { user, quickLoginAs } = useAuth();

  if (!isOpen) return null;

  const testAccounts = [
    { name: 'Ryehan Alfiansyah', email: 'admin@gmail.com', role: 'Administrator', position: 'System Administrator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'Budi Pratama', email: 'manager@gmail.com', role: 'Project Manager', position: 'Project Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { name: 'Siti Nurhaliza', email: 'frontend@gmail.com', role: 'Member', position: 'Frontend Developer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { name: 'Andi Wijaya', email: 'backend@gmail.com', role: 'Member', position: 'Backend Developer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { name: 'Sinta Maharani', email: 'designer@gmail.com', role: 'Member', position: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { name: 'Dimas Prasetyo', email: 'qa@gmail.com', role: 'Member', position: 'QA Engineer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  ];

  const handleSelect = async (email) => {
    await quickLoginAs(email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-slate-100">Switch Demo Persona</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 my-4">
            Pilih salah satu akun pengujian di bawah ini untuk mensimulasikan hak akses yang berbeda dalam sistem.
          </p>

          <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {testAccounts.map((acc) => {
              const isCurrent = user?.email === acc.email;
              return (
                <div
                  key={acc.email}
                  onClick={() => handleSelect(acc.email)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                    isCurrent
                      ? 'bg-brand-600/20 border-brand-500 shadow-md shadow-brand-500/10'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <Avatar name={acc.name} src={acc.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200 truncate">{acc.name}</span>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mb-1">{acc.email}</p>
                    <div className="flex items-center space-x-2">
                      <RoleBadge role={acc.role} />
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 truncate">
                        {acc.position}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Semua akun menggunakan password: <code className="text-brand-300 font-mono">password123</code>
        </div>
      </div>
    </div>
  );
};
