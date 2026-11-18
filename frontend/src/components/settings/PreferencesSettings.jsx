// Preferences Settings Component
import { useState } from 'react';

const Toggle = ({ value, onChange }) => (
  <button
    onClick={onChange}
    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
    style={{ background: value ? 'var(--royal)' : 'var(--border-strong)' }}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const selectCls = 'w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

const colorSchemes = [
  { value: 'royal',  label: 'Royal Blue', hex: 'var(--royal)'   },
  { value: 'gold',   label: 'Amber',      hex: 'var(--gold)'    },
  { value: 'green',  label: 'Green',      hex: 'var(--success)' },
  { value: 'red',    label: 'Red',        hex: 'var(--danger)'  },
  { value: 'info',   label: 'Teal',       hex: 'var(--info)'    },
];

import { useSettings } from '../../contexts/SettingsContext';

export default function PreferencesSettings() {
  const { saveSection } = useSettings();
  const [appearance, setAppearance] = useState({ theme: 'auto', colorScheme: 'royal', fontSize: 'medium', language: 'en', timezone: 'America/New_York' });
  const [taskPreferences, setTaskPreferences] = useState({ defaultView: 'list', sortBy: 'dueDate', showCompleted: false, autoArchive: true, defaultPriority: 'medium', reminderTime: 30 });
  const [workingHours, setWorkingHours] = useState({ enabled: true, startTime: '09:00', endTime: '17:00', workDays: ['monday','tuesday','wednesday','thursday','friday'] });
  const [integrations, setIntegrations] = useState({ calendar: true, email: false, slack: true, github: false, googleDrive: true });

  const themes   = [{ value: 'light', label: 'Light', icon: '☀️' }, { value: 'dark', label: 'Dark', icon: '🌙' }, { value: 'auto', label: 'Auto', icon: '🔄' }];
  const fontSizes = [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }];
  const languages = [{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }, { value: 'fr', label: 'Français' }, { value: 'de', label: 'Deutsch' }, { value: 'it', label: 'Italiano' }];
  const timezones = [
    { value: 'America/New_York',    label: 'Eastern Time (EST)' },
    { value: 'America/Chicago',     label: 'Central Time (CST)' },
    { value: 'America/Denver',      label: 'Mountain Time (MST)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
    { value: 'Europe/London',       label: 'London (GMT)' },
    { value: 'Europe/Paris',        label: 'Paris (CET)' },
    { value: 'Asia/Tokyo',          label: 'Tokyo (JST)' },
  ];
  const weekDays = [
    { value: 'monday', label: 'Mon' }, { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' }, { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' }, { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
  ];

  const toggleWorkDay = (day) => setWorkingHours(p => ({
    ...p,
    workDays: p.workDays.includes(day) ? p.workDays.filter(d => d !== day) : [...p.workDays, day]
  }));

  const integrationLabels = {
    calendar: 'Sync with your calendar app',
    email: 'Email integration for task updates',
    slack: 'Connect with Slack for team collaboration',
    github: 'Link GitHub repositories and issues',
    googleDrive: 'Access files from Google Drive',
  };

  const segmentBtn = (active) => ({
    className: 'px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center space-x-2',
    style: active
      ? { background: 'var(--royal)', color: '#fff' }
      : { background: 'var(--surface-2)', color: 'var(--text-muted)' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-2xl p-8 border border-line" style={{ background: 'var(--surface)' }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>Preferences</h2>

        <div className="space-y-8">
          {/* Appearance */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Appearance</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Theme</label>
                <div className="flex space-x-2">
                  {themes.map(t => (
                    <button key={t.value} onClick={() => setAppearance(p => ({ ...p, theme: t.value }))} {...segmentBtn(appearance.theme === t.value)}>
                      <span>{t.icon}</span><span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color scheme */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Color Scheme</label>
                <div className="flex space-x-2">
                  {colorSchemes.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setAppearance(p => ({ ...p, colorScheme: s.value }))}
                      title={s.label}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{
                        background: s.hex,
                        borderColor: appearance.colorScheme === s.value ? 'var(--text)' : 'var(--border)',
                        transform: appearance.colorScheme === s.value ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Font Size</label>
                <select value={appearance.fontSize} onChange={e => setAppearance(p => ({ ...p, fontSize: e.target.value }))}
                  className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                  {fontSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Language</label>
                <select value={appearance.language} onChange={e => setAppearance(p => ({ ...p, language: e.target.value }))}
                  className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                  {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              {/* Timezone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Timezone</label>
                <select value={appearance.timezone} onChange={e => setAppearance(p => ({ ...p, timezone: e.target.value }))}
                  className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                  {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Task Management */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Task Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Default View', key: 'defaultView', opts: [['list','List View'],['board','Board View'],['calendar','Calendar View'],['timeline','Timeline View']] },
                { label: 'Sort By',      key: 'sortBy',      opts: [['dueDate','Due Date'],['priority','Priority'],['created','Created Date'],['updated','Last Updated'],['alphabetical','Alphabetical']] },
                { label: 'Default Priority', key: 'defaultPriority', opts: [['low','Low'],['medium','Medium'],['high','High'],['urgent','Urgent']] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <select value={taskPreferences[key]} onChange={e => setTaskPreferences(p => ({ ...p, [key]: e.target.value }))}
                    className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Reminder Time (minutes before)</label>
                <input type="number" value={taskPreferences.reminderTime} min="0" max="1440"
                  onChange={e => setTaskPreferences(p => ({ ...p, reminderTime: parseInt(e.target.value) }))}
                  className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }} />
              </div>

              {[
                { key: 'showCompleted', label: 'Show Completed Tasks', desc: 'Display completed tasks in lists' },
                { key: 'autoArchive',   label: 'Auto Archive',         desc: 'Automatically archive completed tasks after 30 days' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{label}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                  <Toggle value={taskPreferences[key]} onChange={() => setTaskPreferences(p => ({ ...p, [key]: !p[key] }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Working Hours</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Enable Working Hours</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Set your working schedule for better task planning</p>
                </div>
                <Toggle value={workingHours.enabled} onChange={() => setWorkingHours(p => ({ ...p, enabled: !p.enabled }))} />
              </div>

              {workingHours.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[['startTime','Start Time'],['endTime','End Time']].map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>{label}</label>
                        <input type="time" value={workingHours[key]} onChange={e => setWorkingHours(p => ({ ...p, [key]: e.target.value }))}
                          className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map(day => (
                        <button key={day.value} onClick={() => toggleWorkDay(day.value)}
                          className="px-3 py-2 rounded-lg font-medium transition-all text-sm"
                          style={
                            workingHours.workDays.includes(day.value)
                              ? { background: 'var(--royal)', color: '#fff' }
                              : { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                          }
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

          {/* Integrations */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(integrations).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                  <div>
                    <p className="font-medium capitalize" style={{ color: 'var(--text)' }}>{key}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{integrationLabels[key]}</p>
                  </div>
                  <Toggle value={value} onChange={() => setIntegrations(p => ({ ...p, [key]: !p[key] }))} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => saveSection('preferences', { appearance, tasks: taskPreferences, workingHours, integrations })}
              className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--royal)' }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
