// App Settings Component
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
const inputCls  = 'w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

import { useSettings } from '../../contexts/SettingsContext';

export default function AppSettings() {
  const { saveSection } = useSettings();
  const [generalSettings, setGeneralSettings] = useState({ autoSave: true, offlineMode: false, syncFrequency: 'realtime', cacheSize: 100, autoBackup: true, backupFrequency: 'daily' });
  const [performance, setPerformance]         = useState({ animationsEnabled: true, reducedMotion: false, lazyLoading: true, prefetchData: false, compressionLevel: 'medium' });
  const [privacy, setPrivacy]                 = useState({ analytics: false, crashReporting: true, usageData: false, locationTracking: false, cookiePreferences: 'essential' });
  const [advanced, setAdvanced]               = useState({ debugMode: false, experimentalFeatures: false, apiTimeout: 30, maxRetries: 3, logLevel: 'error' });
  const [storage, setStorage]                 = useState({ used: 45.2, total: 100, cacheSize: 12.8, documentsSize: 28.5, mediaSize: 3.9 });

  const ToggleRow = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
      <div>
        <p className="font-medium" style={{ color: 'var(--text)' }}>{label}</p>
        {desc && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-2xl p-8 border border-line" style={{ background: 'var(--surface)' }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>App Settings</h2>

        <div className="space-y-8">
          {/* General */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>General</h3>
            <div className="space-y-4">
              <ToggleRow label="Auto Save"   desc="Automatically save changes as you work" value={generalSettings.autoSave}   onChange={() => setGeneralSettings(p => ({ ...p, autoSave: !p.autoSave }))} />
              <ToggleRow label="Offline Mode" desc="Enable offline functionality"          value={generalSettings.offlineMode} onChange={() => setGeneralSettings(p => ({ ...p, offlineMode: !p.offlineMode }))} />
              <ToggleRow label="Auto Backup"  desc="Automatically backup your data"        value={generalSettings.autoBackup}  onChange={() => setGeneralSettings(p => ({ ...p, autoBackup: !p.autoBackup }))} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Sync Frequency', key: 'syncFrequency', setter: setGeneralSettings, state: generalSettings, opts: [['realtime','Real-time'],['5min','Every 5 min'],['15min','Every 15 min'],['30min','Every 30 min'],['1hour','Every hour'],['manual','Manual only']] },
                  { label: 'Backup Frequency', key: 'backupFrequency', setter: setGeneralSettings, state: generalSettings, opts: [['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['never','Never']] },
                ].map(({ label, key, setter, state, opts }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>{label}</label>
                    <select value={state[key]} onChange={e => setter(p => ({ ...p, [key]: e.target.value }))}
                      className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Performance</h3>
            <div className="space-y-4">
              <ToggleRow label="Animations"    desc="Enable smooth animations and transitions"    value={performance.animationsEnabled}  onChange={() => setPerformance(p => ({ ...p, animationsEnabled:  !p.animationsEnabled  }))} />
              <ToggleRow label="Reduced Motion" desc="Minimize motion for accessibility"           value={performance.reducedMotion}       onChange={() => setPerformance(p => ({ ...p, reducedMotion:       !p.reducedMotion       }))} />
              <ToggleRow label="Lazy Loading"   desc="Load content as needed to improve performance" value={performance.lazyLoading}      onChange={() => setPerformance(p => ({ ...p, lazyLoading:         !p.lazyLoading         }))} />
              <ToggleRow label="Prefetch Data"  desc="Preload data to reduce loading times"        value={performance.prefetchData}        onChange={() => setPerformance(p => ({ ...p, prefetchData:        !p.prefetchData        }))} />
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Compression Level</label>
                <select value={performance.compressionLevel} onChange={e => setPerformance(p => ({ ...p, compressionLevel: e.target.value }))}
                  className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                  {[['none','None'],['low','Low'],['medium','Medium'],['high','High']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Privacy</h3>
            <div className="space-y-4">
              <ToggleRow label="Analytics"       desc="Help improve the app by sharing usage analytics"      value={privacy.analytics}       onChange={() => setPrivacy(p => ({ ...p, analytics:       !p.analytics       }))} />
              <ToggleRow label="Crash Reporting"  desc="Automatically send crash reports to help fix issues" value={privacy.crashReporting}   onChange={() => setPrivacy(p => ({ ...p, crashReporting:   !p.crashReporting   }))} />
              <ToggleRow label="Usage Data"       desc="Share anonymous usage data for product improvements" value={privacy.usageData}        onChange={() => setPrivacy(p => ({ ...p, usageData:        !p.usageData        }))} />
              <ToggleRow label="Location Tracking" desc="Allow location-based features"                      value={privacy.locationTracking} onChange={() => setPrivacy(p => ({ ...p, locationTracking: !p.locationTracking }))} />
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Cookie Preferences</label>
                <select value={privacy.cookiePreferences} onChange={e => setPrivacy(p => ({ ...p, cookiePreferences: e.target.value }))}
                  className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                  {[['essential','Essential Only'],['functional','Essential + Functional'],['all','All Cookies']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Storage */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Storage</h3>
            <div className="space-y-6">
              <div className="p-6 bg-surface-2 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium" style={{ color: 'var(--text)' }}>Storage Usage</h4>
                  <span className="font-medium" style={{ color: 'var(--royal)' }}>{storage.used}MB / {storage.total}MB</span>
                </div>
                <div className="w-full rounded-full h-3 mb-4" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${(storage.used / storage.total) * 100}%`, background: 'linear-gradient(to right, var(--royal), var(--gold))' }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {[['Cache', storage.cacheSize],['Documents', storage.documentsSize],['Media', storage.mediaSize]].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                      <span style={{ color: 'var(--text)' }}>{val}MB</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => setStorage(p => ({ ...p, cacheSize: 0 }))}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--warning)' }}>
                  Clear Cache
                </button>
                <button onClick={() => console.log('Exporting app data...')}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Advanced</h3>
            <div className="space-y-4">
              <ToggleRow label="Debug Mode"           desc="Enable developer debugging features"    value={advanced.debugMode}            onChange={() => setAdvanced(p => ({ ...p, debugMode:            !p.debugMode            }))} />
              <ToggleRow label="Experimental Features" desc="Enable beta features (may be unstable)" value={advanced.experimentalFeatures}  onChange={() => setAdvanced(p => ({ ...p, experimentalFeatures:  !p.experimentalFeatures  }))} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>API Timeout (seconds)</label>
                  <input type="number" value={advanced.apiTimeout} min="5" max="300"
                    onChange={e => setAdvanced(p => ({ ...p, apiTimeout: parseInt(e.target.value) }))}
                    className={inputCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Max Retries</label>
                  <input type="number" value={advanced.maxRetries} min="0" max="10"
                    onChange={e => setAdvanced(p => ({ ...p, maxRetries: parseInt(e.target.value) }))}
                    className={inputCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Log Level</label>
                <select value={advanced.logLevel} onChange={e => setAdvanced(p => ({ ...p, logLevel: e.target.value }))}
                  className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                  {[['error','Error'],['warn','Warning'],['info','Info'],['debug','Debug']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>App Information</h3>
            <div className="p-6 bg-surface-2 rounded-lg space-y-4">
              {[['Version','2.1.4'],['Build','2024.07.11'],['Last Updated','July 5, 2024']].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>{val}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-line">
                <button onClick={() => console.log('Checking for updates...')}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--success)' }}>
                  Check for Updates
                </button>
                <button onClick={() => confirm('Reset all settings to default?') && saveSection('app', {})}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--danger)' }}>
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        <div className="flex justify-end pt-4 border-t border-line">
          <button
            onClick={() => saveSection('app', { ...generalSettings, performance, privacy, advanced })}
            className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--royal)' }}
          >
            Save App Settings
          </button>
        </div>
      </div>
    </div>
  );
}
