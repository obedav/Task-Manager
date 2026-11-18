import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { validatePassword } from '../utils/validation';

export default function ResetPassword() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="p-8 rounded-2xl border border-line text-center" style={{ background: 'var(--surface)' }}>
          <p style={{ color: 'var(--danger)' }}>Invalid reset link. Please request a new one.</p>
          <button onClick={() => navigate('/')} className="mt-4 font-medium" style={{ color: 'var(--royal)' }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validatePassword(form.newPassword);
    if (!validation.isValid) { setError(validation.errors[0]); return; }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl border border-line" style={{ background: 'var(--surface)' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Set a new password</h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Must be at least 12 characters with uppercase, lowercase, a number, and a special character.
        </p>

        {success ? (
          <div className="p-4 rounded-lg" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)' }}>
            Password reset successfully! Redirecting to sign in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg text-sm" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>New Password</label>
              <input
                id="new-password" type="password" required value={form.newPassword}
                onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                className={inputCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
              <input
                id="confirm-password" type="password" required value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className={inputCls} style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--royal)' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
