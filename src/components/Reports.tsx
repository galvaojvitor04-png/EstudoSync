import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { motion } from 'motion/react';

export default function Reports() {
  const { preferences, sessions, goals } = useStore();
  const lang = t[preferences.language];

  // Prepare monthly data
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthlyData = daysInMonth.map(d => {
    const daySessions = sessions.filter(s => isSameDay(new Date(s.date), d));
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      date: format(d, 'dd/MM'),
      hours: +(totalMinutes / 60).toFixed(1)
    };
  });

  const totalMonthlyHours = monthlyData.reduce((acc, cur) => acc + cur.hours, 0);
  const activeDaysCount = monthlyData.filter(d => d.hours > 0).length;
  
  // Consistency % (Active days / total days up to today)
  const daysPassed = today.getDate();
  const consistency = Math.round((activeDaysCount / daysPassed) * 100);

  // Subject distribution
  const subjectData: Record<string, number> = {};
  sessions.forEach(s => {
    const subj = s.subject || 'Geral';
    if (!subjectData[subj]) subjectData[subj] = 0;
    subjectData[subj] += s.durationMinutes;
  });
  const subjectChartData = Object.entries(subjectData).map(([name, mins]) => ({ name, hours: +(mins / 60).toFixed(1) })).sort((a,b) => b.hours - a.hours).slice(0, 5);

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className='flex justify-between items-end gap-4'>
        <div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent'>Relatórios Avançados</h1>
          <p className='text-slate-500 dark:text-slate-400 text-sm'>Análise de Desempenho Mensal</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Key Metrics */}
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-2 gap-4">
           <div className="bg-slate-50 dark:bg-[#0A0A0B] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
             <p className="text-slate-500 text-xs uppercase mb-1">Horas no Mês</p>
             <p className="text-3xl font-semibold text-blue-500">{totalMonthlyHours.toFixed(1)}h</p>
           </div>
           <div className="bg-slate-50 dark:bg-[#0A0A0B] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
             <p className="text-slate-500 text-xs uppercase mb-1">Dias Ativos</p>
             <p className="text-3xl font-semibold text-emerald-500">{activeDaysCount}</p>
           </div>
           <div className="bg-slate-50 dark:bg-[#0A0A0B] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 col-span-2">
             <p className="text-slate-500 text-xs uppercase mb-1">Taxa de Consistência</p>
             <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold text-indigo-400">{consistency}%</p>
                <div className="w-3/4 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${consistency}%` }} />
                </div>
             </div>
           </div>
        </div>

        {/* Subject Distribution */}
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
          <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-slate-200">Foco por Matéria</h2>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={preferences.theme === 'dark' ? '#262626' : '#e5e7eb'} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={80} />
                <Tooltip 
                  cursor={{ fill: preferences.theme === 'dark' ? '#0f172a' : '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: preferences.theme === 'dark' ? '#171717' : '#ffffff', color: preferences.theme === 'dark' ? '#ffffff' : '#000000', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full Month Area Chart */}
        <div className="col-span-1 md:col-span-4 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col" style={{ minHeight: '300px' }}>
          <h2 className="text-lg font-medium mb-6 text-slate-900 dark:text-slate-200">Evolução Mensal</h2>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={preferences.theme === 'dark' ? '#818cf8' : '#6366f1'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={preferences.theme === 'dark' ? '#818cf8' : '#6366f1'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={preferences.theme === 'dark' ? '#262626' : '#e5e7eb'} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} interval="preserveStartEnd" minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: preferences.theme === 'dark' ? '#0f172a' : '#ffffff', color: preferences.theme === 'dark' ? '#f8fafc' : '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="hours" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorMonth)" activeDot={{ r: 6, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
