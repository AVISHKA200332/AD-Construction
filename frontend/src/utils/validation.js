// Comprehensive validation utilities for AD Construction Project Management

// Special characters validation (!, #, $, %)
export const validateSpecialCharacters = (value) => {
  if (!value || typeof value !== 'string') return true;
  const specialChars = /[!#$%]/;
  return !specialChars.test(value);
};

// Age validation
export const validateAge = (age) => {
  if (!age) return true; // Optional field
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= 0;
};

// Budget validation (100K to 1B)
export const validateBudget = (budget) => {
  if (!budget) return false;
  const numBudget = parseFloat(budget);
  return !isNaN(numBudget) && numBudget >= 100000 && numBudget <= 1000000000;
};

// Date validation (from today onwards)
export const validateDateFromToday = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  return inputDate >= today;
};

// End date validation (must be after start date)
export const validateEndDate = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return new Date(endDate) > new Date(startDate);
};

// Bank account validation (numbers only)
export const validateBankAccount = (accountNumber) => {
  if (!accountNumber) return true; // Optional field
  return /^\d+$/.test(accountNumber);
};

// Phone number validation
export const validatePhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  return /^[\d\s\-\+\(\)]+$/.test(phone);
};

// Email validation
export const validateEmail = (email) => {
  if (!email) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Project name validation
export const validateProjectName = (name) => {
  if (!name) return { isValid: false, message: 'Project name is required' };
  if (name.length < 3) return { isValid: false, message: 'Project name must be at least 3 characters' };
  if (name.length > 100) return { isValid: false, message: 'Project name cannot exceed 100 characters' };
  if (!validateSpecialCharacters(name)) return { isValid: false, message: 'Project name cannot contain special characters (!, #, $, %)' };
  return { isValid: true };
};

// Client name validation
export const validateClientName = (name) => {
  if (!name) return { isValid: false, message: 'Client name is required' };
  if (name.length < 2) return { isValid: false, message: 'Client name must be at least 2 characters' };
  if (name.length > 100) return { isValid: false, message: 'Client name cannot exceed 100 characters' };
  if (!validateSpecialCharacters(name)) return { isValid: false, message: 'Client name cannot contain special characters (!, #, $, %)' };
  return { isValid: true };
};

// Budget validation with formatting
export const validateAndFormatBudget = (budget) => {
  if (!budget) return { isValid: false, message: 'Budget is required' };
  
  // Remove commas and spaces
  const cleanBudget = budget.toString().replace(/[,\s]/g, '');
  const numBudget = parseFloat(cleanBudget);
  
  if (isNaN(numBudget)) return { isValid: false, message: 'Budget must be a valid number' };
  if (numBudget < 100000) return { isValid: false, message: 'Budget must be at least Rs. 100,000' };
  if (numBudget > 1000000000) return { isValid: false, message: 'Budget cannot exceed Rs. 1,000,000,000' };
  
  return { 
    isValid: true, 
    value: numBudget,
    formatted: new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(numBudget)
  };
};

// Completion percentage validation
export const validateCompletion = (completion) => {
  if (completion === '' || completion === null || completion === undefined) return { isValid: false, message: 'Completion percentage is required' };
  
  const numCompletion = parseFloat(completion);
  if (isNaN(numCompletion)) return { isValid: false, message: 'Completion must be a valid number' };
  if (numCompletion < 0) return { isValid: false, message: 'Completion cannot be less than 0%' };
  if (numCompletion > 100) return { isValid: false, message: 'Completion cannot exceed 100%' };
  
  return { isValid: true, value: numCompletion };
};

// Project manager validation
export const validateProjectManager = (manager) => {
  const errors = [];
  
  if (manager.name && !validateSpecialCharacters(manager.name)) {
    errors.push('Project manager name cannot contain special characters (!, #, $, %)');
  }
  
  if (manager.age && !validateAge(manager.age)) {
    errors.push('Project manager age must be a positive number');
  }
  
  if (manager.experience && (isNaN(manager.experience) || manager.experience < 0)) {
    errors.push('Experience cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Location validation
export const validateLocation = (location) => {
  const errors = [];
  
  if (location.address && !validateSpecialCharacters(location.address)) {
    errors.push('Address cannot contain special characters (!, #, $, %)');
  }
  
  if (location.city && !validateSpecialCharacters(location.city)) {
    errors.push('City cannot contain special characters (!, #, $, %)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Description validation
export const validateDescription = (description) => {
  if (!description) return { isValid: true }; // Optional field
  
  if (description.length > 1000) {
    return { isValid: false, message: 'Description cannot exceed 1000 characters' };
  }
  
  if (!validateSpecialCharacters(description)) {
    return { isValid: false, message: 'Description cannot contain special characters (!, #, $, %)' };
  }
  
  return { isValid: true };
};

// Comprehensive project validation
export const validateProject = (project) => {
  const errors = [];
  const warnings = [];
  
  // Required field validations
  const nameValidation = validateProjectName(project.name);
  if (!nameValidation.isValid) errors.push(nameValidation.message);
  
  const clientValidation = validateClientName(project.client);
  if (!clientValidation.isValid) errors.push(clientValidation.message);
  
  const budgetValidation = validateAndFormatBudget(project.budget);
  if (!budgetValidation.isValid) errors.push(budgetValidation.message);
  
  const completionValidation = validateCompletion(project.completion);
  if (!completionValidation.isValid) errors.push(completionValidation.message);
  
  // Date validations
  if (!project.startDate) {
    errors.push('Start date is required');
  } else if (!validateDateFromToday(project.startDate)) {
    errors.push('Start date must be from today onwards');
  }
  
  if (!project.endDate) {
    errors.push('End date is required');
  } else if (project.startDate && !validateEndDate(project.startDate, project.endDate)) {
    errors.push('End date must be after start date');
  }
  
  // Optional field validations
  if (project.clientContact) {
    if (project.clientContact.phone && !validatePhoneNumber(project.clientContact.phone)) {
      errors.push('Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses');
    }
    
    if (project.clientContact.email && !validateEmail(project.clientContact.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (project.clientContact.bankAccount && !validateBankAccount(project.clientContact.bankAccount)) {
      errors.push('Bank account number can only contain digits');
    }
  }
  
  if (project.projectManager) {
    const managerValidation = validateProjectManager(project.projectManager);
    if (!managerValidation.isValid) {
      errors.push(...managerValidation.errors);
    }
  }
  
  if (project.location) {
    const locationValidation = validateLocation(project.location);
    if (!locationValidation.isValid) {
      errors.push(...locationValidation.errors);
    }
  }
  
  if (project.description) {
    const descriptionValidation = validateDescription(project.description);
    if (!descriptionValidation.isValid) {
      errors.push(descriptionValidation.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    budgetFormatted: budgetValidation.formatted
  };
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove special characters (!, #, $, %)
  return input.replace(/[!#$%]/g, '');
};

// Format currency for display
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return 'Rs. 0';
  
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Get status color based on status
export const getStatusColor = (status) => {
  const colors = {
    'Planning': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

// Generate project ID (frontend helper)
export const generateProjectId = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AD-${year}${month}-${random}`;
};

