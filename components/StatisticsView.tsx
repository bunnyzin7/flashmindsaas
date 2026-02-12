import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Clock, Target, Calendar, Loader2 } from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';
import { ProFeatureOverlay } from './ProFeatureOverlay';

interface StatisticsViewProps {
  onNavigateToSubscription?: () => void;
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ onNavigateToSubscription }) => {
  const { stats, loading } = useStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-20">
        <Loader2 size={40} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-slate-800">Sem dados ainda</h2>
        <p className="text-slate-500">Comece a estudar para ver suas estatísticas aqui!</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Seu Desempenho</h2>
        <p className="text-slate-500 font-medium">Veja como seu conhecimento está evoluindo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ProFeatureOverlay onSubscribeClick={onNavigateToSubscription}>
          <StatCard
            icon={<TrendingUp size={24} />}
            color="text-emerald-500"
            bg="bg-emerald-50"
            label="Retenção Média"
            value={`${stats.averageRetention}%`}
            subValue="Geral"
          />
        </ProFeatureOverlay>
        <StatCard
          icon={<Clock size={24} />}
          color="text-blue-500"
          bg="bg-blue-50"
          label="Tempo de Estudo"
          value={`${(stats.totalStudyTime / 60).toFixed(1)}m`}
          subValue="Total"
        />
        <StatCard
          icon={<Target size={24} />}
          color="text-purple-500"
          bg="bg-purple-50"
          label="Cards Revisados"
          value={stats.totalCardsReviewed.toString()}
          subValue="Total"
        />
        <StatCard
          icon={<Calendar size={24} />}
          color="text-amber-500"
          bg="bg-amber-50"
          label="Ofensiva (Streak)"
          value={`${stats.streak} dias`}
          subValue="Ativo recente"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProFeatureOverlay onSubscribeClick={onNavigateToSubscription}>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-8">Atividade de Revisão (7 Dias)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="cards" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ProFeatureOverlay>

        <ProFeatureOverlay onSubscribeClick={onNavigateToSubscription}>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-8">Curva de Aprendizado</h3>
            <div className="h-[300px] w-full">
              {/* Using same data for now, ideally would be different */}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyActivity}>
                  <defs>
                    <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="cards" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCards)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ProFeatureOverlay>
      </div>
    </div>
  );
};


interface StatCardProps {
  icon: React.ReactNode;
  color: string;
  bg: string;
  label: string;
  value: string;
  subValue: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, color, bg, label, value, subValue }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-extrabold text-slate-800 mb-1">{value}</p>
    <p className="text-xs font-medium text-slate-500">{subValue}</p>
  </div>
);

export default StatisticsView;
