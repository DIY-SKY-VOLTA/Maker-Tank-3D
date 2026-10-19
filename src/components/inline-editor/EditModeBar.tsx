import React, { useState } from 'react';
import { Pencil, Eye, ShieldCheck, LogOut, LayoutDashboard, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandingThemeModal } from './BrandingThemeModal.tsx';

interface EditModeBarProps {
  onNavigateToAdmin: () => void;
}

export const EditModeBar: React.FC<EditModeBarProps> = ({ onNavigateToAdmin }) => {
  const { isAuthenticated, isEditMode, toggleEditMode, logout } = useAuth();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Strictly invisible to non-authenticated visitors
  if (!isAuthenticated) return null;

  return (
    <>
      <aside aria-label="Administrator Toolbar" className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-950/95 backdrop-blur-md text-white p-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-2xl border border-slate-800 text-xs font-sans animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
          <div className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-bold hidden sm:inline text-slate-200">
            Admin: {isEditMode ? 'Edit Mode ON' : 'Edit Mode OFF'}
          </span>
        </div>

        {/* Main Edit Website Toggle Button */}
        <button
          onClick={toggleEditMode}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs ${
            isEditMode
              ? 'bg-green-600 hover:bg-green-500 text-white ring-2 ring-green-400/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          <span>{isEditMode ? 'Exit Edit Mode' : 'Edit Website'}</span>
        </button>

        {/* Theme & Colors Customizer Button */}
        {isEditMode && (
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-green-400 hover:text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Change Logo, Button & Interface Colors"
          >
            <Palette className="w-3.5 h-3.5 text-green-400" />
            <span className="hidden sm:inline text-white">Colors &amp; Logo</span>
          </button>
        )}

        {/* Quick link to Dashboard */}
        <button
          onClick={onNavigateToAdmin}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center gap-1"
          title="Open Full Admin Dashboard"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">Dashboard</span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Sign Out as Admin"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </aside>

      <BrandingThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
};
