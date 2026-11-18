// Danger Zone Settings Component
import { useState } from 'react';
import authService from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';

const inputCls = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-white';

export default function DangerZoneSettings() {
  const { logout } = useAuthContext();
  const [confirmations, setConfirmations] = useState({ deleteAccount: '', resetData: '', clearStorage: '' });
  const [isDeleting, setIsDeleting]   = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const set = (key, value) => setConfirmations(p => ({ ...p, [key]: value }));

  const deleteAllTasks = async () => {
    if (confirmations.resetData !== 'DELETE TASKS') return;
    if (!confirm('This action cannot be undone. All tasks will be permanently deleted. Continue?')) return;
    try {
      await authService.deleteAllTasks();
      set('resetData', '');
      alert('All tasks deleted successfully.');
    } catch (err) {
      alert('Failed to delete tasks: ' + err.message);
    }
  };

  const clearAllData = async () => {
    if (confirmations.resetData !== 'RESET ALL DATA') return;
    setIsResetting(true);
    try {
      await authService.deleteAllTasks();
      set('resetData', '');
    } catch (err) {
      alert('Failed to reset data: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const clearLocalStorage = () => {
    if (confirmations.clearStorage !== 'CLEAR STORAGE') return;
    localStorage.clear();
    sessionStorage.clear();
    set('clearStorage', '');
    alert('Local storage cleared.');
  };

  const deleteAccount = async () => {
    if (confirmations.deleteAccount !== 'DELETE MY ACCOUNT') return;
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      logout();
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
      setIsDeleting(false);
    }
  };

  const DangerCard = ({ title, desc, badge, badgeStyle, children, borderColor = 'var(--danger)' }) => (
    <div className="rounded-lg p-6" style={{ background: 'var(--danger-bg)', border: `1px solid ${borderColor}` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-medium" style={{ color: 'var(--danger)' }}>{title}</h4>
          {desc && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
        </div>
        {badge && (
          <span className="px-2 py-1 text-xs rounded font-medium flex-shrink-0 ml-4" style={badgeStyle}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );

  const ConfirmInput = ({ value, onChange, placeholder, ringColor = 'focus:ring-danger' }) => (
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputCls} ${ringColor}`}
      style={{ background: 'rgba(220,38,38,0.1)', borderColor: 'var(--danger)', color: 'var(--text)' }}
    />
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header card */}
      <div className="rounded-2xl p-8" style={{ background: 'var(--danger-bg)', border: '2px solid var(--danger)' }}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--danger)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.382 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--danger)' }}>Danger Zone</h2>
        </div>

        <div className="p-4 rounded-lg mb-8" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid var(--danger)' }}>
          <p className="font-medium" style={{ color: 'var(--danger)' }}>⚠️ Warning</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            The actions in this section are irreversible and can result in permanent data loss.
            Please proceed with extreme caution and ensure you have backups if needed.
          </p>
        </div>

        <div className="space-y-8">
          {/* Data Management */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Data Management</h3>
            <div className="space-y-6">
              <DangerCard
                title="Delete All Tasks"
                desc="Permanently remove all tasks from your account. Projects will remain intact."
                badge="Moderate Risk"
                badgeStyle={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)' }}
                borderColor="var(--warning)"
              >
                <div className="space-y-3">
                  <label className="block text-sm" style={{ color: 'var(--danger)' }}>Type "DELETE TASKS" to confirm:</label>
                  <ConfirmInput value={confirmations.resetData} onChange={v => set('resetData', v)} placeholder="DELETE TASKS" />
                  <button onClick={deleteAllTasks} disabled={confirmations.resetData !== 'DELETE TASKS'}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--warning)' }}>
                    Delete All Tasks
                  </button>
                </div>
              </DangerCard>

              <DangerCard
                title="Delete All Projects"
                desc="Remove all projects and their associated tasks. This action affects all your organized work."
                badge="High Risk"
                badgeStyle={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
              >
                <button
                  onClick={async () => {
                    if (confirm('Delete ALL projects and tasks? This cannot be undone.')) {
                      try { await authService.deleteAllTasks(); alert('All tasks deleted.'); }
                      catch (err) { alert('Failed: ' + err.message); }
                    }
                  }}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--danger)' }}>
                  Delete All Projects
                </button>
              </DangerCard>

              <DangerCard
                title="Reset All Application Data"
                desc="Remove all tasks, projects, settings, and user data. This will reset the app to initial state."
                badge="Critical Risk"
                badgeStyle={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
              >
                <div className="space-y-3">
                  <label className="block text-sm" style={{ color: 'var(--danger)' }}>Type "RESET ALL DATA" to confirm:</label>
                  <ConfirmInput value={confirmations.resetData} onChange={v => set('resetData', v)} placeholder="RESET ALL DATA" />
                  <button onClick={clearAllData} disabled={confirmations.resetData !== 'RESET ALL DATA' || isResetting}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--danger)' }}>
                    {isResetting ? 'Resetting...' : 'Reset All Data'}
                  </button>
                </div>
              </DangerCard>
            </div>
          </div>

          {/* System & Storage */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>System & Storage</h3>
            <div className="space-y-6">
              {/* Clear local storage - warning level */}
              <div className="rounded-lg p-6" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium" style={{ color: 'var(--warning)' }}>Clear Local Storage</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Remove all cached data, offline content, and temporary files from your device.</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded font-medium flex-shrink-0 ml-4" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>Low Risk</span>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm" style={{ color: 'var(--warning)' }}>Type "CLEAR STORAGE" to confirm:</label>
                  <input
                    type="text" value={confirmations.clearStorage} onChange={e => set('clearStorage', e.target.value)}
                    placeholder="CLEAR STORAGE"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-warning"
                    style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning)', color: 'var(--text)' }}
                  />
                  <button onClick={clearLocalStorage} disabled={confirmations.clearStorage !== 'CLEAR STORAGE'}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--warning)' }}>
                    Clear Local Storage
                  </button>
                </div>
              </div>

              {/* Reset app settings - safe */}
              <div className="rounded-lg p-6" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium" style={{ color: 'var(--text)' }}>Reset App Settings</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Reset all application settings to default values. Your data will remain intact.</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded font-medium flex-shrink-0 ml-4" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' }}>Safe</span>
                </div>
                <button onClick={() => confirm('Reset all settings to default?') && console.log('Settings reset')}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>
                  Reset Settings
                </button>
              </div>

              {/* Clear cache - safe */}
              <div className="rounded-lg p-6" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium" style={{ color: 'var(--text)' }}>Clear Cache</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Clear application cache to free up space and resolve performance issues.</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded font-medium flex-shrink-0 ml-4" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' }}>Safe</span>
                </div>
                <button onClick={() => console.log('Cache cleared')}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--success)' }}>
                  Clear Cache
                </button>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Account Management</h3>
            <div className="space-y-6">
              {/* Download data - safe/recommended */}
              <div className="rounded-lg p-6" style={{ background: 'var(--royal-light)', border: '1px solid var(--royal)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium" style={{ color: 'var(--royal)' }}>Download Your Data</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Download a complete archive of all your data for backup or migration purposes.</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded font-medium flex-shrink-0 ml-4" style={{ background: 'var(--royal-light)', color: 'var(--royal)', border: '1px solid var(--royal)' }}>Recommended</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={async () => {
                      try {
                        const data = await authService.exportData('json');
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `taskflow-data-${Date.now()}.json`; a.click();
                        URL.revokeObjectURL(url);
                      } catch (err) { alert('Export failed: ' + err.message); }
                    }}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>
                    Download Data Archive
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const data = await authService.exportData('csv');
                        const blob = new Blob([data], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `taskflow-export-${Date.now()}.csv`; a.click();
                        URL.revokeObjectURL(url);
                      } catch (err) { alert('Export failed: ' + err.message); }
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-all hover:bg-surface-2" style={{ color: 'var(--royal)', border: '1px solid var(--royal)' }}>
                    Quick Export (CSV)
                  </button>
                </div>
              </div>

              {/* Delete account - permanent */}
              <div className="rounded-lg p-6" style={{ background: 'var(--danger-bg)', border: '2px solid var(--danger)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium" style={{ color: 'var(--danger)' }}>Delete Account</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded font-bold flex-shrink-0 ml-4" style={{ background: 'var(--danger)', color: '#fff' }}>PERMANENT</span>
                </div>

                <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid var(--danger)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Before deleting your account:</p>
                  <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--text-muted)' }}>
                    <li>• Download your data using the option above</li>
                    <li>• Cancel any active subscriptions</li>
                    <li>• Inform team members if you're part of shared projects</li>
                    <li>• This action will immediately log you out of all devices</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm" style={{ color: 'var(--danger)' }}>Type "DELETE MY ACCOUNT" to confirm permanent deletion:</label>
                  <ConfirmInput value={confirmations.deleteAccount} onChange={v => set('deleteAccount', v)} placeholder="DELETE MY ACCOUNT" />
                  <button onClick={deleteAccount} disabled={confirmations.deleteAccount !== 'DELETE MY ACCOUNT' || isDeleting}
                    className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--danger)' }}>
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
