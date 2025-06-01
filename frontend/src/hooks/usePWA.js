// frontend/src/hooks/usePWA.js
import { useState, useEffect } from 'react';
import pwaService from '../services/pwaService';

export const usePWA = () => {
  const [installInfo, setInstallInfo] = useState({
    isInstalled: false,
    canInstall: false,
    notificationPermission: 'default',
    isOnline: true
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineTasks, setOfflineTasks] = useState([]);

  useEffect(() => {
    // Initial state
    updateInstallInfo();
    loadOfflineTasks();

    // Event listeners
    const handleInstallable = () => {
      updateInstallInfo();
    };

    const handleInstalled = () => {
      updateInstallInfo();
    };

    const handleInstallSuccess = () => {
      // Show success toast or notification
      console.log('🎉 App installed successfully!');
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleOnline = () => {
      updateInstallInfo();
      pwaService.syncOfflineTasks();
    };

    const handleOffline = () => {
      updateInstallInfo();
    };

    const handleOfflineTasksSynced = (event) => {
      setOfflineTasks([]);
      console.log('✅ Offline tasks synced:', event.detail.syncedTasks);
    };

    const handleNewTaskShortcut = () => {
      // This can be handled by parent component
      console.log('📱 New task shortcut triggered');
    };

    // Add event listeners
    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('pwa-install-success', handleInstallSuccess);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('app-online', handleOnline);
    window.addEventListener('app-offline', handleOffline);
    window.addEventListener('offline-tasks-synced', handleOfflineTasksSynced);
    window.addEventListener('pwa-new-task', handleNewTaskShortcut);

    // Cleanup
    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('pwa-install-success', handleInstallSuccess);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('app-online', handleOnline);
      window.removeEventListener('app-offline', handleOffline);
      window.removeEventListener('offline-tasks-synced', handleOfflineTasksSynced);
      window.removeEventListener('pwa-new-task', handleNewTaskShortcut);
    };
  }, []);

  const updateInstallInfo = () => {
    setInstallInfo(pwaService.getInstallInfo());
  };

  const loadOfflineTasks = async () => {
    const tasks = await pwaService.getOfflineTasks();
    setOfflineTasks(tasks);
  };

  const installApp = async () => {
    const success = await pwaService.showInstallPrompt();
    if (success) {
      updateInstallInfo();
    }
    return success;
  };

  const requestNotifications = async () => {
    const granted = await pwaService.requestNotificationPermission();
    updateInstallInfo();
    return granted;
  };

  const updateApp = () => {
    pwaService.updateApp();
    setUpdateAvailable(false);
  };

  const createOfflineTask = async (taskData) => {
    try {
      const offlineTask = await pwaService.storeOfflineTask(taskData);
      await loadOfflineTasks();
      return offlineTask;
    } catch (error) {
      console.error('Failed to create offline task:', error);
      throw error;
    }
  };

  const syncOfflineTasks = async () => {
    const syncedTasks = await pwaService.syncOfflineTasks();
    await loadOfflineTasks();
    return syncedTasks;
  };

  return {
    // State
    isInstalled: installInfo.isInstalled,
    canInstall: installInfo.canInstall,
    isOnline: installInfo.isOnline,
    notificationPermission: installInfo.notificationPermission,
    updateAvailable,
    offlineTasks,
    hasOfflineTasks: offlineTasks.length > 0,

    // Actions
    installApp,
    requestNotifications,
    updateApp,
    createOfflineTask,
    syncOfflineTasks,
    
    // Utils
    getInstallInfo: () => installInfo
  };
};

export default usePWA;