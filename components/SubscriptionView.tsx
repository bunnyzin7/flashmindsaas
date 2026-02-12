
import React from 'react';
import { Check, Zap, Sparkles, Brain, Clock, ShieldCheck } from 'lucide-react';
import { useUsage } from '../contexts/UsageContext';

const SubscriptionView: React.FC = () => {
  const { isPro } = useUsage();
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Potencialize seus Estudos</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          Escolha o plano ideal para sua jornada de aprendizado. Gere cards ilimitados com IA de última geração.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Basic Plan */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-400 mb-1">Gratuito</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-slate-800">R$ 0</span>
              <span className="text-slate-400 font-bold">/mês</span>
            </div>

            <ul className="space-y-5 mb-10">
              <Feature icon={<Check size={18} className="text-slate-400" />} text="Até 3 Decks de Flashcards" />
              <Feature icon={<Check size={18} className="text-slate-400" />} text="3 gerações de cards com IA mensal" />
              <Feature icon={<Check size={18} className="text-slate-400" />} text="Estatísticas básicas" />
              <Feature icon={<Check size={18} className="text-slate-400" />} text="Estudo via Web" />
            </ul>

            <button className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold transition-all opacity-50 cursor-not-allowed">
              Seu Plano Atual
            </button>
          </div>
        </div>

        {/* PRO Plan */}
        <div className="bg-[#0a0d24] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute top-6 right-8 bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30">
            Mais Popular
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-indigo-400 mb-1">Mind Pro</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-white">R$ 19,90</span>
              <span className="text-slate-400 font-bold">/mês</span>
            </div>

            <ul className="space-y-5 mb-10">
              <Feature icon={<Zap size={18} className="text-indigo-400" fill="#818cf8" />} text="Decks Ilimitados" className="text-white" />
              <Feature icon={<Sparkles size={18} className="text-indigo-400" fill="#818cf8" />} text="50 gerações de cards com IA mensal" className="text-white" />
              <Feature icon={<Brain size={18} className="text-indigo-400" fill="#818cf8" />} text="Algoritmo de Repetição Espaçada" className="text-white" />
              <Feature icon={<Clock size={18} className="text-indigo-400" fill="#818cf8" />} text="Estatísticas Detalhadas" className="text-white" />
              <Feature icon={<ShieldCheck size={18} className="text-indigo-400" fill="#818cf8" />} text="Backup em Nuvem" className="text-white" />
            </ul>

            {isPro ? (
              <button className="w-full bg-indigo-900/50 text-indigo-300 py-4 rounded-2xl font-bold border border-indigo-500/30 cursor-default">
                Plano Ativo
              </button>
            ) : (
              <a
                href="https://pay.kiwify.com.br/Bpt3Ody"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
              >
                Assinar Pro Agora
              </a>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; text: string; className?: string }> = ({ icon, text, className = "text-slate-600" }) => (
  <li className={`flex items-center gap-3 font-medium ${className}`}>
    <div className="shrink-0">{icon}</div>
    <span>{text}</span>
  </li>
);

export default SubscriptionView;
