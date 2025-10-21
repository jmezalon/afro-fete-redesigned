/**
 * Date Formatting and Comparison Utilities
 *
 * This module provides helper functions for formatting dates, comparing dates,
 * and getting date ranges for event filtering.
 */

/**
 * Format date for event display (e.g., "JAN 14", "DEC 31")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string in "MMM DD" format
 * @throws {TypeError} If date is invalid
 *
 * @example
 * formatEventDate('2025-01-14T20:00:00');
 * // Returns: "JAN 14"
 *
 * formatEventDate(new Date('2025-12-31'));
 * // Returns: "DEC 31"
 *
 * @test
 * describe('formatEventDate', () => {
 *   it('should format date as "MMM DD"', () => {
 *     const result = formatEventDate('2025-01-14T20:00:00');
 *     expect(result).toBe('JAN 14');
 *   });
 *
 *   it('should handle Date objects', () => {
 *     const result = formatEventDate(new Date('2025-12-31'));
 *     expect(result).toBe('DEC 31');
 *   });
 *
 *   it('should throw error for invalid date', () => {
 *     expect(() => formatEventDate('invalid')).toThrow(TypeError);
 *   });
 *
 *   it('should pad single digit days', () => {
 *     const result = formatEventDate('2025-05-05T20:00:00');
 *     expect(result).toBe('MAY 05');
 *   });
 * });
 */
export const formatEventDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${month} ${day}`;
};

/**
 * Format date with full month name and year (e.g., "January 14, 2025")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 * @throws {TypeError} If date is invalid
 *
 * @example
 * formatFullDate('2025-01-14T20:00:00');
 * // Returns: "January 14, 2025"
 *
 * @test
 * describe('formatFullDate', () => {
 *   it('should format date with full month name', () => {
 *     const result = formatFullDate('2025-01-14T20:00:00');
 *     expect(result).toBe('January 14, 2025');
 *   });
 *
 *   it('should handle Date objects', () => {
 *     const result = formatFullDate(new Date('2025-12-31'));
 *     expect(result).toBe('December 31, 2025');
 *   });
 * });
 */
export const formatFullDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  return `${month} ${day}, ${year}`;
};

/**
 * Format time for event display (e.g., "9:00 PM", "2:30 AM")
 * @param {Date|string} date - Date/time to format
 * @returns {string} Formatted time string
 * @throws {TypeError} If date is invalid
 *
 * @example
 * formatEventTime('2025-01-14T21:00:00');
 * // Returns: "9:00 PM"
 *
 * formatEventTime('2025-01-14T14:30:00');
 * // Returns: "2:30 PM"
 *
 * @test
 * describe('formatEventTime', () => {
 *   it('should format time in 12-hour format', () => {
 *     const result = formatEventTime('2025-01-14T21:00:00');
 *     expect(result).toBe('9:00 PM');
 *   });
 *
 *   it('should handle minutes', () => {
 *     const result = formatEventTime('2025-01-14T14:30:00');
 *     expect(result).toBe('2:30 PM');
 *   });
 *
 *   it('should handle midnight', () => {
 *     const result = formatEventTime('2025-01-14T00:00:00');
 *     expect(result).toBe('12:00 AM');
 *   });
 *
 *   it('should handle noon', () => {
 *     const result = formatEventTime('2025-01-14T12:00:00');
 *     expect(result).toBe('12:00 PM');
 *   });
 * });
 */
export const formatEventTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  const minutesStr = String(minutes).padStart(2, '0');

  return `${hours}:${minutesStr} ${ampm}`;
};

/**
 * Get relative date description (e.g., "Today", "Tomorrow", "Saturday")
 * @param {Date|string} date - Date to describe
 * @returns {string} Relative date description
 * @throws {TypeError} If date is invalid
 *
 * @example
 * // If today is Monday, Jan 13, 2025
 * getRelativeDateDescription('2025-01-13T20:00:00');
 * // Returns: "Today"
 *
 * getRelativeDateDescription('2025-01-14T20:00:00');
 * // Returns: "Tomorrow"
 *
 * getRelativeDateDescription('2025-01-18T20:00:00');
 * // Returns: "Saturday"
 *
 * @test
 * describe('getRelativeDateDescription', () => {
 *   const now = new Date('2025-01-13T10:00:00'); // Monday
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return "Today" for today', () => {
 *     const result = getRelativeDateDescription('2025-01-13T20:00:00');
 *     expect(result).toBe('Today');
 *   });
 *
 *   it('should return "Tomorrow" for tomorrow', () => {
 *     const result = getRelativeDateDescription('2025-01-14T20:00:00');
 *     expect(result).toBe('Tomorrow');
 *   });
 *
 *   it('should return day name for this week', () => {
 *     const result = getRelativeDateDescription('2025-01-18T20:00:00');
 *     expect(result).toBe('Saturday');
 *   });
 *
 *   it('should return formatted date for beyond this week', () => {
 *     const result = getRelativeDateDescription('2025-01-25T20:00:00');
 *     expect(result).toBe('JAN 25');
 *   });
 * });
 */
export const getRelativeDateDescription = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const eventDate = new Date(dateObj);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate - now;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Tomorrow';
  }

  if (diffDays > 1 && diffDays <= 6) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dateObj.getDay()];
  }

  return formatEventDate(dateObj);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 * @throws {TypeError} If date is invalid
 *
 * @example
 * // If today is Jan 13, 2025
 * isToday('2025-01-13T20:00:00'); // Returns: true
 * isToday('2025-01-14T20:00:00'); // Returns: false
 *
 * @test
 * describe('isToday', () => {
 *   const now = new Date('2025-01-13T10:00:00');
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return true for today', () => {
 *     expect(isToday('2025-01-13T20:00:00')).toBe(true);
 *     expect(isToday('2025-01-13T00:00:00')).toBe(true);
 *     expect(isToday('2025-01-13T23:59:59')).toBe(true);
 *   });
 *
 *   it('should return false for other days', () => {
 *     expect(isToday('2025-01-14T20:00:00')).toBe(false);
 *     expect(isToday('2025-01-12T20:00:00')).toBe(false);
 *   });
 * });
 */
export const isToday = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const checkDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  return today.getTime() === checkDate.getTime();
};

/**
 * Check if date is tomorrow
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is tomorrow
 * @throws {TypeError} If date is invalid
 *
 * @example
 * // If today is Jan 13, 2025
 * isTomorrow('2025-01-14T20:00:00'); // Returns: true
 * isTomorrow('2025-01-13T20:00:00'); // Returns: false
 *
 * @test
 * describe('isTomorrow', () => {
 *   const now = new Date('2025-01-13T10:00:00');
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return true for tomorrow', () => {
 *     expect(isTomorrow('2025-01-14T20:00:00')).toBe(true);
 *     expect(isTomorrow('2025-01-14T00:00:00')).toBe(true);
 *   });
 *
 *   it('should return false for other days', () => {
 *     expect(isTomorrow('2025-01-13T20:00:00')).toBe(false);
 *     expect(isTomorrow('2025-01-15T20:00:00')).toBe(false);
 *   });
 * });
 */
export const isTomorrow = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const checkDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  return tomorrow.getTime() === checkDate.getTime();
};

/**
 * Check if date is this weekend (Saturday or Sunday)
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is this weekend
 * @throws {TypeError} If date is invalid
 *
 * @example
 * // If today is Monday, Jan 13, 2025
 * isThisWeekend('2025-01-18T20:00:00'); // Saturday - Returns: true
 * isThisWeekend('2025-01-19T20:00:00'); // Sunday - Returns: true
 * isThisWeekend('2025-01-20T20:00:00'); // Next Monday - Returns: false
 *
 * @test
 * describe('isThisWeekend', () => {
 *   const now = new Date('2025-01-13T10:00:00'); // Monday
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return true for this Saturday', () => {
 *     expect(isThisWeekend('2025-01-18T20:00:00')).toBe(true);
 *   });
 *
 *   it('should return true for this Sunday', () => {
 *     expect(isThisWeekend('2025-01-19T20:00:00')).toBe(true);
 *   });
 *
 *   it('should return false for weekdays', () => {
 *     expect(isThisWeekend('2025-01-14T20:00:00')).toBe(false);
 *   });
 *
 *   it('should return false for next weekend', () => {
 *     expect(isThisWeekend('2025-01-25T20:00:00')).toBe(false);
 *   });
 * });
 */
export const isThisWeekend = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const now = new Date();
  const currentDayOfWeek = now.getDay();

  // Calculate days until Saturday
  const daysUntilSaturday = currentDayOfWeek === 0 ? 6 : 6 - currentDayOfWeek;

  // Get this weekend's Saturday and Sunday
  const thisSaturday = new Date(now);
  thisSaturday.setDate(now.getDate() + daysUntilSaturday);
  thisSaturday.setHours(0, 0, 0, 0);

  const thisSunday = new Date(thisSaturday);
  thisSunday.setDate(thisSaturday.getDate() + 1);

  const checkDate = new Date(dateObj);
  checkDate.setHours(0, 0, 0, 0);

  return (
    checkDate.getTime() === thisSaturday.getTime() ||
    checkDate.getTime() === thisSunday.getTime()
  );
};

/**
 * Check if date is in the current month
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in current month
 * @throws {TypeError} If date is invalid
 *
 * @example
 * // If current month is January 2025
 * isThisMonth('2025-01-25T20:00:00'); // Returns: true
 * isThisMonth('2025-02-01T20:00:00'); // Returns: false
 *
 * @test
 * describe('isThisMonth', () => {
 *   const now = new Date('2025-01-13T10:00:00');
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return true for dates in current month', () => {
 *     expect(isThisMonth('2025-01-01T20:00:00')).toBe(true);
 *     expect(isThisMonth('2025-01-31T20:00:00')).toBe(true);
 *   });
 *
 *   it('should return false for dates in other months', () => {
 *     expect(isThisMonth('2024-12-31T20:00:00')).toBe(false);
 *     expect(isThisMonth('2025-02-01T20:00:00')).toBe(false);
 *   });
 * });
 */
export const isThisMonth = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const now = new Date();

  return (
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear()
  );
};

/**
 * Get date range for a given range type
 * @param {string} range - Range type ('today', 'tomorrow', 'weekend', 'month', 'week')
 * @returns {Object} Object with start and end dates
 * @throws {Error} If range type is invalid
 *
 * @example
 * getDateRange('today');
 * // Returns: { start: Date (start of today), end: Date (end of today) }
 *
 * getDateRange('weekend');
 * // Returns: { start: Date (Saturday 00:00), end: Date (Sunday 23:59) }
 *
 * @test
 * describe('getDateRange', () => {
 *   const now = new Date('2025-01-13T10:00:00'); // Monday
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return today range', () => {
 *     const { start, end } = getDateRange('today');
 *     expect(start.getDate()).toBe(13);
 *     expect(end.getDate()).toBe(13);
 *     expect(start.getHours()).toBe(0);
 *     expect(end.getHours()).toBe(23);
 *   });
 *
 *   it('should return weekend range', () => {
 *     const { start, end } = getDateRange('weekend');
 *     expect(start.getDay()).toBe(6); // Saturday
 *     expect(end.getDay()).toBe(0); // Sunday
 *   });
 *
 *   it('should return month range', () => {
 *     const { start, end } = getDateRange('month');
 *     expect(start.getDate()).toBe(1);
 *     expect(end.getMonth()).toBe(0); // January
 *   });
 *
 *   it('should throw error for invalid range', () => {
 *     expect(() => getDateRange('invalid')).toThrow(Error);
 *   });
 * });
 */
export const getDateRange = (range) => {
  if (!range || typeof range !== 'string') {
    throw new Error('Invalid range type');
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let start, end;

  switch (range.toLowerCase()) {
    case 'today': {
      start = new Date(now);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'tomorrow': {
      start = new Date(now);
      start.setDate(start.getDate() + 1);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'weekend': {
      const dayOfWeek = now.getDay();
      const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
      start = new Date(now);
      start.setDate(start.getDate() + daysUntilSaturday);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'week': {
      start = new Date(now);
      end = new Date(now);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case 'month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }

    default:
      throw new Error(`Invalid range type: ${range}`);
  }

  return { start, end };
};

/**
 * Check if event has passed (is in the past)
 * @param {Date|string} date - Event date to check
 * @returns {boolean} True if event has passed
 * @throws {TypeError} If date is invalid
 *
 * @example
 * // If current time is Jan 13, 2025, 10:00 AM
 * hasEventPassed('2025-01-12T20:00:00'); // Returns: true
 * hasEventPassed('2025-01-14T20:00:00'); // Returns: false
 *
 * @test
 * describe('hasEventPassed', () => {
 *   const now = new Date('2025-01-13T10:00:00');
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return true for past events', () => {
 *     expect(hasEventPassed('2025-01-12T20:00:00')).toBe(true);
 *     expect(hasEventPassed('2025-01-13T09:00:00')).toBe(true);
 *   });
 *
 *   it('should return false for future events', () => {
 *     expect(hasEventPassed('2025-01-13T11:00:00')).toBe(false);
 *     expect(hasEventPassed('2025-01-14T20:00:00')).toBe(false);
 *   });
 * });
 */
export const hasEventPassed = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const now = new Date();
  return dateObj < now;
};

/**
 * Get days until event
 * @param {Date|string} date - Event date
 * @returns {number} Number of days until event (negative if passed)
 * @throws {TypeError} If date is invalid
 *
 * @example
 * // If today is Jan 13, 2025
 * getDaysUntilEvent('2025-01-16T20:00:00'); // Returns: 3
 * getDaysUntilEvent('2025-01-10T20:00:00'); // Returns: -3
 *
 * @test
 * describe('getDaysUntilEvent', () => {
 *   const now = new Date('2025-01-13T10:00:00');
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should return positive days for future events', () => {
 *     expect(getDaysUntilEvent('2025-01-16T20:00:00')).toBe(3);
 *   });
 *
 *   it('should return negative days for past events', () => {
 *     expect(getDaysUntilEvent('2025-01-10T20:00:00')).toBe(-3);
 *   });
 *
 *   it('should return 0 for today', () => {
 *     expect(getDaysUntilEvent('2025-01-13T20:00:00')).toBe(0);
 *   });
 * });
 */
export const getDaysUntilEvent = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new TypeError('Invalid date provided');
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const eventDate = new Date(dateObj);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate - now;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
