import { useState } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { Moon, Sun, Bell, Fingerprint, Calendar, WifiOff, Globe, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useGoogleLogin } from '@react-oauth/google';

export default function Settings() {
  const { preferences, updatePreferences } = useStore();
  const lang = t[preferences.language];
  const [syncing, setSyncing] = useState(false);

  const googleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (tokenResponse) => {
      setSyncing(true);
      try {
        // In a real app we'd sync sessions/goals here using tokenResponse.access_token
        // Mocking the sync process for the preview
        await new Promise(resolve => setTimeout(resolve, 1500));
        updatePreferences({ calendarSync: true });
        alert('Sincronização com Google Calendar ativada com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Erro ao sincronizar com calendário.');
      } finally {
        setSyncing(false);
      }
    },
    onError: error => {
      console.error(error);
      alert('Erro na autenticação com o Google.');
    }
  });

  const handleCalendarToggle = () => {
    if (!preferences.calendarSync) {
      googleLogin();
    } else {
      updatePreferences({ calendarSync: false });
    }
  };

  const SettingRow = ({ icon: Icon, title, description, control }: any) => (
    <div className="flex items-center justify-between p-6 bg-white dark:bg-[#161617] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
       <div className="flex items-center space-x-6 pr-4">
          <div className="p-4 bg-slate-50 dark:bg-[#0A0A0B]/50 rounded-2xl flex-shrink-0">
             <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
             <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-lg">{title}</h4>
             {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
       </div>
       <div className="flex-shrink-0">{control}</div>
    </div>
  );

  const Toggle = ({ checked, onChange, loading }: any) => (
    <button 
      onClick={onChange}
      disabled={loading}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 ${checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{lang.settings}</h2>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </button>
      </div>

      <div className="space-y-4">
        <SettingRow 
          icon={preferences.theme === 'dark' ? Moon : Sun}
          title={lang.theme}
          description="Alternar modo escuro"
          control={
            <Toggle 
              checked={preferences.theme === 'dark'} 
              onChange={() => updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })} 
            />
          }
        />
        
        <SettingRow 
          icon={Globe}
          title={lang.language}
          description="Inglês ou Português"
          control={
            <select 
               value={preferences.language}
               onChange={(e) => updatePreferences({ language: e.target.value as any })}
               className="bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-200"
            >
               <option value="pt">Português</option>
               <option value="en">English</option>
            </select>
          }
        />

        <SettingRow 
          icon={Bell}
          title={lang.pushNotifications}
          description="Lembretes de prazos e conclusão de metas."
          control={<Toggle checked={preferences.pushNotifications} onChange={() => updatePreferences({ pushNotifications: !preferences.pushNotifications })} />}
        />

        <SettingRow 
          icon={Fingerprint}
          title={lang.biometrics}
          description="Proteger dados pessoais (FaceID / TouchID)."
          control={<Toggle checked={preferences.biometricAuth} onChange={() => updatePreferences({ biometricAuth: !preferences.biometricAuth })} />}
        />

        <SettingRow 
          icon={Calendar}
          title={lang.calendarSync}
          description="Google Calendar (Sincronizar Sessões/Metas)."
          control={<Toggle checked={preferences.calendarSync} loading={syncing} onChange={handleCalendarToggle} />}
        />

        <SettingRow 
          icon={WifiOff}
          title={lang.offlineMode}
          description="Acesso a Biblioteca e Metas sem internet."
          control={<Toggle checked={preferences.offlineMode} onChange={() => updatePreferences({ offlineMode: !preferences.offlineMode })} />}
        />
      </div>
    </div>
  );
}
