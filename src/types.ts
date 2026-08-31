export type Theme = 'light' | 'dark';
export type Language = 'pt' | 'en';

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  date: string; // ISO format
}

export interface Goal {
  id: string;
  title: string;
  targetHours: number;
  currentHours: number;
  completed: boolean;
}

export interface UserPreferences {
  theme: Theme;
  language: Language;
  pushNotifications: boolean;
  biometricAuth: boolean;
  calendarSync: boolean;
  offlineMode: boolean;
}
