// Notification Settings Component
import { useState } from 'react';

export default function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState({
    taskUpdates: true,
    taskAssignments: true,
    taskDeadlines: true,
    projectUpdates: false,
    teamMessages: true,
    systemAlerts: true,
    weeklyDigest: true,
    monthlyReport: false
  });

  const [pushNotifications, setPushNotifications] = useState({
    taskUpdates: true,
    taskAssignments: true,
    taskDeadlines: true,
    projectUpdates: false,
    teamMessages: true,
    systemAlerts: false
  });

  const [preferences, setPreferences] = useState({
    frequency: 'instant',
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    weekendNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true
  });

  const handleEmailToggle = (key) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePushToggle = (key) => {
    setPushNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Notification settings saved:', {
      emailNotifications,
      pushNotifications,
      preferences
    });
  };

  const toggleAll = (type, state) => {
    if (type === 'email') {
      const newState = {};
      Object.keys(emailNotifications).forEach(key => {
        newState[key] = state;
      });
      setEmailNotifications(newState);
    } else if (type === 'push') {
      const newState = {};
      Object.keys(pushNotifications).forEach(key => {
        newState[key] = state;
      });
      setPushNotifications(newState);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800/60 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-8">Notification Settings</h2>
        
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Email Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleAll('email', true)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                >
                  Enable All
                </button>
                <button
                  onClick={() => toggleAll('email', false)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  Disable All
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(emailNotifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-400">
                      {key === 'taskUpdates' && 'Get notified when tasks are updated'}
                      {key === 'taskAssignments' && 'Receive emails when tasks are assigned to you'}
                      {key === 'taskDeadlines' && 'Reminders for upcoming task deadlines'}
                      {key === 'projectUpdates' && 'Updates about project progress and changes'}
                      {key === 'teamMessages' && 'Messages from team members'}
                      {key === 'systemAlerts' && 'Important system notifications'}
                      {key === 'weeklyDigest' && 'Weekly summary of your tasks and progress'}
                      {key === 'monthlyReport' && 'Monthly productivity and performance report'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEmailToggle(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Push Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleAll('push', true)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                >
                  Enable All
                </button>
                <button
                  onClick={() => toggleAll('push', false)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  Disable All
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(pushNotifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-400">
                      {key === 'taskUpdates' && 'Push notifications for task updates'}
                      {key === 'taskAssignments' && 'Instant alerts for new task assignments'}
                      {key === 'taskDeadlines' && 'Push reminders for deadlines'}
                      {key === 'projectUpdates' && 'Project milestone notifications'}
                      {key === 'teamMessages' && 'Team communication alerts'}
                      {key === 'systemAlerts' && 'Critical system notifications'}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePushToggle(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Notification Frequency</label>
                <div className="flex space-x-4">
                  {['instant', 'daily', 'weekly'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handlePreferenceChange('frequency', freq)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        preferences.frequency === freq
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Quiet Hours</label>
                    <button
                      onClick={() => handlePreferenceChange('quietHours', !preferences.quietHours)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.quietHours ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.quietHours ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {preferences.quietHours && (
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        value={preferences.quietStart}
                        onChange={(e) => handlePreferenceChange('quietStart', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-400 self-center">to</span>
                      <input
                        type="time"
                        value={preferences.quietEnd}
                        onChange={(e) => handlePreferenceChange('quietEnd', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Weekend Notifications</label>
                    <button
                      onClick={() => handlePreferenceChange('weekendNotifications', !preferences.weekendNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.weekendNotifications ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.weekendNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Sound Notifications</label>
                    <button
                      onClick={() => handlePreferenceChange('soundEnabled', !preferences.soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.soundEnabled ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Vibration</label>
                    <button
                      onClick={() => handlePreferenceChange('vibrationEnabled', !preferences.vibrationEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.vibrationEnabled ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}