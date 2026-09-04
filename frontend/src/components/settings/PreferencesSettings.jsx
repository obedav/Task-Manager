// Preferences Settings Component
import { useState } from 'react';

export default function PreferencesSettings() {
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    colorScheme: 'purple',
    fontSize: 'medium',
    language: 'en',
    timezone: 'America/New_York'
  });

  const [taskPreferences, setTaskPreferences] = useState({
    defaultView: 'list',
    sortBy: 'dueDate',
    showCompleted: false,
    autoArchive: true,
    defaultPriority: 'medium',
    reminderTime: 30
  });

  const [workingHours, setWorkingHours] = useState({
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    breaks: true,
    breakDuration: 60
  });

  const [integrations, setIntegrations] = useState({
    calendar: true,
    email: false,
    slack: true,
    github: false,
    googleDrive: true
  });

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' }
  ];

  const colorSchemes = [
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' }
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (EST)' },
    { value: 'America/Chicago', label: 'Central Time (CST)' },
    { value: 'America/Denver', label: 'Mountain Time (MST)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
  ];

  const weekDays = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const handleAppearanceChange = (key, value) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  };

  const handleTaskPreferenceChange = (key, value) => {
    setTaskPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleWorkingHoursChange = (key, value) => {
    setWorkingHours(prev => ({ ...prev, [key]: value }));
  };

  const handleWorkDayToggle = (day) => {
    setWorkingHours(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  const handleIntegrationToggle = (integration) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: !prev[integration]
    }));
  };

  const handleSavePreferences = () => {
    console.log('Preferences saved:', {
      appearance,
      taskPreferences,
      workingHours,
      integrations
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800/60 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-8">Preferences</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Appearance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
                <div className="flex space-x-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleAppearanceChange('theme', theme.value)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        appearance.theme === theme.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{theme.icon}</span>
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Color Scheme</label>
                <div className="flex space-x-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => handleAppearanceChange('colorScheme', scheme.value)}
                      className={`w-8 h-8 rounded-full ${scheme.color} border-2 transition-all ${
                        appearance.colorScheme === scheme.value
                          ? 'border-white scale-110'
                          : 'border-gray-600 hover:scale-105'
                      }`}
                      title={scheme.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Font Size</label>
                <select
                  value={appearance.fontSize}
                  onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {fontSizes.map((size) => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Language</label>
                <select
                  value={appearance.language}
                  onChange={(e) => handleAppearanceChange('language', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-3">Timezone</label>
                <select
                  value={appearance.timezone}
                  onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Task Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Default View</label>
                <select
                  value={taskPreferences.defaultView}
                  onChange={(e) => handleTaskPreferenceChange('defaultView', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="list">List View</option>
                  <option value="board">Board View</option>
                  <option value="calendar">Calendar View</option>
                  <option value="timeline">Timeline View</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Sort By</label>
                <select
                  value={taskPreferences.sortBy}
                  onChange={(e) => handleTaskPreferenceChange('sortBy', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="created">Created Date</option>
                  <option value="updated">Last Updated</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Default Priority</label>
                <select
                  value={taskPreferences.defaultPriority}
                  onChange={(e) => handleTaskPreferenceChange('defaultPriority', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Reminder Time (minutes before)</label>
                <input
                  type="number"
                  value={taskPreferences.reminderTime}
                  onChange={(e) => handleTaskPreferenceChange('reminderTime', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="1440"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Show Completed Tasks</p>
                  <p className="text-sm text-gray-400">Display completed tasks in lists</p>
                </div>
                <button
                  onClick={() => handleTaskPreferenceChange('showCompleted', !taskPreferences.showCompleted)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    taskPreferences.showCompleted ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      taskPreferences.showCompleted ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Auto Archive</p>
                  <p className="text-sm text-gray-400">Automatically archive completed tasks after 30 days</p>
                </div>
                <button
                  onClick={() => handleTaskPreferenceChange('autoArchive', !taskPreferences.autoArchive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    taskPreferences.autoArchive ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      taskPreferences.autoArchive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Working Hours</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Enable Working Hours</p>
                  <p className="text-sm text-gray-400">Set your working schedule for better task planning</p>
                </div>
                <button
                  onClick={() => handleWorkingHoursChange('enabled', !workingHours.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    workingHours.enabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      workingHours.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {workingHours.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Start Time</label>
                      <input
                        type="time"
                        value={workingHours.startTime}
                        onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">End Time</label>
                      <input
                        type="time"
                        value={workingHours.endTime}
                        onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => handleWorkDayToggle(day.value)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            workingHours.workDays.includes(day.value)
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Integrations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(integrations).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium capitalize">{key}</p>
                    <p className="text-sm text-gray-400">
                      {key === 'calendar' && 'Sync with your calendar app'}
                      {key === 'email' && 'Email integration for task updates'}
                      {key === 'slack' && 'Connect with Slack for team collaboration'}
                      {key === 'github' && 'Link GitHub repositories and issues'}
                      {key === 'googleDrive' && 'Access files from Google Drive'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleIntegrationToggle(key)}
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

          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}