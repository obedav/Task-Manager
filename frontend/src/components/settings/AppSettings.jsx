// App Settings Component
import { useState } from 'react';

export default function AppSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    autoSave: true,
    offlineMode: false,
    syncFrequency: 'realtime',
    cacheSize: 100,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [performance, setPerformance] = useState({
    animationsEnabled: true,
    reducedMotion: false,
    lazyLoading: true,
    prefetchData: false,
    compressionLevel: 'medium'
  });

  const [privacy, setPrivacy] = useState({
    analytics: false,
    crashReporting: true,
    usageData: false,
    locationTracking: false,
    cookiePreferences: 'essential'
  });

  const [advanced, setAdvanced] = useState({
    debugMode: false,
    experimentalFeatures: false,
    apiTimeout: 30,
    maxRetries: 3,
    logLevel: 'error'
  });

  const [storage, setStorage] = useState({
    used: 45.2,
    total: 100,
    cacheSize: 12.8,
    documentsSize: 28.5,
    mediaSize: 3.9
  });

  const handleGeneralChange = (key, value) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePerformanceChange = (key, value) => {
    setPerformance(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const handleAdvancedChange = (key, value) => {
    setAdvanced(prev => ({ ...prev, [key]: value }));
  };

  const clearCache = () => {
    setStorage(prev => ({ ...prev, cacheSize: 0 }));
    console.log('Cache cleared');
  };

  const exportData = () => {
    console.log('Exporting app data...');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      console.log('Settings reset to default');
    }
  };

  const checkUpdates = () => {
    console.log('Checking for updates...');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800/60 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-8">App Settings</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">General</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Auto Save</p>
                  <p className="text-sm text-gray-400">Automatically save changes as you work</p>
                </div>
                <button
                  onClick={() => handleGeneralChange('autoSave', !generalSettings.autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    generalSettings.autoSave ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      generalSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Offline Mode</p>
                  <p className="text-sm text-gray-400">Enable offline functionality</p>
                </div>
                <button
                  onClick={() => handleGeneralChange('offlineMode', !generalSettings.offlineMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    generalSettings.offlineMode ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      generalSettings.offlineMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Auto Backup</p>
                  <p className="text-sm text-gray-400">Automatically backup your data</p>
                </div>
                <button
                  onClick={() => handleGeneralChange('autoBackup', !generalSettings.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    generalSettings.autoBackup ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      generalSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Sync Frequency</label>
                  <select
                    value={generalSettings.syncFrequency}
                    onChange={(e) => handleGeneralChange('syncFrequency', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="5min">Every 5 minutes</option>
                    <option value="15min">Every 15 minutes</option>
                    <option value="30min">Every 30 minutes</option>
                    <option value="1hour">Every hour</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Backup Frequency</label>
                  <select
                    value={generalSettings.backupFrequency}
                    onChange={(e) => handleGeneralChange('backupFrequency', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Performance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Animations</p>
                  <p className="text-sm text-gray-400">Enable smooth animations and transitions</p>
                </div>
                <button
                  onClick={() => handlePerformanceChange('animationsEnabled', !performance.animationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    performance.animationsEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      performance.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Reduced Motion</p>
                  <p className="text-sm text-gray-400">Minimize motion for accessibility</p>
                </div>
                <button
                  onClick={() => handlePerformanceChange('reducedMotion', !performance.reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    performance.reducedMotion ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      performance.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Lazy Loading</p>
                  <p className="text-sm text-gray-400">Load content as needed to improve performance</p>
                </div>
                <button
                  onClick={() => handlePerformanceChange('lazyLoading', !performance.lazyLoading)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    performance.lazyLoading ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      performance.lazyLoading ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Prefetch Data</p>
                  <p className="text-sm text-gray-400">Preload data to reduce loading times</p>
                </div>
                <button
                  onClick={() => handlePerformanceChange('prefetchData', !performance.prefetchData)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    performance.prefetchData ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      performance.prefetchData ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Compression Level</label>
                <select
                  value={performance.compressionLevel}
                  onChange={(e) => handlePerformanceChange('compressionLevel', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Privacy</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Analytics</p>
                  <p className="text-sm text-gray-400">Help improve the app by sharing usage analytics</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('analytics', !privacy.analytics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy.analytics ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Crash Reporting</p>
                  <p className="text-sm text-gray-400">Automatically send crash reports to help fix issues</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('crashReporting', !privacy.crashReporting)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy.crashReporting ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy.crashReporting ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Usage Data</p>
                  <p className="text-sm text-gray-400">Share anonymous usage data for product improvements</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('usageData', !privacy.usageData)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy.usageData ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy.usageData ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Location Tracking</p>
                  <p className="text-sm text-gray-400">Allow location-based features</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('locationTracking', !privacy.locationTracking)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy.locationTracking ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy.locationTracking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Cookie Preferences</label>
                <select
                  value={privacy.cookiePreferences}
                  onChange={(e) => handlePrivacyChange('cookiePreferences', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="essential">Essential Only</option>
                  <option value="functional">Essential + Functional</option>
                  <option value="all">All Cookies</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Storage</h3>
            
            <div className="space-y-6">
              <div className="p-6 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Storage Usage</h4>
                  <span className="text-purple-400 font-medium">{storage.used}MB / {storage.total}MB</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                    style={{ width: `${(storage.used / storage.total) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cache:</span>
                    <span className="text-white">{storage.cacheSize}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Documents:</span>
                    <span className="text-white">{storage.documentsSize}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Media:</span>
                    <span className="text-white">{storage.mediaSize}MB</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={clearCache}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Cache
                </button>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Advanced</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Debug Mode</p>
                  <p className="text-sm text-gray-400">Enable developer debugging features</p>
                </div>
                <button
                  onClick={() => handleAdvancedChange('debugMode', !advanced.debugMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    advanced.debugMode ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      advanced.debugMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Experimental Features</p>
                  <p className="text-sm text-gray-400">Enable beta features (may be unstable)</p>
                </div>
                <button
                  onClick={() => handleAdvancedChange('experimentalFeatures', !advanced.experimentalFeatures)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    advanced.experimentalFeatures ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      advanced.experimentalFeatures ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">API Timeout (seconds)</label>
                  <input
                    type="number"
                    value={advanced.apiTimeout}
                    onChange={(e) => handleAdvancedChange('apiTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="5"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Max Retries</label>
                  <input
                    type="number"
                    value={advanced.maxRetries}
                    onChange={(e) => handleAdvancedChange('maxRetries', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Log Level</label>
                <select
                  value={advanced.logLevel}
                  onChange={(e) => handleAdvancedChange('logLevel', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">App Information</h3>
            
            <div className="p-6 bg-slate-700/30 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Version:</span>
                <span className="text-white font-medium">2.1.4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Build:</span>
                <span className="text-white font-medium">2024.07.11</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Updated:</span>
                <span className="text-white font-medium">July 5, 2024</span>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-600">
                <button
                  onClick={checkUpdates}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Check for Updates
                </button>
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}