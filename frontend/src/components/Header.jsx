// Header Component - Fresh Updated Version
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Plus, Search, User, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = ({ onAddTask, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const { t, ready } = useTranslation();

  const closeAllMenus = useCallback(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setIsProfileOpen(false);
  }, []);

  const handleProfileToggle = useCallback(() => {
    console.log('🔍 Profile toggle clicked, current state:', isProfileOpen);
    setIsProfileOpen(prev => {
      const newState = !prev;
      console.log('🔍 Setting profile state to:', newState);
      return newState;
    });
  }, [isProfileOpen]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setIsProfileOpen(false);
  }, []);

  const handleSettingsClick = useCallback(() => {
    navigate('/settings');
    closeAllMenus();
  }, [navigate, closeAllMenus]);

  const handleLogoutClick = useCallback(() => {
    onLogout();
    closeAllMenus();
  }, [onLogout, closeAllMenus]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleAddTaskClick = useCallback(() => {
    onAddTask();
    setIsMenuOpen(false);
  }, [onAddTask]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('🔍 Click outside detected, isProfileOpen:', isProfileOpen);
      if (
        isProfileOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        console.log('🔍 Closing profile dropdown due to outside click');
        setIsProfileOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeAllMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProfileOpen, closeAllMenus]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('🔍 Profile dropdown state changed:', {
      isProfileOpen,
      isMenuOpen,
      profileMenuRef: profileMenuRef.current,
      timestamp: new Date().toISOString()
    });
  }, [isProfileOpen, isMenuOpen]);

  useEffect(() => {
    if (user?.photoUrl && user.photoUrl !== photoPreview) {
      setPhotoPreview(user.photoUrl);
    }
  }, [user?.photoUrl, photoPreview]);

  const getText = useCallback((key, fallback) => {
    if (!ready) return fallback;
    const translated = t(key, fallback);
    return translated === key ? fallback : translated;
  }, [ready, t]);

  const UserAvatar = () => (
    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
      {photoPreview ? (
        <img 
          src={photoPreview} 
          alt="Profile" 
          className="w-8 h-8 object-cover rounded-full"
          onError={() => setPhotoPreview(null)}
        />
      ) : (
        <User className="w-4 h-4 text-white" />
      )}
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/20" style={{overflow: 'visible'}}>
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Search */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm opacity-90"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>

            {/* Search Bar - moved closer to logo */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={getText('tasks.search', 'Search tasks...')}
                className="bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2 ">
            {/* New Task Button */}
            <button
              onClick={onAddTask}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 sm:px-6 py-2 rounded-xl flex items-center space-x-1 transition-all text-sm sm:text-base min-w-0"
              aria-label="Add new task"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">New Task</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* User Profile */}
            <div className="relative" ref={profileMenuRef}>
              <button
                ref={buttonRef => {
                  if (buttonRef && isProfileOpen) {
                    const rect = buttonRef.getBoundingClientRect();
                    console.log('🔍 Desktop button position:', {
                      top: rect.top,
                      left: rect.left,
                      bottom: rect.bottom,
                      right: rect.right,
                      width: rect.width,
                      height: rect.height
                    });
                  }
                }}
                onClick={(e) => {
                  console.log('🔍 Desktop profile button clicked:', e);
                  try {
                    handleProfileToggle();
                  } catch (error) {
                    console.error('🚨 Error in handleProfileToggle:', error);
                  }
                }}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                aria-label="Open profile menu"
                aria-expanded={isProfileOpen}
              >
                <UserAvatar />
                <span className="text-white font-medium">
                  {user?.name || 'User'}
                </span>
              </button>
              
              {isProfileOpen && (
                <div
                  className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-3 transition-all duration-200 origin-top-right"
                  style={{
                    position: 'fixed',
                    top: '60px',
                    left: 'calc(100% - 350px)',
                    width: '240px',
                    zIndex: 2147483647,
                    transform: 'none',
                    filter: 'none'
                  }}
                  ref={el => {
                    if (el) {
                      const rect = el.getBoundingClientRect();
                      const computed = window.getComputedStyle(el);
                      console.log('🔍 Desktop dropdown positioned:', {
                        position: rect,
                        visible: rect.width > 0 && rect.height > 0
                      });
                    }
                  }}
                >
                  <label className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 flex items-center space-x-3 cursor-pointer text-sm transition-colors rounded-lg mx-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      aria-label="Upload profile photo"
                    />
                    <User className="w-4 h-4" />
                    <span>{getText('settings.profile.updatePhoto', 'Update Photo')}</span>
                  </label>
                  
                  <div className="border-t border-slate-700 my-2 mx-2"></div>
                  
                  <div className="flex space-x-2 px-2">
                    <button
                      className="flex-1 py-2.5 px-3 text-gray-300 hover:text-white hover:bg-slate-700/50 flex items-center justify-center space-x-2 text-sm rounded-lg transition-colors"
                      onClick={handleSettingsClick}
                    >
                      <Settings className="w-4 h-4" />
                      <span>{getText('navigation.settings', 'Settings')}</span>
                    </button>
                    
                    <button
                      className="flex-1 py-2.5 px-3 text-red-400 hover:text-red-300 hover:bg-slate-700/50 flex items-center justify-center space-x-2 text-sm rounded-lg transition-colors"
                      onClick={handleLogoutClick}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{getText('auth.logout', 'Logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileMenuToggle}
            className="md:hidden p-2 text-white hover:bg-slate-800/50 rounded-lg transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-700/50 pt-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={getText('tasks.search', 'Search tasks...')}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* New Task Button */}
              <div className="flex justify-start">
                <button
                  onClick={handleAddTaskClick}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all text-sm min-w-0"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{getText('tasks.addTask', 'New Task')}</span>
                </button>
              </div>
              
              {/* Mobile User Profile */}
              <div className="relative">
                <button
                  ref={buttonRef => {
                    if (buttonRef && isProfileOpen) {
                      const rect = buttonRef.getBoundingClientRect();
                      console.log('🔍 Mobile button position:', {
                        top: rect.top,
                        left: rect.left,
                        bottom: rect.bottom,
                        right: rect.right,
                        width: rect.width,
                        height: rect.height
                      });
                    }
                  }}
                  onClick={(e) => {
                    console.log('🔍 Mobile profile button clicked:', e);
                    try {
                      handleProfileToggle();
                    } catch (error) {
                      console.error('🚨 Error in mobile handleProfileToggle:', error);
                    }
                  }}
                  className="flex flex-col items-center space-y-1 p-3 rounded-xl hover:bg-slate-800/50 transition-colors w-full"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileOpen}
                >
                  <UserAvatar />
                  <span className="text-white font-medium text-sm">
                    {user?.name || 'User'}
                  </span>
                </button>

                {isProfileOpen && (
                  <div 
                    className="mobile-profile-dropdown-debug"
                    className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-3 transition-all duration-200 origin-top"
                    style={{
                      position: 'fixed',
                      top: '60px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '240px',
                      zIndex: 2147483647,
                      filter: 'none'
                    }}
                    ref={el => {
                      if (el) {
                        const rect = el.getBoundingClientRect();
                        const computed = window.getComputedStyle(el);
                        console.log('🔍 Mobile dropdown positioned:', {
                          position: rect,
                          visible: rect.width > 0 && rect.height > 0
                        });
                      }
                    }}
                  >
                    <label className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 flex items-center space-x-3 cursor-pointer text-sm transition-colors rounded-lg mx-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                        aria-label="Upload profile photo"
                      />
                      <User className="w-4 h-4" />
                      <span>{getText('settings.profile.updatePhoto', 'Update Photo')}</span>
                    </label>
                    
                    <div className="border-t border-slate-700 my-2 mx-2"></div>
                    
                    <div className="flex space-x-2 px-2">
                      <button
                        className="flex-1 py-2.5 px-3 text-gray-300 hover:text-white hover:bg-slate-700/50 flex items-center justify-center space-x-2 text-sm rounded-lg transition-colors"
                        onClick={handleSettingsClick}
                      >
                        <Settings className="w-4 h-4" />
                        <span>{getText('navigation.settings', 'Settings')}</span>
                      </button>
                      
                      <button
                        className="flex-1 py-2.5 px-3 text-red-400 hover:text-red-300 hover:bg-slate-700/50 flex items-center justify-center space-x-2 text-sm rounded-lg transition-colors"
                        onClick={handleLogoutClick}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{getText('auth.logout', 'Logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;