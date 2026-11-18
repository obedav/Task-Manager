// Notification Settings Component
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

const notificationDescriptions = {
  taskUpdates:      { email: 'Get notified when tasks are updated',              push: 'Push notifications for task updates'       },
  taskAssignments:  { email: 'Receive emails when tasks are assigned to you',    push: 'Instant alerts for new task assignments'   },
  taskDeadlines:    { email: 'Reminders for upcoming task deadlines',            push: 'Push reminders for deadlines'              },
  projectUpdates:   { email: 'Updates about project progress and changes',       push: 'Project milestone notifications'           },
  teamMessages:     { email: 'Messages from team members',                       push: 'Team communication alerts'                 },
  systemAlerts:     { email: 'Important system notifications',                   push: 'Critical system notifications'            },
  weeklyDigest:     { email: 'Weekly summary of your tasks and progress',        push: null                                       },
  monthlyReport:    { email: 'Monthly productivity and performance report',      push: null                                       },
};

import { useSettings } from '../../contexts/SettingsContext';

export default function NotificationSettings() {
  const { saveSection } = useSettings();
  const [emailNotifications, setEmailNotifications] = useState({
    taskUpdates: true, taskAssignments: true, taskDeadlines: true, projectUpdates: false,
    teamMessages: true, systemAlerts: true, weeklyDigest: true, monthlyReport: false
  });

  const [pushNotifications, setPushNotifications] = useState({
    taskUpdates: true, taskAssignments: true, taskDeadlines: true,
    projectUpdates: false, teamMessages: true, systemAlerts: false
  });

  const [preferences, setPreferences] = useState({
    frequency: 'instant', quietHours: true, quietStart: '22:00', quietEnd: '08:00',
    weekendNotifications: false, soundEnabled: true, vibrationEnabled: true
  });

  const toggleAll = (type, state) => {
    if (type === 'email') setEmailNotifications(Object.fromEntries(Object.keys(emailNotifications).map(k => [k, state])));
    if (type === 'push')  setPushNotifications(Object.fromEntries(Object.keys(pushNotifications).map(k => [k, state])));
  };

  const inputCls = 'flex-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-2xl p-8 border border-line" style={{ background: 'var(--surface)' }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>Notification Settings</h2>

        <div className="space-y-8">
          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Email Notifications</h3>
              <div className="flex space-x-2">
                <button onClick={() => toggleAll('email', true)}  className="px-3 py-1 text-white text-sm rounded-lg transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>Enable All</button>
                <button onClick={() => toggleAll('email', false)} className="px-3 py-1 text-sm rounded-lg transition-all hover:bg-surface-2" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Disable All</button>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(emailNotifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{notificationDescriptions[key]?.email}</p>
                  </div>
                  <Toggle value={value} onChange={() => setEmailNotifications(p => ({ ...p, [key]: !p[key] }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Push */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Push Notifications</h3>
              <div className="flex space-x-2">
                <button onClick={() => toggleAll('push', true)}  className="px-3 py-1 text-white text-sm rounded-lg transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>Enable All</button>
                <button onClick={() => toggleAll('push', false)} className="px-3 py-1 text-sm rounded-lg transition-all hover:bg-surface-2" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Disable All</button>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(pushNotifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{notificationDescriptions[key]?.push}</p>
                  </div>
                  <Toggle value={value} onChange={() => setPushNotifications(p => ({ ...p, [key]: !p[key] }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Notification Preferences</h3>

            <div className="space-y-6">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Notification Frequency</label>
                <div className="flex space-x-3">
                  {['instant', 'daily', 'weekly'].map(freq => (
                    <button
                      key={freq}
                      onClick={() => setPreferences(p => ({ ...p, frequency: freq }))}
                      className="px-4 py-2 rounded-lg font-medium transition-all text-sm"
                      style={
                        preferences.frequency === freq
                          ? { background: 'var(--royal)', color: '#fff' }
                          : { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                      }
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quiet hours */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Quiet Hours</label>
                    <Toggle value={preferences.quietHours} onChange={() => setPreferences(p => ({ ...p, quietHours: !p.quietHours }))} />
                  </div>
                  {preferences.quietHours && (
                    <div className="flex space-x-2 items-center">
                      <input type="time" value={preferences.quietStart} onChange={e => setPreferences(p => ({ ...p, quietStart: e.target.value }))} className={inputCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>to</span>
                      <input type="time" value={preferences.quietEnd}   onChange={e => setPreferences(p => ({ ...p, quietEnd: e.target.value }))}   className={inputCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }} />
                    </div>
                  )}
                </div>

                {/* Misc toggles */}
                <div className="space-y-4">
                  {[
                    { key: 'weekendNotifications', label: 'Weekend Notifications' },
                    { key: 'soundEnabled',         label: 'Sound Notifications'  },
                    { key: 'vibrationEnabled',     label: 'Vibration'            },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</label>
                      <Toggle value={preferences[key]} onChange={() => setPreferences(p => ({ ...p, [key]: !p[key] }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => saveSection('notifications', { email: emailNotifications, push: pushNotifications, preferences })}
              className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--royal)' }}
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
