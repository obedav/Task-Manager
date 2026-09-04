import { useState, useEffect } from 'react';
import authService from '../../services/authService';

export default function AuthStatusCheck() {
  const [authStatus, setAuthStatus] = useState(null);
  const [apiStatus, setApiStatus] = useState('');
  
  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken();
      const user = authService.getUserData();
      
      setAuthStatus({
        hasToken: !!token,
        hasUser: !!user,
        token: token ? `${token.substring(0, 20)}...` : null,
        user: user
      });
    };
    
    checkAuth();
  }, []);
  
  const testApiConnection = async () => {
    setApiStatus('Testing...');
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setApiStatus('✅ API Connected');
      } else {
        setApiStatus('❌ API Error: ' + response.status);
      }
    } catch (error) {
      setApiStatus('❌ Connection Failed: ' + error.message);
    }
  };
  
  if (!authStatus) return null;
  
  return (
    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
      <h4 className="text-blue-400 font-medium mb-2">🔍 Authentication Status</h4>
      <div className="text-sm space-y-1">
        <p className={authStatus.hasToken ? 'text-green-400' : 'text-red-400'}>
          Token: {authStatus.hasToken ? '✅ Present' : '❌ Missing'}
        </p>
        <p className={authStatus.hasUser ? 'text-green-400' : 'text-red-400'}>
          User Data: {authStatus.hasUser ? '✅ Present' : '❌ Missing'}
        </p>
        {authStatus.token && (
          <p className="text-gray-400">Token: {authStatus.token}</p>
        )}
        {authStatus.user && (
          <p className="text-gray-400">User: {authStatus.user.email || authStatus.user.username || 'Unknown'}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <button 
            onClick={testApiConnection}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Test API
          </button>
          {apiStatus && <span className="text-xs text-gray-300">{apiStatus}</span>}
        </div>
      </div>
    </div>
  );
}