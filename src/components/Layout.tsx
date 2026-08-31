import { LayoutDashboard, Timer as TimerIcon, Target, Settings as SettingsIcon, CloudOff, RefreshCw, Menu, X, Book, BarChart2, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { cn } from '../lib/utils';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children, activeTab, setActiveTab }: any) {
  const { preferences } = useStore();
  const lang = t[preferences.language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: lang.dashboard },
    { id: 'timer', icon: TimerIcon, label: lang.timer },
    { id: 'goals', icon: Target, label: lang.goals },
    { id: 'resources', icon: Book, label: 'Biblioteca' },
    { id: 'chat', icon: MessageSquare, label: 'Salas' },
    { id: 'reports', icon: BarChart2, label: 'Relatórios' },
    { id: 'settings', icon: SettingsIcon, label: lang.settings },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{lang.appTitle}</h1>
        <button className="md:hidden p-2 text-slate-500" onClick={() => setMobileMenuOpen(false)}>
           <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-blue-50 dark:bg-[#0A0A0B]/50 text-blue-600 dark:text-emerald-400 shadow-sm border border-transparent dark:border-slate-800 font-medium" 
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          {preferences.offlineMode ? (
            <><CloudOff className="w-4 h-4" /> <span>{lang.offlineMode}</span></>
          ) : (
            <><RefreshCw className="w-4 h-4 animate-spin-slow" /> <span>{lang.syncing}</span></>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-slate-200 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161617] flex-col transition-colors">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
         {mobileMenuOpen && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setMobileMenuOpen(false)}
                 className="fixed inset-0 bg-black/50 z-40 md:hidden"
               />
               <motion.aside 
                 initial={{ x: '-100%' }}
                 animate={{ x: 0 }}
                 exit={{ x: '-100%' }}
                 transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                 className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#161617] border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col md:hidden"
               >
                 <SidebarContent />
               </motion.aside>
            </>
         )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161617]">
           <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
             <Menu className="w-6 h-6" />
           </button>
           <h1 className="text-lg font-bold ml-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{lang.appTitle}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
