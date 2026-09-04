
import { useState } from 'react';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PreferencesSettings from '../components/settings/PreferencesSettings';
import AppSettings from '../components/settings/AppSettings';
import DataManagementSettings from '../components/settings/DataManagementSettings';
import DangerZoneSettings from '../components/settings/DangerZoneSettings';

const sections = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'preferences', label: 'Preferences', icon: '⚙️' },
  { key: 'app', label: 'App Settings', icon: '📱' },
  { key: 'data', label: 'Data Management', icon: '📊' },
  { key: 'danger', label: 'Danger Zone', icon: '⚠️' },
];

function SettingsPageContent() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { hasUnsavedChanges, saveSettings, isLoading } = useSettings();

  const renderSettingsComponent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      case 'app':
        return <AppSettings />;
      case 'data':
        return <DataManagementSettings />;
      case 'danger':
        return <DangerZoneSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-slate-800 w-64 h-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => {
                    setActiveSection(section.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    activeSection === section.key
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex max-w-6xl mx-auto">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 min-h-screen p-6 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes" />
            )}
          </div>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeSection === section.key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
          
          {hasUnsavedChanges && (
            <div className="mt-8">
              <button
                onClick={saveSettings}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-10">
          {renderSettingsComponent()}
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsPageContent />
    </SettingsProvider>
  );
}