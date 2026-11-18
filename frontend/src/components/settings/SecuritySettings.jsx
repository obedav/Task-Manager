// Security Settings Component
import { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { validateSecurityForm } from '../../utils/validation';
import AuthStatusCheck from './AuthStatusCheck';
import authService from '../../services/authService';

const inputCls = (error) =>
  `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
    error ? 'border-danger' : 'border-line'
  }`;

const Toggle = ({ value, onChange }) => (
  <button
    onClick={onChange}
    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
    style={{ background: value ? 'var(--royal)' : 'var(--border-strong)' }}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default function SecuritySettings() {
  const { settings, updateSecurity, saveSettings, saveSection, isLoading: globalLoading } = useSettings();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading]       = useState(false);
  const [saveMessage, setSaveMessage]   = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [sessions, setSessions] = useState([
    { id: 1, device: 'MacBook Pro',     location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true  },
    { id: 2, device: 'iPhone 13',       location: 'San Francisco, CA', lastActive: '1 hour ago',    current: false },
    { id: 3, device: 'Chrome Browser',  location: 'New York, NY',      lastActive: '3 days ago',    current: false },
  ]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveMessage('');
    setValidationErrors({});

    const validation = validateSecurityForm(passwordForm);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSaveMessage('Password updated successfully! Please log in again.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err) {
      setSaveMessage('Error updating password: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityOptionChange = (option) => {
    updateSecurity({ ...settings.security, [option]: !settings.security[option] });
  };

  const isError = (msg) => msg.includes('Error');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-2xl p-8 border border-line" style={{ background: 'var(--surface)' }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>Security Settings</h2>

        <AuthStatusCheck />

        <div className="space-y-8">
          {/* Change Password */}
          <div>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>Change Password</h3>

            {saveMessage && (
              <div
                className="p-4 rounded-lg mb-6"
                style={
                  isError(saveMessage)
                    ? { background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)' }
                    : { background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)' }
                }
              >
                {saveMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Current Password</label>
                <input
                  type="password" name="currentPassword" value={passwordForm.currentPassword}
                  onChange={handlePasswordChange} required
                  className={inputCls(validationErrors.currentPassword)}
                  style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                />
                {validationErrors.currentPassword && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{validationErrors.currentPassword}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>New Password</label>
                  <input
                    type="password" name="newPassword" value={passwordForm.newPassword}
                    onChange={handlePasswordChange} required
                    className={inputCls(validationErrors.newPassword)}
                    style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                  />
                  {validationErrors.newPassword && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{validationErrors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Confirm New Password</label>
                  <input
                    type="password" name="confirmPassword" value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange} required
                    className={inputCls(validationErrors.confirmPassword)}
                    style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="submit" disabled={isLoading || globalLoading}
                className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--royal)' }}
              >
                {isLoading || globalLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* 2FA */}
          <div>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
              <div>
                <p className="font-medium" style={{ color: 'var(--text)' }}>Two-Factor Authentication</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add an extra layer of security to your account</p>
              </div>
              <Toggle
                value={settings.security.twoFactorEnabled}
                onChange={() => updateSecurity({ ...settings.security, twoFactorEnabled: !settings.security.twoFactorEnabled })}
              />
            </div>
            {settings.security.twoFactorEnabled && (
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                <p className="font-medium" style={{ color: 'var(--success)' }}>✓ Two-Factor Authentication is enabled</p>
                <p className="text-sm mt-1" style={{ color: 'var(--success)' }}>Your account is protected with 2FA</p>
              </div>
            )}
          </div>

          {/* Security Notifications */}
          <div>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>Security Notifications</h3>
            <div className="space-y-3">
              {Object.entries(settings.security).filter(([key]) =>
                ['emailNotifications', 'loginAlerts', 'suspiciousActivity', 'weeklyReports'].includes(key)
              ).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {key === 'emailNotifications' && 'Receive security alerts via email'}
                      {key === 'loginAlerts'         && 'Get notified of new login attempts'}
                      {key === 'suspiciousActivity'  && 'Alert for unusual account activity'}
                      {key === 'weeklyReports'        && 'Weekly security summary reports'}
                    </p>
                  </div>
                  <Toggle value={value} onChange={() => handleSecurityOptionChange(key)} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={async () => {
                const result = await saveSection('security', settings.security);
                setSaveMessage(result.success ? 'Security settings saved!' : 'Error: ' + result.error);
                if (result.success) setTimeout(() => setSaveMessage(''), 3000);
              }}
              className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--royal)' }}
            >
              Save Security Settings
            </button>
          </div>

          {/* Active Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Active Sessions</h3>
              <button
                onClick={() => setSessions(prev => prev.filter(s => s.current))}
                className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90"
                style={{ background: 'var(--danger)' }}
              >
                Terminate All Sessions
              </button>
            </div>
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--royal)' }}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{session.device}</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{session.location} • {session.lastActive}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {session.current && (
                      <span className="px-2 py-1 text-xs rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        Current
                      </span>
                    )}
                    {!session.current && (
                      <button
                        onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))}
                        className="px-3 py-1 text-white text-sm rounded-lg transition-all hover:opacity-90"
                        style={{ background: 'var(--danger)' }}
                      >
                        Terminate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
