import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const { user, profile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const displayName = profile?.full_name?.split(' ')[0] || 'Estudante';
  const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : (user?.email?.[0].toUpperCase() || 'U');
  const avatarStyle = profile?.avatar_url || 'bg-indigo-100 text-indigo-600 border-indigo-200';

  return (
    <>
      <header className="px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Painel do Estudante</p>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            Bem-vindo de volta, {displayName} <span className="text-2xl">👋</span>
          </h1>
        </div>


        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-transform hover:scale-105 active:scale-95 ${avatarStyle}`}
          >
            {initial}
          </button>
        </div>
      </header>

      {isProfileModalOpen && (
        <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </>
  );
}
