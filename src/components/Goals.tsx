import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Goals() {
  const { preferences, goals, addGoal, toggleGoal, deleteGoal } = useStore();
  const lang = t[preferences.language];
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newTarget) {
      addGoal({
        id: Date.now().toString(),
        title: newTitle,
        targetHours: parseFloat(newTarget),
        currentHours: 0,
        completed: false
      });
      setNewTitle('');
      setNewTarget('');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{lang.goals}</h2>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
         <input 
           type="text" 
           placeholder={lang.goalTitle}
           value={newTitle}
           onChange={(e) => setNewTitle(e.target.value)}
           className="flex-1 bg-white dark:bg-[#161617] border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
         />
         <div className="flex gap-4">
           <input 
             type="number" 
             placeholder={lang.targetHours}
             value={newTarget}
             onChange={(e) => setNewTarget(e.target.value)}
             className="w-32 bg-white dark:bg-[#161617] border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
           />
           <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl transition-colors shadow-sm flex-shrink-0">
              <Plus className="w-6 h-6" />
           </button>
         </div>
      </form>

      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-[#161617] border border-slate-200 dark:border-slate-800 rounded-3xl transition-all shadow-sm",
                goal.completed && "opacity-60 bg-slate-50 dark:bg-[#0A0A0B]/50"
              )}
            >
               <div className="flex items-center space-x-4 flex-1">
                  <button onClick={() => toggleGoal(goal.id)} className="text-slate-300 dark:text-slate-700 hover:text-blue-500 dark:hover:text-blue-500 transition-colors flex-shrink-0">
                    {goal.completed ? <CheckCircle2 className="w-8 h-8 text-blue-500" /> : <Circle className="w-8 h-8" />}
                  </button>
                  <div className={cn("transition-all", goal.completed && "line-through text-slate-500")}>
                     <h4 className="font-semibold text-lg text-slate-900 dark:text-slate-200">{goal.title}</h4>
                     <p className="text-sm text-slate-500 mt-1">{goal.currentHours} / {goal.targetHours} {lang.hours}</p>
                  </div>
               </div>
               
               <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all p-2 mt-4 sm:mt-0 self-end sm:self-auto">
                 <Trash2 className="w-5 h-5" />
               </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
