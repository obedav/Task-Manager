// frontend/src/services/pwaService.js - Improved version
class PWAService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.notificationPermission = 'default';
    this.init();
  }

  async init() {
    // Check if app is already installed
    this.checkInstallStatus();
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup install prompt
    this.setupInstallPrompt();
    
    // Setup notifications
    await this.setupNotifications();
    
    // Handle URL parameters (shortcuts)
    this.handleShortcuts();
    
    // Setup online/offline listeners
    this.setupOnlineOfflineListeners();
  }

  checkInstallStatus() {
    // Check if running in standalone mode (installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true;
    
    console.log('PWA installed:', this.isInstalled);
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('✅ Service Worker registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              this.showUpdateAvailable();
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  setupInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('💾 Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Show custom install button
      this.showInstallButton();
    });
    
    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA was installed');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstallSuccess();
    });
  }

  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }
    
    try {
      // Show the prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      
      // Clear the prompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    }
  }

  async setupNotifications() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      console.log('Notification permission:', this.notificationPermission);
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    }
    return false;
  }

  handleShortcuts() {
    // Handle URL parameters from app shortcuts
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'new-task') {
      // Trigger new task modal
      this.triggerNewTask();
    }
  }

  triggerNewTask() {
    // Dispatch custom event to trigger new task modal
    window.dispatchEvent(new CustomEvent('pwa-new-task'));
  }

  showInstallButton() {
    // Dispatch event to show install button in UI
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  }

  hideInstallButton() {
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  }

  showInstallSuccess() {
    // Show success message
    window.dispatchEvent(new CustomEvent('pwa-install-success'));
  }

  showUpdateAvailable() {
    // Show update available notification
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  async updateApp() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        // Tell the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page
        window.location.reload();
      }
    }
  }

  // Improved offline storage methods
  async storeOfflineTask(taskData) {
    try {
      const offlineTasks = await this.getOfflineTasks();
      const newTask = {
        ...taskData,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        offline: true,
        createdAt: new Date().toISOString(),
        status: 'pending',
        progress: 0
      };
      
      offlineTasks.push(newTask);
      localStorage.setItem('offline-tasks', JSON.stringify(offlineTasks));
      
      console.log('📱 Task stored offline:', newTask.title);
      return newTask;
    } catch (error) {
      console.error('Failed to store offline task:', error);
      throw error;
    }
  }

  async getOfflineTasks() {
    try {
      const stored = localStorage.getItem('offline-tasks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get offline tasks:', error);
      return [];
    }
  }

  async syncOfflineTasks() {
    try {
      const offlineTasks = await this.getOfflineTasks();
      if (offlineTasks.length === 0) {
        console.log('No offline tasks to sync');
        return [];
      }
      
      const syncedTasks = [];
      const failedTasks = [];
      
      console.log(`🔄 Attempting to sync ${offlineTasks.length} offline tasks`);
      
      for (const task of offlineTasks) {
        try {
          // Check if backend is available first
          const healthCheck = await fetch('/api/tasks', { 
            method: 'HEAD',
            timeout: 5000 
          });
          
          if (!healthCheck.ok) {
            throw new Error('Backend not available');
          }
          
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: task.title,
              description: task.description,
              priority: task.priority,
              dueDate: task.dueDate,
              category: task.category,
              estimatedHours: task.estimatedHours
            })
          });
          
          if (response.ok) {
            const syncedTask = await response.json();
            syncedTasks.push(syncedTask);
            console.log('✅ Synced offline task:', task.title);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('Failed to sync task:', task.title, error.message);
          failedTasks.push(task);
        }
      }
      
      // Update offline storage - keep failed tasks, remove synced ones
      if (syncedTasks.length > 0) {
        localStorage.setItem('offline-tasks', JSON.stringify(failedTasks));
        
        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('offline-tasks-synced', {
          detail: { 
            syncedTasks,
            remainingTasks: failedTasks.length
          }
        }));
        
        console.log(`✅ Successfully synced ${syncedTasks.length} tasks, ${failedTasks.length} failed`);
      }
      
      return syncedTasks;
    } catch (error) {
      console.error('Offline sync failed:', error);
      return [];
    }
  }

  // Check online status
  isOnline() {
    return navigator.onLine;
  }

  // Setup online/offline event listeners
  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      // Auto-sync when back online
      setTimeout(() => {
        this.syncOfflineTasks();
      }, 1000); // Wait a second for connection to stabilize
      
      window.dispatchEvent(new CustomEvent('app-online'));
    });
    
    window.addEventListener('offline', () => {
      console.log('📱 Gone offline');
      window.dispatchEvent(new CustomEvent('app-offline'));
    });
  }

  // Get app info
  getInstallInfo() {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.deferredPrompt,
      notificationPermission: this.notificationPermission,
      isOnline: this.isOnline()
    };
  }
}

// Create singleton instance
const pwaService = new PWAService();

export default pwaService;