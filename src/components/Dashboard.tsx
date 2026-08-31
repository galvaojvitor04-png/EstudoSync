import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { preferences, sessions, goals } = useStore();
  const lang = t[preferences.language];

  // Prepare chart data (last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => s.date.startsWith(dateStr));
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      name: format(d, 'EEE'),
      minutes: totalMinutes,
    };
  });

  const totalMinutesThisWeek = chartData.reduce((acc, cur) => acc + cur.minutes, 0);
  const totalHours = (totalMinutesThisWeek / 60).toFixed(1);

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent'>{lang.appTitle} - {lang.dashboard}</h1>
          <p className='text-slate-500 dark:text-slate-400 text-sm'>{lang.weeklyProgress}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4">
        {/* Main Chart - Bento size: 2x2 */}
        <motion.div 
          className="col-span-1 md:col-span-2 md:row-span-2 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col relative overflow-hidden"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px]'></div>
          <div className='z-10 flex-1 flex flex-col'>
            <h2 className='text-xl font-medium mb-1 text-slate-900 dark:text-slate-200'>{lang.weeklyProgress}</h2>
            <div className="flex-1 w-full -ml-4 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={preferences.theme === 'dark' ? '#34D399' : '#10b981'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={preferences.theme === 'dark' ? '#34D399' : '#10b981'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={preferences.theme === 'dark' ? '#262626' : '#e5e7eb'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: preferences.theme === 'dark' ? '#0f172a' : '#ffffff', color: preferences.theme === 'dark' ? '#f8fafc' : '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#10b981', fontWeight: 600 }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorMinutes)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Goals Progress - Bento size: 1x2 */}
        <div className="col-span-1 md:col-span-1 md:row-span-2 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
          <h2 className='text-lg font-medium mb-4 text-slate-900 dark:text-slate-200'>{lang.goals}</h2>
          <div className='space-y-4 flex-1 overflow-y-auto pr-2'>
            {goals.map(goal => {
               const progress = Math.min((goal.currentHours / goal.targetHours) * 100, 100);
               return (
                 <div key={goal.id} className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium text-slate-800 dark:text-slate-300 truncate pr-2">{goal.title}</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className={cn("h-full rounded-full", progress >= 100 ? "bg-emerald-400" : "bg-blue-500")}
                     />
                   </div>
                   <p className='text-[10px] text-slate-500'>{goal.currentHours} / {goal.targetHours} {lang.hours}</p>
                 </div>
               )
            })}
            {goals.length === 0 && <p className="text-sm text-slate-500">{lang.noData}</p>}
          </div>
        </div>

        {/* Study Time - Bento size: 1x1 */}
        <motion.div 
          className="col-span-1 md:col-span-1 md:row-span-1 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 flex flex-col justify-between text-white shadow-lg shadow-blue-900/20"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider">{lang.studyTime}</h3>
          </div>
          <div>
            <p className="text-4xl font-bold mt-2">
              {totalHours} <span className="text-lg font-medium text-blue-200 lowercase">{lang.hours}</span>
            </p>
          </div>
        </motion.div>

        {/* Bottom Banner/Stats - Bento size: 2x1 */}
        <div className="col-span-1 md:col-span-2 md:row-span-1 bg-white dark:bg-[#161617] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex items-center">
           <div className='flex items-center gap-6 w-full'>
              <div className='flex-1'>
                 <h2 className='text-sm font-medium text-slate-400 mb-1 uppercase tracking-tighter'>{lang.monthlyReport}</h2>
                 <p className='text-xl font-semibold text-slate-900 dark:text-slate-200'>
                    {chartData.filter(d => d.minutes > 0).length} Dias Ativos
                 </p>
                 <p className='text-xs text-slate-500 mt-1'>nesta semana</p>
              </div>
              <div className='flex gap-2 h-16 items-end flex-1 justify-around px-4 border-l border-slate-200 dark:border-slate-800'>
                 {chartData.map((d, i) => {
                    const height = Math.max(10, Math.min(100, (d.minutes / 120) * 100)); // normalized to 2 hours
                    return (
                       <div key={i} className='w-full max-w-[12px] bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group' style={{ height: `${height}%` }}>
                          {d.minutes > 0 && <div className='absolute bottom-0 w-full bg-emerald-400 rounded-t-lg transition-all' style={{ height: '100%' }}></div>}
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
