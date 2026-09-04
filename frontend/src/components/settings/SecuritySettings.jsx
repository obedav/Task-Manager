// Security Settings Component
import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { validateSecurityForm } from '../../utils/validation';
import AuthStatusCheck from './AuthStatusCheck';
import authService from '../../services/authService';

export default function SecuritySettings() {
  const { settings, updateSecurity, saveSettings, isLoading: globalLoading } = useSettings();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [sessions, setSessions] = useState([
    { id: 1, device: 'MacBook Pro', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'iPhone 13', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Chrome Browser', location: 'New York, NY', lastActive: '3 days ago', current: false }
  ]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveMessage('');
    setValidationErrors({});
    
    // Validate form data
    const validation = validateSecurityForm(passwordForm);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      return;
    }
    
    try {
      const authToken = authService.getToken();
      
      if (!authToken) {
        setSaveMessage('Error: You must be logged in to change your password');
        setIsLoading(false);
        return;
      }
      
      // Call the password change API endpoint
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSaveMessage('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Unknown error';
        } catch (jsonError) {
          // If JSON parsing fails, use status text or a generic message
          errorMessage = response.statusText || `Server error (${response.status})`;
        }
        setSaveMessage('Error updating password: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.message.includes('Failed to fetch')) {
        setSaveMessage('Error: Cannot connect to server. Make sure the backend is running.');
      } else {
        setSaveMessage('Error updating password: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityOptionChange = (option) => {
    const newSecuritySettings = {
      ...settings.security,
      [option]: !settings.security[option]
    };
    updateSecurity(newSecuritySettings);
  };

  const handleTwoFactorToggle = () => {
    const newSecuritySettings = {
      ...settings.security,
      twoFactorEnabled: !settings.security.twoFactorEnabled
    };
    updateSecurity(newSecuritySettings);
  };

  const terminateSession = (sessionId) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const terminateAllSessions = () => {
    setSessions(prev => prev.filter(session => session.current));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800/60 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-8">Security Settings</h2>
        
        <AuthStatusCheck />
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
            {saveMessage && (
              <div className={`p-4 rounded-lg mb-6 ${
                saveMessage.includes('Error') 
                  ? 'bg-red-900/20 border border-red-700 text-red-400' 
                  : 'bg-green-900/20 border border-green-700 text-green-400'
              }`}>
                {saveMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                    validationErrors.currentPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-600 focus:ring-purple-500'
                  }`}
                  required
                />
                {validationErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.currentPassword}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.newPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-600 focus:ring-purple-500'
                    }`}
                    required
                  />
                  {validationErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-600 focus:ring-purple-500'
                    }`}
                    required
                  />
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || globalLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading || globalLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={handleTwoFactorToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.security.twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {settings.security.twoFactorEnabled && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 font-medium">✓ Two-Factor Authentication is enabled</p>
                <p className="text-sm text-green-300 mt-1">Your account is protected with 2FA</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Security Notifications</h3>
            <div className="space-y-4">
              {Object.entries(settings.security).filter(([key]) => 
                ['emailNotifications', 'loginAlerts', 'suspiciousActivity', 'weeklyReports'].includes(key)
              ).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-400">
                      {key === 'emailNotifications' && 'Receive security alerts via email'}
                      {key === 'loginAlerts' && 'Get notified of new login attempts'}
                      {key === 'suspiciousActivity' && 'Alert for unusual account activity'}
                      {key === 'weeklyReports' && 'Weekly security summary reports'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSecurityOptionChange(key)}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Active Sessions</h3>
              <button
                onClick={terminateAllSessions}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Terminate All Sessions
              </button>
            </div>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{session.device}</p>
                      <p className="text-sm text-gray-400">{session.location} • {session.lastActive}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {session.current && (
                      <span className="px-2 py-1 bg-green-900/20 text-green-400 text-xs rounded-full">
                        Current
                      </span>
                    )}
                    {!session.current && (
                      <button
                        onClick={() => terminateSession(session.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
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