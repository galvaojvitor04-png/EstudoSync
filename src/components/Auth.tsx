import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Fingerprint, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth({ onBiometricAuth }: { onBiometricAuth: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-slate-200 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#161617] rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[80px]"></div>
        
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              EstudoSync
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? 'Faça login para acessar seus dados.' : 'Crie sua conta para começar.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">ou acesso rápido</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button 
              onClick={onBiometricAuth}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 border border-slate-700"
            >
              <Fingerprint className="w-5 h-5 text-emerald-400" />
              Usar Biometria / FaceID
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-400 font-medium hover:underline">
              {isLogin ? 'Criar agora' : 'Fazer login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
