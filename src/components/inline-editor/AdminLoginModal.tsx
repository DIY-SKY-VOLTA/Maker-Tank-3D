import React, { useState } from 'react';
import { X, Lock, AlertCircle, Loader2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, error } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    try {
      setIsSubmitting(true);
      const success = await login(password, username);
      if (success) {
        setPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-950">
              Staff &amp; Admin Sign In
            </h3>
          </div>
          <button
            onClick={closeLoginModal}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Authorized personnel sign-in for store content management and system administration.
        </p>

        {error && (
          <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 font-medium"
              />
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                required
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 font-mono"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeLoginModal}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
