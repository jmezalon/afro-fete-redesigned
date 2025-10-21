/**
 * Input Validation Utilities
 *
 * This module provides helper functions for validating user inputs,
 * form data, and sanitizing strings.
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 *
 * @example
 * validateEmail('user@example.com'); // Returns: true
 * validateEmail('invalid.email'); // Returns: false
 * validateEmail(''); // Returns: false
 *
 * @test
 * describe('validateEmail', () => {
 *   it('should validate correct email formats', () => {
 *     expect(validateEmail('user@example.com')).toBe(true);
 *     expect(validateEmail('test.name@domain.co.uk')).toBe(true);
 *     expect(validateEmail('user+tag@example.com')).toBe(true);
 *   });
 *
 *   it('should reject invalid email formats', () => {
 *     expect(validateEmail('invalid')).toBe(false);
 *     expect(validateEmail('user@')).toBe(false);
 *     expect(validateEmail('@example.com')).toBe(false);
 *     expect(validateEmail('')).toBe(false);
 *     expect(validateEmail('user @example.com')).toBe(false);
 *   });
 *
 *   it('should handle non-string inputs', () => {
 *     expect(validateEmail(null)).toBe(false);
 *     expect(validateEmail(undefined)).toBe(false);
 *     expect(validateEmail(123)).toBe(false);
 *   });
 * });
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors array
 *
 * Requirements:
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 *
 * @example
 * validatePassword('Example123!');
 * // Returns: { isValid: true, errors: [] }
 *
 * validatePassword('weak');
 * // Returns: {
 * //   isValid: false,
 * //   errors: ['Password must be at least 8 characters', ...]
 * // }
 *
 * @test
 * describe('validatePassword', () => {
 *   it('should validate strong passwords', () => {
 *     const result = validatePassword('Example123!');
 *     expect(result.isValid).toBe(true);
 *     expect(result.errors).toHaveLength(0);
 *   });
 *
 *   it('should reject short passwords', () => {
 *     const result = validatePassword('Ab1!');
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors).toContain('Password must be at least 8 characters');
 *   });
 *
 *   it('should require uppercase letter', () => {
 *     const result = validatePassword('example123!');
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors).toContain('Password must contain at least one uppercase letter');
 *   });
 *
 *   it('should require lowercase letter', () => {
 *     const result = validatePassword('EXAMPLE123!');
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors).toContain('Password must contain at least one lowercase letter');
 *   });
 *
 *   it('should require number', () => {
 *     const result = validatePassword('ExamplePass!');
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors).toContain('Password must contain at least one number');
 *   });
 *
 *   it('should require special character', () => {
 *     const result = validatePassword('Example123');
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors).toContain('Password must contain at least one special character');
 *   });
 * });
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
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
    errors,
  };
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} Validation result with isValid and error message
 *
 * Requirements:
 * - 3-20 characters
 * - Alphanumeric and underscores only
 * - Must start with a letter
 *
 * @example
 * validateUsername('john_doe');
 * // Returns: { isValid: true, error: null }
 *
 * validateUsername('ab');
 * // Returns: { isValid: false, error: 'Username must be 3-20 characters' }
 *
 * @test
 * describe('validateUsername', () => {
 *   it('should validate correct usernames', () => {
 *     expect(validateUsername('john_doe').isValid).toBe(true);
 *     expect(validateUsername('user123').isValid).toBe(true);
 *     expect(validateUsername('test_user_123').isValid).toBe(true);
 *   });
 *
 *   it('should reject short usernames', () => {
 *     const result = validateUsername('ab');
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Username must be 3-20 characters');
 *   });
 *
 *   it('should reject long usernames', () => {
 *     const result = validateUsername('a'.repeat(21));
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Username must be 3-20 characters');
 *   });
 *
 *   it('should reject usernames with special characters', () => {
 *     const result = validateUsername('user@name');
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Username can only contain letters, numbers, and underscores');
 *   });
 *
 *   it('should reject usernames starting with number', () => {
 *     const result = validateUsername('123user');
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Username must start with a letter');
 *   });
 * });
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3 || trimmed.length > 20) {
    return { isValid: false, error: 'Username must be 3-20 characters' };
  }

  if (!/^[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Username must start with a letter' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate hashtag format
 * @param {string} hashtag - Hashtag to validate
 * @returns {Object} Validation result with isValid and error message
 *
 * Requirements:
 * - 1-30 characters (without #)
 * - Alphanumeric only
 * - No spaces or special characters
 *
 * @example
 * validateHashtag('#afrobeats');
 * // Returns: { isValid: true, error: null }
 *
 * validateHashtag('afrobeats');
 * // Returns: { isValid: true, error: null }
 *
 * validateHashtag('#afro beats');
 * // Returns: { isValid: false, error: 'Hashtag cannot contain spaces' }
 *
 * @test
 * describe('validateHashtag', () => {
 *   it('should validate correct hashtags', () => {
 *     expect(validateHashtag('#afrobeats').isValid).toBe(true);
 *     expect(validateHashtag('afrobeats').isValid).toBe(true);
 *     expect(validateHashtag('#NYC2025').isValid).toBe(true);
 *   });
 *
 *   it('should reject hashtags with spaces', () => {
 *     const result = validateHashtag('#afro beats');
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Hashtag cannot contain spaces');
 *   });
 *
 *   it('should reject hashtags with special characters', () => {
 *     const result = validateHashtag('#afro-beats');
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Hashtag can only contain letters and numbers');
 *   });
 *
 *   it('should reject too long hashtags', () => {
 *     const result = validateHashtag('#' + 'a'.repeat(31));
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Hashtag must be 1-30 characters');
 *   });
 *
 *   it('should reject empty hashtags', () => {
 *     const result = validateHashtag('#');
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('Hashtag must be 1-30 characters');
 *   });
 * });
 */
export const validateHashtag = (hashtag) => {
  if (!hashtag || typeof hashtag !== 'string') {
    return { isValid: false, error: 'Hashtag is required' };
  }

  // Remove # if present
  const normalized = hashtag.replace('#', '').trim();

  if (normalized.length === 0 || normalized.length > 30) {
    return { isValid: false, error: 'Hashtag must be 1-30 characters' };
  }

  if (/\s/.test(normalized)) {
    return { isValid: false, error: 'Hashtag cannot contain spaces' };
  }

  if (!/^[a-zA-Z0-9]+$/.test(normalized)) {
    return { isValid: false, error: 'Hashtag can only contain letters and numbers' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate array of hashtags
 * @param {Array<string>} hashtags - Array of hashtags to validate
 * @param {number} maxCount - Maximum number of hashtags allowed
 * @returns {Object} Validation result with isValid, errors, and validHashtags
 *
 * @example
 * validateHashtags(['#afrobeats', '#brooklyn', '#soca'], 5);
 * // Returns: { isValid: true, errors: [], validHashtags: ['afrobeats', 'brooklyn', 'soca'] }
 *
 * validateHashtags(['#afrobeats', '#invalid tag'], 5);
 * // Returns: { isValid: false, errors: ['Hashtag "invalid tag" is invalid: ...'], validHashtags: ['afrobeats'] }
 *
 * @test
 * describe('validateHashtags', () => {
 *   it('should validate array of hashtags', () => {
 *     const result = validateHashtags(['#afrobeats', '#brooklyn'], 5);
 *     expect(result.isValid).toBe(true);
 *     expect(result.validHashtags).toEqual(['afrobeats', 'brooklyn']);
 *   });
 *
 *   it('should reject when exceeding max count', () => {
 *     const result = validateHashtags(['#a', '#b', '#c'], 2);
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors).toContain('Maximum 2 hashtags allowed');
 *   });
 *
 *   it('should filter out invalid hashtags', () => {
 *     const result = validateHashtags(['#valid', '#invalid tag', '#another'], 5);
 *     expect(result.isValid).toBe(false);
 *     expect(result.validHashtags).toEqual(['valid', 'another']);
 *   });
 *
 *   it('should remove duplicates', () => {
 *     const result = validateHashtags(['#afrobeats', '#afrobeats'], 5);
 *     expect(result.validHashtags).toEqual(['afrobeats']);
 *   });
 * });
 */
export const validateHashtags = (hashtags, maxCount = 10) => {
  const errors = [];
  const validHashtags = [];

  if (!Array.isArray(hashtags)) {
    return { isValid: false, errors: ['Hashtags must be an array'], validHashtags: [] };
  }

  if (hashtags.length === 0) {
    return { isValid: true, errors: [], validHashtags: [] };
  }

  if (hashtags.length > maxCount) {
    errors.push(`Maximum ${maxCount} hashtags allowed`);
  }

  // Validate each hashtag and collect valid ones
  const seen = new Set();
  hashtags.forEach((tag) => {
    const validation = validateHashtag(tag);
    if (validation.isValid) {
      const normalized = tag.replace('#', '').toLowerCase().trim();
      if (!seen.has(normalized)) {
        validHashtags.push(normalized);
        seen.add(normalized);
      }
    } else {
      errors.push(`Hashtag "${tag}" is invalid: ${validation.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validHashtags,
  };
};

/**
 * Validate event form data
 * @param {Object} formData - Event form data object
 * @returns {Object} Validation result with isValid and errors object
 *
 * @example
 * validateEventForm({
 *   name: 'Afrobeats Night',
 *   venue: 'Brooklyn Bowl',
 *   date: '2025-12-31T20:00:00',
 *   category: 'nightlife',
 *   hashtags: ['afrobeats', 'brooklyn']
 * });
 * // Returns: { isValid: true, errors: {} }
 *
 * @test
 * describe('validateEventForm', () => {
 *   it('should validate complete event form', () => {
 *     const formData = {
 *       name: 'Afrobeats Night',
 *       venue: 'Brooklyn Bowl',
 *       date: '2025-12-31T20:00:00',
 *       category: 'nightlife',
 *       description: 'Great party',
 *       hashtags: ['afrobeats', 'brooklyn']
 *     };
 *     const result = validateEventForm(formData);
 *     expect(result.isValid).toBe(true);
 *     expect(Object.keys(result.errors)).toHaveLength(0);
 *   });
 *
 *   it('should require event name', () => {
 *     const result = validateEventForm({ name: '' });
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors.name).toBe('Event name is required');
 *   });
 *
 *   it('should require venue', () => {
 *     const result = validateEventForm({ name: 'Event', venue: '' });
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors.venue).toBe('Venue is required');
 *   });
 *
 *   it('should validate date format', () => {
 *     const result = validateEventForm({
 *       name: 'Event',
 *       venue: 'Venue',
 *       date: 'invalid'
 *     });
 *     expect(result.isValid).toBe(false);
 *     expect(result.errors.date).toBe('Invalid date format');
 *   });
 * });
 */
export const validateEventForm = (formData) => {
  const errors = {};

  // Validate name
  if (!formData.name || typeof formData.name !== 'string' || !formData.name.trim()) {
    errors.name = 'Event name is required';
  } else if (formData.name.trim().length < 3) {
    errors.name = 'Event name must be at least 3 characters';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Event name must be less than 100 characters';
  }

  // Validate venue
  if (!formData.venue || typeof formData.venue !== 'string' || !formData.venue.trim()) {
    errors.venue = 'Venue is required';
  }

  // Validate date
  if (!formData.date) {
    errors.date = 'Event date is required';
  } else {
    const eventDate = new Date(formData.date);
    if (isNaN(eventDate.getTime())) {
      errors.date = 'Invalid date format';
    } else {
      const now = new Date();
      if (eventDate < now) {
        errors.date = 'Event date must be in the future';
      }
    }
  }

  // Validate category
  const validCategories = ['brunch', 'nightlife', 'festivals', 'arts', 'afterwork', 'concerts', 'dayparty', 'boatrides'];
  if (!formData.category || !validCategories.includes(formData.category)) {
    errors.category = 'Valid category is required';
  }

  // Validate description (optional but has limits if provided)
  if (formData.description && typeof formData.description === 'string') {
    if (formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
  }

  // Validate price (optional)
  if (formData.price !== undefined && formData.price !== null) {
    const price = Number(formData.price);
    if (isNaN(price) || price < 0) {
      errors.price = 'Price must be a positive number';
    } else if (price > 10000) {
      errors.price = 'Price seems unreasonably high';
    }
  }

  // Validate hashtags (optional)
  if (formData.hashtags) {
    if (!Array.isArray(formData.hashtags)) {
      errors.hashtags = 'Hashtags must be an array';
    } else {
      const hashtagValidation = validateHashtags(formData.hashtags, 10);
      if (!hashtagValidation.isValid) {
        errors.hashtags = hashtagValidation.errors.join(', ');
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize input string to prevent XSS
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 *
 * @example
 * sanitizeInput('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 *
 * sanitizeInput('Hello & "World"');
 * // Returns: 'Hello &amp; &quot;World&quot;'
 *
 * @test
 * describe('sanitizeInput', () => {
 *   it('should escape HTML entities', () => {
 *     const result = sanitizeInput('<div>Hello</div>');
 *     expect(result).toBe('&lt;div&gt;Hello&lt;/div&gt;');
 *   });
 *
 *   it('should escape script tags', () => {
 *     const result = sanitizeInput('<script>alert("xss")</script>');
 *     expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
 *   });
 *
 *   it('should escape quotes', () => {
 *     const result = sanitizeInput('"Hello" and \'World\'');
 *     expect(result).toBe('&quot;Hello&quot; and &#x27;World&#x27;');
 *   });
 *
 *   it('should handle empty strings', () => {
 *     expect(sanitizeInput('')).toBe('');
 *   });
 *
 *   it('should handle non-string inputs', () => {
 *     expect(sanitizeInput(null)).toBe('');
 *     expect(sanitizeInput(undefined)).toBe('');
 *     expect(sanitizeInput(123)).toBe('123');
 *   });
 * });
 */
export const sanitizeInput = (input) => {
  if (input === null || input === undefined) {
    return '';
  }

  if (typeof input !== 'string') {
    input = String(input);
  }

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char]);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 *
 * @example
 * validateURL('https://example.com'); // Returns: true
 * validateURL('http://example.com/path'); // Returns: true
 * validateURL('invalid-url'); // Returns: false
 *
 * @test
 * describe('validateURL', () => {
 *   it('should validate correct URLs', () => {
 *     expect(validateURL('https://example.com')).toBe(true);
 *     expect(validateURL('http://example.com')).toBe(true);
 *     expect(validateURL('https://example.com/path')).toBe(true);
 *     expect(validateURL('https://example.com/path?query=value')).toBe(true);
 *   });
 *
 *   it('should reject invalid URLs', () => {
 *     expect(validateURL('invalid')).toBe(false);
 *     expect(validateURL('example.com')).toBe(false);
 *     expect(validateURL('')).toBe(false);
 *   });
 *
 *   it('should handle non-string inputs', () => {
 *     expect(validateURL(null)).toBe(false);
 *     expect(validateURL(undefined)).toBe(false);
 *     expect(validateURL(123)).toBe(false);
 *   });
 * });
 */
export const validateURL = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate phone number format (US format)
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result with isValid and formatted number
 *
 * @example
 * validatePhoneNumber('(555) 123-4567');
 * // Returns: { isValid: true, formatted: '5551234567' }
 *
 * validatePhoneNumber('555-123-4567');
 * // Returns: { isValid: true, formatted: '5551234567' }
 *
 * @test
 * describe('validatePhoneNumber', () => {
 *   it('should validate US phone numbers', () => {
 *     expect(validatePhoneNumber('(555) 123-4567').isValid).toBe(true);
 *     expect(validatePhoneNumber('555-123-4567').isValid).toBe(true);
 *     expect(validatePhoneNumber('5551234567').isValid).toBe(true);
 *   });
 *
 *   it('should return formatted number', () => {
 *     const result = validatePhoneNumber('(555) 123-4567');
 *     expect(result.formatted).toBe('5551234567');
 *   });
 *
 *   it('should reject invalid phone numbers', () => {
 *     expect(validatePhoneNumber('123').isValid).toBe(false);
 *     expect(validatePhoneNumber('invalid').isValid).toBe(false);
 *   });
 * });
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, formatted: null };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // US phone numbers should have 10 digits
  if (digits.length !== 10) {
    return { isValid: false, formatted: null };
  }

  return { isValid: true, formatted: digits };
};
