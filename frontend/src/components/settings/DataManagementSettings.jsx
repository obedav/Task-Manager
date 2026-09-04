// Data Management Settings Component
import { useState } from 'react';

export default function DataManagementSettings() {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    frequency: 'daily',
    location: 'cloud',
    encryption: true,
    retention: 30
  });

  const [importExport, setImportExport] = useState({
    format: 'json',
    includeMedia: true,
    includeSettings: true,
    compression: true
  });

  const [dataSync, setDataSync] = useState({
    enabled: true,
    devices: ['laptop', 'mobile'],
    conflictResolution: 'latest',
    bandwidth: 'unlimited'
  });

  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: '2025-07-11 09:30', size: '45.2 MB', status: 'completed', type: 'automatic' },
    { id: 2, date: '2025-07-10 09:30', size: '44.8 MB', status: 'completed', type: 'automatic' },
    { id: 3, date: '2025-07-09 15:22', size: '43.1 MB', status: 'completed', type: 'manual' },
    { id: 4, date: '2025-07-09 09:30', size: '42.9 MB', status: 'completed', type: 'automatic' },
    { id: 5, date: '2025-07-08 09:30', size: '41.7 MB', status: 'failed', type: 'automatic' }
  ]);

  const [storageAnalytics, setStorageAnalytics] = useState({
    totalTasks: 1247,
    totalProjects: 23,
    totalFiles: 89,
    dataSize: '45.2 MB',
    lastCleanup: '2025-07-05'
  });

  const handleBackupChange = (key, value) => {
    setBackupSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImportExportChange = (key, value) => {
    setImportExport(prev => ({ ...prev, [key]: value }));
  };

  const handleDataSyncChange = (key, value) => {
    setDataSync(prev => ({ ...prev, [key]: value }));
  };

  const createBackup = () => {
    const newBackup = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      size: '45.3 MB',
      status: 'completed',
      type: 'manual'
    };
    setBackupHistory(prev => [newBackup, ...prev]);
    console.log('Manual backup created');
  };

  const restoreBackup = (backupId) => {
    if (confirm('Are you sure you want to restore this backup? Current data will be overwritten.')) {
      console.log('Restoring backup:', backupId);
    }
  };

  const deleteBackup = (backupId) => {
    setBackupHistory(prev => prev.filter(backup => backup.id !== backupId));
  };

  const exportData = () => {
    console.log('Exporting data with settings:', importExport);
  };

  const importData = () => {
    document.getElementById('import-file').click();
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Importing file:', file.name);
    }
  };

  const cleanupData = () => {
    if (confirm('This will remove old completed tasks, temporary files, and unused data. Continue?')) {
      console.log('Cleaning up data...');
      setStorageAnalytics(prev => ({ ...prev, lastCleanup: new Date().toISOString().split('T')[0] }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'in-progress': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800/60 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-8">Data Management</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Backup Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Automatic Backup</p>
                  <p className="text-sm text-gray-400">Automatically backup your data regularly</p>
                </div>
                <button
                  onClick={() => handleBackupChange('autoBackup', !backupSettings.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    backupSettings.autoBackup ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Encryption</p>
                  <p className="text-sm text-gray-400">Encrypt backup files for security</p>
                </div>
                <button
                  onClick={() => handleBackupChange('encryption', !backupSettings.encryption)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    backupSettings.encryption ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      backupSettings.encryption ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Frequency</label>
                  <select
                    value={backupSettings.frequency}
                    onChange={(e) => handleBackupChange('frequency', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Location</label>
                  <select
                    value={backupSettings.location}
                    onChange={(e) => handleBackupChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="cloud">Cloud Storage</option>
                    <option value="local">Local Storage</option>
                    <option value="external">External Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Retention (days)</label>
                  <input
                    type="number"
                    value={backupSettings.retention}
                    onChange={(e) => handleBackupChange('retention', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={createBackup}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Backup Now
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Backup History</h3>
            
            <div className="bg-slate-700/30 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 bg-slate-600/30 text-sm font-medium text-gray-300">
                <span>Date & Time</span>
                <span>Size</span>
                <span>Status</span>
                <span>Type</span>
                <span>Actions</span>
              </div>
              
              <div className="divide-y divide-slate-600/50">
                {backupHistory.map((backup) => (
                  <div key={backup.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                    <span className="text-white text-sm">{backup.date}</span>
                    <span className="text-gray-400 text-sm">{backup.size}</span>
                    <span className={`text-sm font-medium ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                    <span className="text-gray-400 text-sm capitalize">{backup.type}</span>
                    <div className="flex space-x-2">
                      {backup.status === 'completed' && (
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Import & Export</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Export Format</label>
                  <select
                    value={importExport.format}
                    onChange={(e) => handleImportExportChange('format', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Include Media Files</label>
                    <button
                      onClick={() => handleImportExportChange('includeMedia', !importExport.includeMedia)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        importExport.includeMedia ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          importExport.includeMedia ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Include Settings</label>
                    <button
                      onClick={() => handleImportExportChange('includeSettings', !importExport.includeSettings)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        importExport.includeSettings ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          importExport.includeSettings ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Use Compression</label>
                    <button
                      onClick={() => handleImportExportChange('compression', !importExport.compression)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        importExport.compression ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          importExport.compression ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={exportData}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Export Data
                </button>
                <button
                  onClick={importData}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Import Data
                </button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json,.csv,.xml,.xlsx"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Data Synchronization</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Cross-Device Sync</p>
                  <p className="text-sm text-gray-400">Keep your data synchronized across all devices</p>
                </div>
                <button
                  onClick={() => handleDataSyncChange('enabled', !dataSync.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    dataSync.enabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dataSync.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {dataSync.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Conflict Resolution</label>
                    <select
                      value={dataSync.conflictResolution}
                      onChange={(e) => handleDataSyncChange('conflictResolution', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="latest">Use Latest Version</option>
                      <option value="manual">Manual Resolution</option>
                      <option value="merge">Auto Merge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Bandwidth Usage</label>
                    <select
                      value={dataSync.bandwidth}
                      onChange={(e) => handleDataSyncChange('bandwidth', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="unlimited">Unlimited</option>
                      <option value="high">High (10 MB/min)</option>
                      <option value="medium">Medium (5 MB/min)</option>
                      <option value="low">Low (1 MB/min)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Storage Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{storageAnalytics.totalTasks}</div>
                <div className="text-sm text-gray-400">Total Tasks</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{storageAnalytics.totalProjects}</div>
                <div className="text-sm text-gray-400">Projects</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{storageAnalytics.totalFiles}</div>
                <div className="text-sm text-gray-400">Files</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400">{storageAnalytics.dataSize}</div>
                <div className="text-sm text-gray-400">Total Size</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">Data Cleanup</p>
                  <p className="text-sm text-gray-400">Last cleanup: {storageAnalytics.lastCleanup}</p>
                </div>
                <button
                  onClick={cleanupData}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cleanup Now
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Remove old completed tasks, temporary files, and optimize database for better performance.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Data Privacy</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">🔒 Data Encryption</h4>
                <p className="text-sm text-blue-300">
                  All your data is encrypted both in transit and at rest using AES-256 encryption.
                </p>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <h4 className="text-green-400 font-medium mb-2">🌍 Data Location</h4>
                <p className="text-sm text-green-300">
                  Your data is stored in secure data centers with compliance to GDPR and other privacy regulations.
                </p>
              </div>

              <div className="p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
                <h4 className="text-purple-400 font-medium mb-2">🔄 Data Portability</h4>
                <p className="text-sm text-purple-300">
                  You can export your data at any time in standard formats for use with other applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}