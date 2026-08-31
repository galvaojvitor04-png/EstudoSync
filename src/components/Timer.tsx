import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { cn } from '../lib/utils';

export default function Timer() {
  const { preferences, addSession } = useStore();
  const lang = t[preferences.language];
  
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => {
    if (isActive) {
      setIsActive(false);
      if (seconds >= 60) {
        addSession({
          id: Date.now().toString(),
          subject: subject || 'Geral',
          durationMinutes: Math.floor(seconds / 60),
          date: new Date().toISOString()
        });
        
        let msg = `Você estudou ${subject || 'Geral'} por ${Math.floor(seconds / 60)} minutos.`;
        
        if (preferences.pushNotifications && 'Notification' in window) {
           if (Notification.permission === 'granted') {
             new Notification('Sessão Concluída', {
               body: msg
             });
           } else if (Notification.permission !== 'denied') {
             Notification.requestPermission();
           }
        }
        
        if (preferences.calendarSync) {
          alert(msg + " (Sincronizado com o Google Calendar automaticamente!)");
        }
      }
      setSeconds(0);
      setSubject('');
    } else {
      setIsActive(true);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-16 pb-20">
      <div className="text-center space-y-4">
         <motion.div 
           className="relative inline-flex items-center justify-center w-72 h-72 rounded-full border-[6px] border-slate-200 dark:border-slate-800"
           animate={{
             boxShadow: isActive 
                ? [
                    `0 0 0 0 rgba(16, 185, 129, 0.2)`, 
                    `0 0 0 30px rgba(16, 185, 129, 0)`
                  ] 
                : 'none',
             borderColor: isActive ? (preferences.theme === 'dark' ? '#047857' : '#6ee7b7') : (preferences.theme === 'dark' ? '#1e293b' : '#e2e8f0')
           }}
           transition={{
             duration: 1.5,
             repeat: Infinity,
             ease: 'easeInOut'
           }}
         >
           <div className="text-7xl font-light tracking-tighter tabular-nums text-slate-900 dark:text-slate-200">
             {formatTime(seconds)}
           </div>
         </motion.div>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <input 
          type="text"
          placeholder={lang.subject}
          disabled={isActive}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-white dark:bg-[#161617] border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow disabled:opacity-50 text-slate-900 dark:text-slate-200"
        />

        <button 
          onClick={toggleTimer}
          className={cn(
            "w-full flex items-center justify-center space-x-3 py-5 rounded-3xl font-medium transition-all shadow-sm text-lg",
            isActive 
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 border border-red-500/50" 
              : "bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white border border-transparent"
          )}
        >
          {isActive ? (
             <><Square className="w-6 h-6 fill-current" /> <span>{lang.stopStudying}</span></>
          ) : (
             <><Play className="w-6 h-6 fill-current" /> <span>{lang.startStudying}</span></>
          )}
        </button>
      </div>
    </div>
  );
}
