// Danger Zone Settings Component
import { useState } from 'react';

export default function DangerZoneSettings() {
  const [confirmations, setConfirmations] = useState({
    deleteAccount: '',
    resetData: '',
    clearStorage: ''
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmationChange = (type, value) => {
    setConfirmations(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const deleteAllTasks = () => {
    if (confirmations.resetData === 'DELETE TASKS') {
      if (confirm('This action cannot be undone. All tasks will be permanently deleted. Continue?')) {
        console.log('Deleting all tasks...');
        setConfirmations(prev => ({ ...prev, resetData: '' }));
      }
    }
  };

  const deleteAllProjects = () => {
    if (confirm('Are you sure you want to delete ALL projects? This cannot be undone.')) {
      if (confirm('This will also delete all tasks within these projects. Continue?')) {
        console.log('Deleting all projects...');
      }
    }
  };

  const clearAllData = () => {
    if (confirmations.resetData === 'RESET ALL DATA') {
      setIsResetting(true);
      setTimeout(() => {
        console.log('Clearing all application data...');
        setIsResetting(false);
        setConfirmations(prev => ({ ...prev, resetData: '' }));
      }, 2000);
    }
  };

  const clearLocalStorage = () => {
    if (confirmations.clearStorage === 'CLEAR STORAGE') {
      console.log('Clearing local storage...');
      setConfirmations(prev => ({ ...prev, clearStorage: '' }));
    }
  };

  const deleteAccount = () => {
    if (confirmations.deleteAccount === 'DELETE MY ACCOUNT') {
      setIsDeleting(true);
      setTimeout(() => {
        console.log('Account deletion initiated...');
        setIsDeleting(false);
      }, 3000);
    }
  };

  const exportDataBeforeDeletion = () => {
    console.log('Exporting data before account deletion...');
  };

  const downloadUserData = () => {
    console.log('Downloading complete user data archive...');
  };

  const resetAppSettings = () => {
    if (confirm('Reset all app settings to default? This will not affect your tasks or projects.')) {
      console.log('Resetting app settings...');
    }
  };

  const clearCache = () => {
    console.log('Clearing application cache...');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-red-900/10 border-2 border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.382 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-400">Danger Zone</h2>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
          <p className="text-red-300 font-medium">⚠️ Warning</p>
          <p className="text-red-200 text-sm mt-1">
            The actions in this section are irreversible and can result in permanent data loss. 
            Please proceed with extreme caution and ensure you have backups if needed.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Data Management</h3>
            
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">Delete All Tasks</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Permanently remove all tasks from your account. Projects will remain intact.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded">Moderate Risk</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-red-300 mb-2">
                      Type "DELETE TASKS" to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmations.resetData}
                      onChange={(e) => handleConfirmationChange('resetData', e.target.value)}
                      className="w-full px-4 py-2 bg-red-900/20 border border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="DELETE TASKS"
                    />
                  </div>
                  <button
                    onClick={deleteAllTasks}
                    disabled={confirmations.resetData !== 'DELETE TASKS'}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Delete All Tasks
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">Delete All Projects</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Remove all projects and their associated tasks. This action affects all your organized work.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">High Risk</span>
                </div>
                
                <button
                  onClick={deleteAllProjects}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Delete All Projects
                </button>
              </div>

              <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">Reset All Application Data</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Remove all tasks, projects, settings, and user data. This will reset the app to initial state.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">Critical Risk</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-red-300 mb-2">
                      Type "RESET ALL DATA" to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmations.resetData}
                      onChange={(e) => handleConfirmationChange('resetData', e.target.value)}
                      className="w-full px-4 py-2 bg-red-900/20 border border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="RESET ALL DATA"
                    />
                  </div>
                  <button
                    onClick={clearAllData}
                    disabled={confirmations.resetData !== 'RESET ALL DATA' || isResetting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isResetting ? 'Resetting...' : 'Reset All Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">System & Storage</h3>
            
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">Clear Local Storage</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Remove all cached data, offline content, and temporary files from your device.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">Low Risk</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-yellow-300 mb-2">
                      Type "CLEAR STORAGE" to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmations.clearStorage}
                      onChange={(e) => handleConfirmationChange('clearStorage', e.target.value)}
                      className="w-full px-4 py-2 bg-yellow-900/20 border border-yellow-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="CLEAR STORAGE"
                    />
                  </div>
                  <button
                    onClick={clearLocalStorage}
                    disabled={confirmations.clearStorage !== 'CLEAR STORAGE'}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Clear Local Storage
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">Reset App Settings</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Reset all application settings to default values. Your data will remain intact.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">Safe</span>
                </div>
                
                <button
                  onClick={resetAppSettings}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reset Settings
                </button>
              </div>

              <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">Clear Cache</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Clear application cache to free up space and resolve performance issues.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">Safe</span>
                </div>
                
                <button
                  onClick={clearCache}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Account Management</h3>
            
            <div className="space-y-6">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-white">Download Your Data</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Download a complete archive of all your data for backup or migration purposes.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">Recommended</span>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={downloadUserData}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Download Data Archive
                  </button>
                  <button
                    onClick={exportDataBeforeDeletion}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Quick Export
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 border-2 border-red-500/50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-red-400">Delete Account</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded font-medium">PERMANENT</span>
                </div>
                
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                  <p className="text-red-300 text-sm font-medium">Before deleting your account:</p>
                  <ul className="text-red-200 text-sm mt-2 space-y-1">
                    <li>• Download your data using the option above</li>
                    <li>• Cancel any active subscriptions</li>
                    <li>• Inform team members if you're part of shared projects</li>
                    <li>• This action will immediately log you out of all devices</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-red-300 mb-2">
                      Type "DELETE MY ACCOUNT" to confirm permanent deletion:
                    </label>
                    <input
                      type="text"
                      value={confirmations.deleteAccount}
                      onChange={(e) => handleConfirmationChange('deleteAccount', e.target.value)}
                      className="w-full px-4 py-2 bg-red-900/20 border border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="DELETE MY ACCOUNT"
                    />
                  </div>
                  <button
                    onClick={deleteAccount}
                    disabled={confirmations.deleteAccount !== 'DELETE MY ACCOUNT' || isDeleting}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isDeleting ? 'Deleting Account...' : 'Delete Account Permanently'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}