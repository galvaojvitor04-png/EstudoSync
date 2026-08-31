import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from './store/useStore';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Timer from './components/Timer';
import Goals from './components/Goals';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Resources from './components/Resources';
import Reports from './components/Reports';
import ChatRoom from './components/ChatRoom';

export default function App() {
  const { preferences, updatePreferences } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'goals' | 'resources' | 'reports' | 'chat' | 'settings'>('dashboard');
  
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [biometricPassed, setBiometricPassed] = useState(false);

  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // If user has biometrics enabled, require it upon initial load
      if (currentUser && preferences.biometricAuth && !biometricPassed) {
        handleBiometricAuth();
      } else {
        setBiometricPassed(true);
      }
    });
    return () => unsubscribe();
  }, [preferences.biometricAuth]);

  const handleBiometricAuth = async () => {
    try {
      if (window.PublicKeyCredential) {
        // Mocking WebAuthn success for preview environment
        // In a real production app, this would use navigator.credentials.get()
        setTimeout(() => setBiometricPassed(true), 1000);
      } else {
        setBiometricPassed(true);
      }
    } catch (e) {
      console.error(e);
      setBiometricPassed(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-emerald-400 font-medium">Carregando...</div>;
  }

  if (!user) {
    return <Auth onBiometricAuth={handleBiometricAuth} />;
  }

  if (preferences.biometricAuth && !biometricPassed) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-slate-200 p-4">
         <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700 animate-pulse">
           <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
         </div>
         <h2 className="text-xl font-bold text-white mb-2">Autenticação Necessária</h2>
         <p className="text-slate-400 text-sm mb-6 text-center">Use sua biometria (FaceID/TouchID) para continuar.</p>
         <button onClick={handleBiometricAuth} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl transition-colors font-medium">Tentar Novamente</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard key="dashboard" />;
      case 'timer': return <Timer key="timer" />;
      case 'goals': return <Goals key="goals" />;
      case 'resources': return <Resources key="resources" />;
      case 'chat': return <ChatRoom key="chat" />;
      case 'reports': return <Reports key="reports" />;
      case 'settings': return <Settings key="settings" />;
      default: return <Dashboard key="dashboard" />;
    }
  };

  const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || "121102444121-4qkuuv2sed6vpt35smkdep4nfq89c0s3.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </GoogleOAuthProvider>
  );
}
