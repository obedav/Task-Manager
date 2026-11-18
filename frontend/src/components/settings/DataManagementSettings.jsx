// Data Management Settings Component
import { useState } from 'react';
import authService from '../../services/authService';

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

const statusStyle = (status) => {
  switch (status) {
    case 'completed':  return { color: 'var(--success)' };
    case 'failed':     return { color: 'var(--danger)'  };
    case 'in-progress':return { color: 'var(--warning)' };
    default:           return { color: 'var(--text-muted)' };
  }
};

export default function DataManagementSettings() {
  const [backupSettings, setBackupSettings] = useState({ autoBackup: true, frequency: 'daily', location: 'cloud', encryption: true, retention: 30 });
  const [importExport, setImportExport]     = useState({ format: 'json', includeMedia: true, includeSettings: true, compression: true });
  const [dataSync, setDataSync]             = useState({ enabled: true, conflictResolution: 'latest', bandwidth: 'unlimited' });
  const [backupHistory, setBackupHistory]   = useState([
    { id: 1, date: '2025-07-11 09:30', size: '45.2 MB', status: 'completed', type: 'automatic' },
    { id: 2, date: '2025-07-10 09:30', size: '44.8 MB', status: 'completed', type: 'automatic' },
    { id: 3, date: '2025-07-09 15:22', size: '43.1 MB', status: 'completed', type: 'manual'    },
    { id: 4, date: '2025-07-09 09:30', size: '42.9 MB', status: 'completed', type: 'automatic' },
    { id: 5, date: '2025-07-08 09:30', size: '41.7 MB', status: 'failed',    type: 'automatic' },
  ]);
  const [storageAnalytics] = useState({ totalTasks: 1247, totalProjects: 23, totalFiles: 89, dataSize: '45.2 MB', lastCleanup: '2025-07-05' });

  const createBackup = () => {
    setBackupHistory(prev => [{ id: Date.now(), date: new Date().toLocaleString(), size: '45.3 MB', status: 'completed', type: 'manual' }, ...prev]);
  };

  const handleExport = async () => {
    try {
      const data = await authService.exportData(importExport.format === 'json' ? 'json' : 'csv');
      const mimeType = importExport.format === 'csv' ? 'text/csv' : 'application/json';
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-export-${Date.now()}.${importExport.format === 'csv' ? 'csv' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

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
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>Data Management</h2>

        <div className="space-y-8">
          {/* Backup Settings */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Backup Settings</h3>
            <div className="space-y-6">
              <ToggleRow label="Automatic Backup" desc="Automatically backup your data regularly" value={backupSettings.autoBackup}  onChange={() => setBackupSettings(p => ({ ...p, autoBackup:  !p.autoBackup  }))} />
              <ToggleRow label="Encryption"        desc="Encrypt backup files for security"        value={backupSettings.encryption} onChange={() => setBackupSettings(p => ({ ...p, encryption: !p.encryption }))} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Frequency',        key: 'frequency', opts: [['daily','Daily'],['weekly','Weekly'],['monthly','Monthly']] },
                  { label: 'Location',         key: 'location',  opts: [['cloud','Cloud Storage'],['local','Local Storage'],['external','External Drive']] },
                ].map(({ label, key, opts }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>{label}</label>
                    <select value={backupSettings[key]} onChange={e => setBackupSettings(p => ({ ...p, [key]: e.target.value }))}
                      className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                      {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Retention (days)</label>
                  <input type="number" value={backupSettings.retention} min="1" max="365"
                    onChange={e => setBackupSettings(p => ({ ...p, retention: parseInt(e.target.value) }))}
                    className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }} />
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={createBackup} className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>
                  Create Backup Now
                </button>
              </div>
            </div>
          </div>

          {/* Backup History */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Backup History</h3>
            <div className="rounded-lg overflow-hidden border border-line">
              <div className="grid grid-cols-5 gap-4 p-4 text-sm font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                <span>Date & Time</span><span>Size</span><span>Status</span><span>Type</span><span>Actions</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {backupHistory.map((b, i) => (
                  <div key={b.id} className="grid grid-cols-5 gap-4 p-4 items-center" style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{b.date}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{b.size}</span>
                    <span className="text-sm font-medium" style={statusStyle(b.status)}>{b.status}</span>
                    <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{b.type}</span>
                    <div className="flex space-x-2">
                      {b.status === 'completed' && (
                        <button onClick={() => confirm('Restore this backup? Current data will be overwritten.') && console.log('Restoring', b.id)}
                          className="px-3 py-1 text-white text-xs rounded transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>
                          Restore
                        </button>
                      )}
                      <button onClick={() => setBackupHistory(p => p.filter(x => x.id !== b.id))}
                        className="px-3 py-1 text-white text-xs rounded transition-all hover:opacity-90" style={{ background: 'var(--danger)' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Import & Export */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Import & Export</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Export Format</label>
                  <select value={importExport.format} onChange={e => setImportExport(p => ({ ...p, format: e.target.value }))}
                    className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                    {[['json','JSON'],['csv','CSV'],['xml','XML'],['xlsx','Excel']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'includeMedia',    label: 'Include Media Files' },
                    { key: 'includeSettings', label: 'Include Settings'    },
                    { key: 'compression',     label: 'Use Compression'     },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</label>
                      <Toggle value={importExport[key]} onChange={() => setImportExport(p => ({ ...p, [key]: !p[key] }))} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={handleExport} className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--success)' }}>Export Data</button>
                <button onClick={() => document.getElementById('import-file').click()} className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--royal)' }}>Import Data</button>
                <input id="import-file" type="file" accept=".json,.csv,.xml,.xlsx" onChange={e => e.target.files[0] && console.log('Importing:', e.target.files[0].name)} className="hidden" />
              </div>
            </div>
          </div>

          {/* Data Sync */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Data Synchronization</h3>
            <div className="space-y-6">
              <ToggleRow label="Cross-Device Sync" desc="Keep your data synchronized across all devices" value={dataSync.enabled} onChange={() => setDataSync(p => ({ ...p, enabled: !p.enabled }))} />
              {dataSync.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Conflict Resolution', key: 'conflictResolution', opts: [['latest','Use Latest Version'],['manual','Manual Resolution'],['merge','Auto Merge']] },
                    { label: 'Bandwidth Usage',      key: 'bandwidth',          opts: [['unlimited','Unlimited'],['high','High (10 MB/min)'],['medium','Medium (5 MB/min)'],['low','Low (1 MB/min)']] },
                  ].map(({ label, key, opts }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>{label}</label>
                      <select value={dataSync[key]} onChange={e => setDataSync(p => ({ ...p, [key]: e.target.value }))}
                        className={selectCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                        {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Storage Analytics */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Storage Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Tasks', val: storageAnalytics.totalTasks,    color: 'var(--royal)' },
                { label: 'Projects',    val: storageAnalytics.totalProjects,  color: 'var(--info)'  },
                { label: 'Files',       val: storageAnalytics.totalFiles,     color: 'var(--success)' },
                { label: 'Total Size',  val: storageAnalytics.dataSize,       color: 'var(--warning)' },
              ].map(({ label, val, color }) => (
                <div key={label} className="p-4 bg-surface-2 rounded-lg text-center">
                  <div className="text-2xl font-bold" style={{ color }}>{val}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-surface-2 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Data Cleanup</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last cleanup: {storageAnalytics.lastCleanup}</p>
                </div>
                <button onClick={() => confirm('Remove old completed tasks and temporary files? Continue?') && console.log('Cleaning...')}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90" style={{ background: 'var(--warning)' }}>
                  Cleanup Now
                </button>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Remove old completed tasks, temporary files, and optimize database for better performance.</p>
            </div>
          </div>

          {/* Data Privacy */}
          <div>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Data Privacy</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--info-bg)', border: '1px solid var(--info)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--info)' }}>🔒 Data Encryption</h4>
                <p className="text-sm" style={{ color: 'var(--info)' }}>All your data is encrypted both in transit and at rest using AES-256 encryption.</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--success)' }}>🌍 Data Location</h4>
                <p className="text-sm" style={{ color: 'var(--success)' }}>Your data is stored in secure data centers with compliance to GDPR and other privacy regulations.</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--royal-light)', border: '1px solid var(--royal)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--royal)' }}>🔄 Data Portability</h4>
                <p className="text-sm" style={{ color: 'var(--royal)' }}>You can export your data at any time in standard formats for use with other applications.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
