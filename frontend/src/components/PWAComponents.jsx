// frontend/src/components/PWAComponents.jsx
import React from 'react';
import { Download, Bell, Wifi, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';

// Always export and use InstallAppButton and PWAInstallPrompt in the main layout/header
// These components will show the install button/prompt when the app is installable
export const InstallAppButton = ({ className = '' }) => {
  const { canInstall, installApp, isInstalled } = usePWA();
  const { t } = useTranslation();

  if (isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installation initiated');
    }
  };

  return (
    <button
      onClick={handleInstall}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg transition-all flex items-center space-x-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>{t('pwa.installApp')}</span>
    </button>
  );
};

// Notification Permission Button
export const NotificationButton = ({ className = '' }) => {
  const { notificationPermission, requestNotifications } = usePWA();
  const { t } = useTranslation();

  if (notificationPermission === 'granted') {
    return (
      <div className={`flex items-center space-x-2 text-green-400 ${className}`}>
        <Bell className="w-4 h-4" />
        <span className="text-sm">{t('pwa.notificationsEnabled')}</span>
      </div>
    );
  }

  if (notificationPermission === 'denied') {
    return (
      <div className={`flex items-center space-x-2 text-red-400 ${className}`}>
        <Bell className="w-4 h-4" />
        <span className="text-sm">{t('pwa.notificationsBlocked')}</span>
      </div>
    );
  }

  const handleRequest = async () => {
    const granted = await requestNotifications();
    if (granted) {
      console.log('Notification permission granted');
    }
  };

  return (
    <button
      onClick={handleRequest}
      className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 ${className}`}
    >
      <Bell className="w-4 h-4" />
      <span>{t('pwa.enableNotifications')}</span>
    </button>
  );
};

// Online/Offline Status Indicator
export const OnlineStatus = ({ className = '' }) => {
  const { isOnline } = usePWA();
  const { t } = useTranslation();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">{t('pwa.online')}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">{t('pwa.offline')}</span>
        </>
      )}
    </div>
  );
};

// Update Available Banner
export const UpdateBanner = () => {
  const { updateAvailable, updateApp } = usePWA();
  const { t } = useTranslation();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>{t('pwa.newVersion')}</span>
        </div>
        <button
          onClick={updateApp}
          className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          {t('pwa.updateNow')}
        </button>
      </div>
    </div>
  );
};

// Offline Tasks Indicator
export const OfflineTasksIndicator = () => {
  const { hasOfflineTasks, offlineTasks, syncOfflineTasks, isOnline } = usePWA();
  const { t } = useTranslation();

  if (!hasOfflineTasks) {
    return null;
  }

  const handleSync = async () => {
    if (isOnline) {
      await syncOfflineTasks();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <WifiOff className="w-5 h-5 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium">{t('pwa.offlineTasks')}</h4>
          <p className="text-sm opacity-90">
            {offlineTasks.length} {t('pwa.offlineTasksCount', { count: offlineTasks.length })}
          </p>
          {isOnline && (
            <button
              onClick={handleSync}
              className="mt-2 bg-white text-yellow-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              {t('pwa.syncNow')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// PWA Install Prompt (for custom install flow)
export const PWAInstallPrompt = ({ isOpen, onClose }) => {
  const { installApp, isInstalled } = usePWA();
  const { t } = useTranslation();

  if (!isOpen || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            {t('pwa.installTaskFlow')}
          </h3>
          
          <p className="text-gray-400 mb-6">
            {t('pwa.installPromptDescription')}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('pwa.worksOffline')}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('pwa.pushNotifications')}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('pwa.homeScreenIcon')}</span>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-colors"
            >
              {t('pwa.maybeLater')}
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl transition-all"
            >
              {t('pwa.install')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PWA Features Summary Component (for settings or about page)
export const PWAFeatures = () => {
  const { isInstalled, notificationPermission, isOnline } = usePWA();
  const { t } = useTranslation();

  const features = [
    {
      name: t('pwa.appInstallation'),
      description: t('pwa.appInstallationDescription'),
      status: isInstalled ? t('pwa.enabled') : t('pwa.available'),
      icon: Download
    },
    {
      name: t('pwa.pushNotifications'),
      description: t('pwa.pushNotificationsDescription'),
      status: notificationPermission === 'granted' ? t('pwa.enabled') : 
             notificationPermission === 'denied' ? t('pwa.blocked') : t('pwa.available'),
      icon: Bell
    },
    {
      name: t('pwa.offlineSupport'),
      description: t('pwa.offlineSupportDescription'),
      status: t('pwa.enabled'),
      icon: isOnline ? Wifi : WifiOff
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case t('pwa.enabled'): return 'text-green-400';
      case t('pwa.blocked'): return 'text-red-400';
      case t('pwa.available'): return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case t('pwa.enabled'): return t('pwa.enabled');
      case t('pwa.blocked'): return t('pwa.blocked');
      case t('pwa.available'): return t('pwa.available');
      default: return t('pwa.unknown');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{t('pwa.pwaFeatures')}</h3>
      
      <div className="space-y-4">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div key={feature.name} className="flex items-center space-x-3">
              <IconComponent className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-white">{feature.name}</div>
                <div className="text-sm text-gray-400">{feature.description}</div>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(feature.status)}`}>
                {getStatusText(feature.status)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};