import { createContext, useContext, useReducer, useEffect } from 'react';

const SettingsContext = createContext();

const initialState = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatar: null
  },
  security: {
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true,
    suspiciousActivity: true,
    weeklyReports: false
  },
  notifications: {
    email: {
      taskUpdates: true,
      taskAssignments: true,
      taskDeadlines: true,
      projectUpdates: false,
      teamMessages: true,
      systemAlerts: true,
      weeklyDigest: true,
      monthlyReport: false
    },
    push: {
      taskUpdates: true,
      taskAssignments: true,
      taskDeadlines: true,
      projectUpdates: false,
      teamMessages: true,
      systemAlerts: false
    },
    preferences: {
      frequency: 'instant',
      quietHours: true,
      quietStart: '22:00',
      quietEnd: '08:00',
      weekendNotifications: false,
      soundEnabled: true,
      vibrationEnabled: true
    }
  },
  preferences: {
    appearance: {
      theme: 'dark',
      colorScheme: 'purple',
      fontSize: 'medium',
      language: 'en',
      timezone: 'America/New_York'
    },
    tasks: {
      defaultView: 'list',
      sortBy: 'dueDate',
      showCompleted: false,
      autoArchive: true,
      defaultPriority: 'medium',
      reminderTime: 30
    },
    workingHours: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      breaks: true,
      breakDuration: 60
    },
    integrations: {
      calendar: false,
      email: false,
      slack: false,
      github: false,
      googleDrive: false
    }
  },
  app: {
    dataRetention: 'forever',
    analytics: true,
    crashReporting: true,
    performanceMonitoring: false,
    betaFeatures: false,
    autoUpdates: true
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
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'UPDATE_SECURITY':
      return {
        ...state,
        security: { ...state.security, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'UPDATE_APP_SETTINGS':
      return {
        ...state,
        app: { ...state.app, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'LOAD_SETTINGS':
      return {
        ...state,
        ...action.payload,
        hasUnsavedChanges: false,
        isLoading: false
      };
    
    case 'SAVE_SUCCESS':
      return {
        ...state,
        lastSaved: new Date().toISOString(),
        hasUnsavedChanges: false,
        isLoading: false
      };
    
    case 'RESET_SETTINGS':
      return {
        ...initialState,
        hasUnsavedChanges: true
      };
    
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [settings, dispatch] = useReducer(settingsReducer, initialState);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (settings.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [settings.hasUnsavedChanges]);

  const loadSettings = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const savedSettings = localStorage.getItem('taskManagerSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ type: 'LOAD_SETTINGS', payload: parsedSettings });
      }
      
      const userToken = localStorage.getItem('authToken');
      if (userToken) {
        try {
          const response = await fetch('/api/user/settings', {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const serverSettings = await response.json();
            dispatch({ type: 'LOAD_SETTINGS', payload: serverSettings });
          }
        } catch (error) {
          console.warn('Could not load settings from server:', error);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveSettings = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      localStorage.setItem('taskManagerSettings', JSON.stringify(settings));
      
      const userToken = localStorage.getItem('authToken');
      if (userToken) {
        try {
          const response = await fetch('/api/user/settings', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
          });
          
          if (!response.ok) {
            throw new Error('Failed to save settings to server');
          }
        } catch (error) {
          console.warn('Could not save settings to server:', error);
        }
      }
      
      dispatch({ type: 'SAVE_SUCCESS' });
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const updateProfile = (updates) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const updateSecurity = (updates) => {
    dispatch({ type: 'UPDATE_SECURITY', payload: updates });
  };

  const updateNotifications = (updates) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: updates });
  };

  const updatePreferences = (updates) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  };

  const updateAppSettings = (updates) => {
    dispatch({ type: 'UPDATE_APP_SETTINGS', payload: updates });
  };

  const resetSettings = () => {
    dispatch({ type: 'RESET_SETTINGS' });
  };

  const value = {
    settings,
    updateProfile,
    updateSecurity,
    updateNotifications,
    updatePreferences,
    updateAppSettings,
    saveSettings,
    loadSettings,
    resetSettings,
    isLoading: settings.isLoading,
    hasUnsavedChanges: settings.hasUnsavedChanges,
    lastSaved: settings.lastSaved
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}