// frontend/src/components/PWAComponents.jsx
import React from 'react';
import { Download, Bell, Wifi, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

// Install App Button Component
export const InstallAppButton = ({ className = '' }) => {
  const { canInstall, installApp, isInstalled } = usePWA();

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
      <span>Install App</span>
    </button>
  );
};

// Notification Permission Button
export const NotificationButton = ({ className = '' }) => {
  const { notificationPermission, requestNotifications } = usePWA();

  if (notificationPermission === 'granted') {
    return (
      <div className={`flex items-center space-x-2 text-green-400 ${className}`}>
        <Bell className="w-4 h-4" />
        <span className="text-sm">Notifications enabled</span>
      </div>
    );
  }

  if (notificationPermission === 'denied') {
    return (
      <div className={`flex items-center space-x-2 text-red-400 ${className}`}>
        <Bell className="w-4 h-4" />
        <span className="text-sm">Notifications blocked</span>
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
      <span>Enable Notifications</span>
    </button>
  );
};

// Online/Offline Status Indicator
export const OnlineStatus = ({ className = '' }) => {
  const { isOnline } = usePWA();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">Offline</span>
        </>
      )}
    </div>
  );
};

// Update Available Banner
export const UpdateBanner = () => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>A new version of TaskFlow is available!</span>
        </div>
        <button
          onClick={updateApp}
          className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          Update Now
        </button>
      </div>
    </div>
  );
};

// Offline Tasks Indicator
export const OfflineTasksIndicator = () => {
  const { hasOfflineTasks, offlineTasks, syncOfflineTasks, isOnline } = usePWA();

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
          <h4 className="font-medium">Offline Tasks</h4>
          <p className="text-sm opacity-90">
            {offlineTasks.length} task{offlineTasks.length !== 1 ? 's' : ''} created offline
          </p>
          {isOnline && (
            <button
              onClick={handleSync}
              className="mt-2 bg-white text-yellow-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Sync Now
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
            Install TaskFlow
          </h3>
          
          <p className="text-gray-400 mb-6">
            Install TaskFlow on your device for quick access, offline support, and a native app experience.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Works offline</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Push notifications</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Home screen icon</span>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl transition-all"
            >
              Install
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

  const features = [
    {
      name: 'App Installation',
      description: 'Install on home screen',
      status: isInstalled ? 'enabled' : 'available',
      icon: Download
    },
    {
      name: 'Push Notifications',
      description: 'Get task reminders',
      status: notificationPermission === 'granted' ? 'enabled' : 
             notificationPermission === 'denied' ? 'blocked' : 'available',
      icon: Bell
    },
    {
      name: 'Offline Support',
      description: 'Works without internet',
      status: 'enabled',
      icon: isOnline ? Wifi : WifiOff
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'enabled': return 'text-green-400';
      case 'blocked': return 'text-red-400';
      case 'available': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'enabled': return 'Enabled';
      case 'blocked': return 'Blocked';
      case 'available': return 'Available';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">PWA Features</h3>
      
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