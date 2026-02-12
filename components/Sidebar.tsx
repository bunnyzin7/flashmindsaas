import React from 'react';
import { Library, Sparkles, BarChart2, CreditCard, Zap, LogOut, PlusCircle } from 'lucide-react';
import { TabType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUsage } from '../contexts/UsageContext';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCreateCard: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenCreateCard }) => {
  const { signOut } = useAuth();
  const menuItems = [
    { id: 'library', label: 'Biblioteca', icon: Library },
    { id: 'ai-generator', label: 'Gerar com IA', icon: Sparkles },
    { id: 'statistics', label: 'Estatísticas', icon: BarChart2 },
    { id: 'subscription', label: 'Assinatura', icon: CreditCard },
  ];

  const { usageCount, limit } = useUsage();

  // Calculate percentage for progress bar, capped at 100%
  const percentage = Math.min((usageCount / limit) * 100, 100);

  return (
    <aside className="w-64 bg-[#0a0d24] text-white flex flex-col h-screen shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={22} fill="white" />
          </div>
          <span className="text-xl font-bold tracking-tight">FlashMind IA</span>
        </div>

        <nav className="space-y-6">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={20} className={isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <button
              onClick={onOpenCreateCard}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-200 border border-indigo-600/20 group"
            >
              <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">Novo Card</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plano Gratuito</span>
            <span className="text-[10px] font-bold text-indigo-400">Upgrade</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">Você usou {usageCount}/{limit} usos de IA este mês.</p>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
      >
        <LogOut size={20} />
        <span className="font-medium">Sair</span>
      </button>
    </aside>
  );
};

export default Sidebar;
