// Validation utilities for settings forms

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateUrl = (url) => {
  if (!url) return true; // URL is optional
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, errors: ['Password is required'] };
  
  const errors = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProfileForm = (formData) => {
  const errors = {};
  
  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (formData.website && !validateUrl(formData.website)) {
    errors.website = 'Please enter a valid URL';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSecurityForm = (passwordForm) => {
  const errors = {};
  
  if (!passwordForm.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  if (!passwordForm.newPassword) {
    errors.newPassword = 'New password is required';
  } else {
    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.errors[0];
    }
  }
  
  if (!passwordForm.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  return start < end;
};

export const validateWorkingHours = (workingHours) => {
  const errors = {};
  
  if (workingHours.enabled) {
    if (!workingHours.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!workingHours.endTime) {
      errors.endTime = 'End time is required';
    }
    
    if (workingHours.startTime && workingHours.endTime && 
        !validateTimeRange(workingHours.startTime, workingHours.endTime)) {
      errors.timeRange = 'End time must be after start time';
    }
    
    if (!workingHours.workDays || workingHours.workDays.length === 0) {
      errors.workDays = 'Please select at least one working day';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateQuietHours = (preferences) => {
  const errors = {};
  
  if (preferences.quietHours) {
    if (!preferences.quietStart) {
      errors.quietStart = 'Quiet hours start time is required';
    }
    
    if (!preferences.quietEnd) {
      errors.quietEnd = 'Quiet hours end time is required';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};