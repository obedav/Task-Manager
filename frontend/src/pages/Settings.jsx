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
  { key: 'profile',       label: 'Profile',         icon: '👤' },
  { key: 'security',      label: 'Security',         icon: '🔒' },
  { key: 'notifications', label: 'Notifications',    icon: '🔔' },
  { key: 'preferences',   label: 'Preferences',      icon: '⚙️' },
  { key: 'app',           label: 'App Settings',     icon: '📱' },
  { key: 'data',          label: 'Data Management',  icon: '📊' },
  { key: 'danger',        label: 'Danger Zone',      icon: '⚠️' },
];

function NavItem({ section, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium text-sm"
      style={
        active
          ? { background: 'var(--royal)', color: '#fff' }
          : { color: 'var(--text-muted)' }
      }
      onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
    >
      <span className="text-base">{section.icon}</span>
      <span>{section.label}</span>
    </button>
  );
}

function SettingsPageContent() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { hasUnsavedChanges, saveSettings, isLoading } = useSettings();

  const renderSettingsComponent = () => {
    switch (activeSection) {
      case 'profile':       return <ProfileSettings />;
      case 'security':      return <SecuritySettings />;
      case 'notifications': return <NotificationSettings />;
      case 'preferences':   return <PreferencesSettings />;
      case 'app':           return <AppSettings />;
      case 'data':          return <DataManagementSettings />;
      case 'danger':        return <DangerZoneSettings />;
      default:              return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Mobile Header */}
      <div
        className="lg:hidden p-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg transition-colors hover:bg-surface-2"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="w-64 h-full p-6"
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              {sections.map(section => (
                <NavItem
                  key={section.key}
                  section={section}
                  active={activeSection === section.key}
                  onClick={() => { setActiveSection(section.key); setIsMobileMenuOpen(false); }}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex max-w-6xl mx-auto">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:block w-64 min-h-screen p-6"
          style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
            {hasUnsavedChanges && (
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }} title="Unsaved changes" />
            )}
          </div>

          <nav className="space-y-1">
            {sections.map(section => (
              <NavItem
                key={section.key}
                section={section}
                active={activeSection === section.key}
                onClick={() => setActiveSection(section.key)}
              />
            ))}
          </nav>

          {hasUnsavedChanges && (
            <div className="mt-8">
              <button
                onClick={saveSettings}
                disabled={isLoading}
                className="w-full px-4 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--success)' }}
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
