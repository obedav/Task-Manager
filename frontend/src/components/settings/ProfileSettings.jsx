// Profile Settings Component
import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { validateProfileForm } from '../../utils/validation';

const inputCls = (error) =>
  `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
    error ? 'border-danger' : 'border-line'
  }`;

const FormField = ({ label, name, type = 'text', value, onChange, error, required = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={inputCls(error)}
      style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
      {...props}
    />
    {error && <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
  </div>
);

export default function ProfileSettings() {
  const { settings, updateProfile, saveSettings, isLoading: globalLoading } = useSettings();
  const [formData, setFormData]     = useState(settings.profile);
  const [isLoading, setIsLoading]   = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => { setFormData(settings.profile); }, [settings.profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    updateProfile(newData);
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newData = { ...formData, avatar: e.target.result };
        setFormData(newData);
        updateProfile(newData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveMessage('');
    setValidationErrors({});

    const validation = validateProfileForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await saveSettings();
      if (result.success) {
        setSaveMessage('Profile saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Error saving profile: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setSaveMessage('Error saving profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isError = (msg) => msg.includes('Error');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl p-8 border border-line" style={{ background: 'var(--surface)' }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>Profile Settings</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar row */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
                style={{ background: 'linear-gradient(135deg, var(--royal), var(--gold))' }}
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (formData.firstName?.charAt(0) || '') + (formData.lastName?.charAt(0) || '')
                )}
              </div>
              <label
                className="absolute bottom-0 right-0 text-white rounded-full p-2 cursor-pointer transition-all hover:opacity-90"
                style={{ background: 'var(--royal)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                {formData.firstName} {formData.lastName}
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>{formData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} error={validationErrors.firstName} required />
            <FormField label="Last Name"  name="lastName"  value={formData.lastName  || ''} onChange={handleInputChange} error={validationErrors.lastName}  required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Email"  name="email"  type="email" value={formData.email  || ''} onChange={handleInputChange} error={validationErrors.email}  required />
            <FormField label="Phone"  name="phone"  type="tel"   value={formData.phone  || ''} onChange={handleInputChange} error={validationErrors.phone}  />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Location" name="location" value={formData.location || ''} onChange={handleInputChange} error={validationErrors.location} />
            <FormField label="Website"  name="website"  type="url" value={formData.website || ''} onChange={handleInputChange} error={validationErrors.website} placeholder="https://example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              rows={4}
              className={inputCls(validationErrors.bio)}
              style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
              placeholder="Tell us about yourself..."
            />
            {validationErrors.bio && <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{validationErrors.bio}</p>}
          </div>

          {saveMessage && (
            <div
              className="p-4 rounded-lg"
              style={
                isError(saveMessage)
                  ? { background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)' }
                  : { background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)' }
              }
            >
              {saveMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || globalLoading}
              className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--royal)' }}
            >
              {isLoading || globalLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
