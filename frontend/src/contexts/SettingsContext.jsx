import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

const initialState = {
  profile: {
    firstName: '', lastName: '', email: '', phone: '',
    bio: '', location: '', website: '', avatar: null
  },
  security: {
    twoFactorEnabled: false, emailNotifications: true,
    loginAlerts: true, suspiciousActivity: true, weeklyReports: false
  },
  notifications: {
    email: {
      taskUpdates: true, taskAssignments: true, taskDeadlines: true,
      projectUpdates: false, teamMessages: true, systemAlerts: true,
      weeklyDigest: true, monthlyReport: false
    },
    push: {
      taskUpdates: true, taskAssignments: true, taskDeadlines: true,
      projectUpdates: false, teamMessages: true, systemAlerts: false
    },
    preferences: {
      frequency: 'instant', quietHours: true, quietStart: '22:00',
      quietEnd: '08:00', weekendNotifications: false,
      soundEnabled: true, vibrationEnabled: true
    }
  },
  preferences: {
    appearance: { theme: 'auto', colorScheme: 'royal', fontSize: 'medium', language: 'en', timezone: 'America/New_York' },
    tasks: { defaultView: 'list', sortBy: 'dueDate', showCompleted: false, autoArchive: true, defaultPriority: 'medium', reminderTime: 30 },
    workingHours: { enabled: false, startTime: '09:00', endTime: '17:00', workDays: ['monday','tuesday','wednesday','thursday','friday'] },
    integrations: { calendar: false, email: false, slack: false, github: false, googleDrive: false }
  },
  app: {
    autoSave: true, offlineMode: false, syncFrequency: 'realtime',
    autoBackup: true, backupFrequency: 'daily', analytics: false,
    crashReporting: true, usageData: false, debugMode: false,
    experimentalFeatures: false, logLevel: 'error'
  },
  isLoading: false,
  lastSaved: null,
  hasUnsavedChanges: false
};

function settingsReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload }, hasUnsavedChanges: true };
    case 'UPDATE_SECURITY':
      return { ...state, security: { ...state.security, ...action.payload }, hasUnsavedChanges: true };
    case 'UPDATE_NOTIFICATIONS':
      return { ...state, notifications: { ...state.notifications, ...action.payload }, hasUnsavedChanges: true };
    case 'UPDATE_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload }, hasUnsavedChanges: true };
    case 'UPDATE_APP_SETTINGS':
      return { ...state, app: { ...state.app, ...action.payload }, hasUnsavedChanges: true };
    case 'LOAD_SETTINGS':
      return { ...state, ...action.payload, hasUnsavedChanges: false, isLoading: false };
    case 'SAVE_SUCCESS':
      return { ...state, lastSaved: new Date().toISOString(), hasUnsavedChanges: false, isLoading: false };
    case 'RESET_SETTINGS':
      return { ...initialState, hasUnsavedChanges: true };
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [settings, dispatch] = useReducer(settingsReducer, initialState);

  useEffect(() => { loadSettings(); }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (settings.hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [settings.hasUnsavedChanges]);

  const loadSettings = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.get('/user/settings');
      if (res.success && res.data && Object.keys(res.data).length > 0) {
        dispatch({ type: 'LOAD_SETTINGS', payload: res.data });
      }
    } catch {
      // Not authenticated yet or server unavailable — use defaults silently
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveSettings = async (sectionOverride = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { isLoading, lastSaved, hasUnsavedChanges, ...data } = settings;
      if (sectionOverride) {
        // Patch just one section for targeted saves
        const [section, payload] = sectionOverride;
        await api.patch(`/user/settings/${section}`, payload);
      } else {
        await api.put('/user/settings', data);
      }
      dispatch({ type: 'SAVE_SUCCESS' });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: err.message };
    }
  };

  const saveSection = (section, payload) => saveSettings([section, payload]);

  const value = {
    settings,
    updateProfile:      (u) => dispatch({ type: 'UPDATE_PROFILE',      payload: u }),
    updateSecurity:     (u) => dispatch({ type: 'UPDATE_SECURITY',     payload: u }),
    updateNotifications:(u) => dispatch({ type: 'UPDATE_NOTIFICATIONS',payload: u }),
    updatePreferences:  (u) => dispatch({ type: 'UPDATE_PREFERENCES',  payload: u }),
    updateAppSettings:  (u) => dispatch({ type: 'UPDATE_APP_SETTINGS', payload: u }),
    saveSettings,
    saveSection,
    loadSettings,
    resetSettings: () => dispatch({ type: 'RESET_SETTINGS' }),
    isLoading: settings.isLoading,
    hasUnsavedChanges: settings.hasUnsavedChanges,
    lastSaved: settings.lastSaved
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
