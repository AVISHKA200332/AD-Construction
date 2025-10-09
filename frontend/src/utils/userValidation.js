// User-specific validation utilities for AD Construction User Management

// Special characters validation (!, #, $, %)
export const validateSpecialCharacters = (value) => {
  if (!value || typeof value !== 'string') return true;
  const specialChars = /[!#$%]/;
  return !specialChars.test(value);
};

// Age validation
export const validateAge = (age) => {
  if (!age) return false;
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= 1 && numAge <= 120;
};

// Phone number validation
export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  const phoneString = phone.toString(); // Convert to string first
  const cleanPhone = phoneString.replace(/\D/g, '');
  return cleanPhone.length === 10;
};

// Email validation
export const validateEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Name validation
export const validateUserName = (name) => {
  if (!name) return { isValid: false, message: 'Name is required' };
  if (name.length < 2) return { isValid: false, message: 'Name must be at least 2 characters' };
  if (name.length > 50) return { isValid: false, message: 'Name cannot exceed 50 characters' };
  if (!validateSpecialCharacters(name)) return { isValid: false, message: 'Name cannot contain special characters (!, #, $, %)' };
  return { isValid: true };
};

// Email validation with formatting
export const validateUserEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email is required' };
  if (!validateEmail(email)) return { isValid: false, message: 'Please enter a valid email address' };
  if (email.length > 100) return { isValid: false, message: 'Email cannot exceed 100 characters' };
  return { isValid: true };
};

// Phone number validation with formatting
export const validateUserPhone = (phone) => {
  if (!phone) return { isValid: false, message: 'Phone number is required' };
  
  const phoneString = phone.toString(); // Convert to string first
  if (!validatePhoneNumber(phoneString)) return { isValid: false, message: 'Please enter a valid phone number (exactly 10 digits)' };
  
  return { 
    isValid: true, 
    value: phoneString.replace(/\D/g, '') 
  };
};

// Age validation with formatting
export const validateUserAge = (age) => {
  if (!age) return { isValid: false, message: 'Age is required' };
  const numAge = parseInt(age);
  if (isNaN(numAge)) return { isValid: false, message: 'Age must be a valid number' };
  if (numAge < 1) return { isValid: false, message: 'Age must be at least 1' };
  if (numAge > 120) return { isValid: false, message: 'Age cannot exceed 120' };
  return { isValid: true, value: numAge };
};

// Role validation
export const validateUserRole = (role) => {
  const validRoles = ["Client", "Admin", "Site Manager", "Supervisor", "Labor"];
  if (!role) return { isValid: false, message: 'Role is required' };
  if (!validRoles.includes(role)) return { isValid: false, message: 'Please select a valid role' };
  return { isValid: true };
};

// Address validation
export const validateUserAddress = (address) => {
  if (!address) return { isValid: false, message: 'Address is required' };
  if (address.length < 5) return { isValid: false, message: 'Address must be at least 5 characters' };
  if (address.length > 200) return { isValid: false, message: 'Address cannot exceed 200 characters' };
  if (!validateSpecialCharacters(address)) return { isValid: false, message: 'Address cannot contain special characters (!, #, $, %)' };
  return { isValid: true };
};

// Input sanitization for user data
export const sanitizeUserInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove special characters (!, #, $, %)
  let sanitized = input.replace(/[!#$%]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Comprehensive user validation
export const validateUser = (user) => {
  const errors = [];
  
  const nameValidation = validateUserName(user.name);
  if (!nameValidation.isValid) errors.push(nameValidation.message);
  
  const emailValidation = validateUserEmail(user.gmail);
  if (!emailValidation.isValid) errors.push(emailValidation.message);
  
  const phoneValidation = validateUserPhone(user.phone);
  if (!phoneValidation.isValid) errors.push(phoneValidation.message);
  
  const ageValidation = validateUserAge(user.age);
  if (!ageValidation.isValid) errors.push(ageValidation.message);
  
  const roleValidation = validateUserRole(user.role);
  if (!roleValidation.isValid) errors.push(roleValidation.message);
  
  const addressValidation = validateUserAddress(user.address);
  if (!addressValidation.isValid) errors.push(addressValidation.message);
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanData: {
      name: user.name ? sanitizeUserInput(user.name).trim() : '',
      gmail: user.gmail ? user.gmail.toLowerCase().trim() : '',
      phone: phoneValidation.value || (user.phone ? user.phone.toString().replace(/\D/g, '') : ''),
      role: user.role || 'Client',
      age: ageValidation.value || user.age,
      address: user.address ? sanitizeUserInput(user.address).trim() : '',
      password: user.password || ''
    }
  };
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  
  // Convert to string first to handle numbers
  const phoneString = phone.toString();
  const cleanPhone = phoneString.replace(/\D/g, '');
  
  if (cleanPhone.length === 0) return '-';
  
  // Sri Lankan phone number formatting
  if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
    return `+94 ${cleanPhone.substring(1, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
  } else if (cleanPhone.length === 9) {
    return `+94 ${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('94')) {
    return `+${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 4)} ${cleanPhone.substring(4, 7)} ${cleanPhone.substring(7)}`;
  }
  
  // Return original if no specific format matches
  return phoneString;
};

// Format user role for display
export const formatUserRole = (role) => {
  const roleFormats = {
    'Admin': { color: 'bg-red-100 text-red-800', label: 'Admin' },
    'Client': { color: 'bg-green-100 text-green-800', label: 'Client' },
    'Site Manager': { color: 'bg-indigo-100 text-indigo-800', label: 'Site Manager' },
    'Supervisor': { color: 'bg-yellow-100 text-yellow-800', label: 'Supervisor' },
    'Labor': { color: 'bg-orange-100 text-orange-800', label: 'Labor' }
  };
  return roleFormats[role] || { color: 'bg-gray-100 text-gray-800', label: role };
};

// Safe phone formatting with fallback
export const safeFormatPhoneNumber = (phone) => {
  try {
    return formatPhoneNumber(phone);
  } catch (error) {
    console.warn('Phone formatting error:', error);
    return phone ? phone.toString() : '-';
  }
};

// Export sanitizeUserInput as sanitizeInput for backward compatibility
export const sanitizeInput = sanitizeUserInput;