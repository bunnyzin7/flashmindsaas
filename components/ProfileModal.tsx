
import React, { useState, useEffect } from 'react';
import { X, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
    onClose: () => void;
}

const AVATAR_COLORS = [
    'bg-indigo-100 text-indigo-600 border-indigo-200',
    'bg-purple-100 text-purple-600 border-purple-200',
    'bg-pink-100 text-pink-600 border-pink-200',
    'bg-rose-100 text-rose-600 border-rose-200',
    'bg-orange-100 text-orange-600 border-orange-200',
    'bg-amber-100 text-amber-600 border-amber-200',
    'bg-emerald-100 text-emerald-600 border-emerald-200',
    'bg-teal-100 text-teal-600 border-teal-200',
    'bg-cyan-100 text-cyan-600 border-cyan-200',
    'bg-blue-100 text-blue-600 border-blue-200',
];

export default function ProfileModal({ onClose }: ProfileModalProps) {
    const { profile, updateProfile, user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            if (profile.avatar_url && AVATAR_COLORS.includes(profile.avatar_url)) {
                setSelectedColor(profile.avatar_url);
            }
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile({
                full_name: fullName,
                avatar_url: selectedColor,
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const initial = fullName ? fullName[0].toUpperCase() : (user?.email?.[0].toUpperCase() || 'U');

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Seu Perfil</h2>
                        <p className="text-slate-500 text-sm">Personalize como você aparece no app.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex justify-center mb-8">
                    <div className={`w-24 h-24 rounded-full ${selectedColor} border-4 flex items-center justify-center text-3xl font-bold shadow-xl`}>
                        {initial}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Cor do Avatar
                        </label>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {AVATAR_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full ${color.split(' ')[0]} border-2 transition-all ${selectedColor === color ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-110'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Nome Completo
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                placeholder="Seu nome"
                            />
                            <User size={18} className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                'Salvar Alterações'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
