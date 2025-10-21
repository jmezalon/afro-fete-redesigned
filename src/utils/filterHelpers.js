/**
 * Filter and Search Utilities for Events
 *
 * This module provides helper functions for filtering, searching, and sorting
 * events based on various criteria like hashtags, categories, time ranges, etc.
 */

/**
 * Filter events by a specific hashtag
 * @param {Array<Object>} events - Array of event objects
 * @param {string} hashtag - Hashtag to filter by (with or without #)
 * @returns {Array<Object>} Filtered array of events
 * @throws {TypeError} If events is not an array
 *
 * @example
 * const events = [
 *   { eventId: '1', hashtags: ['afrobeats', 'brooklyn'] },
 *   { eventId: '2', hashtags: ['soca', 'queens'] }
 * ];
 * const filtered = filterEventsByHashtag(events, '#afrobeats');
 * // Returns: [{ eventId: '1', hashtags: ['afrobeats', 'brooklyn'] }]
 *
 * @test
 * describe('filterEventsByHashtag', () => {
 *   it('should filter events by hashtag', () => {
 *     const events = [
 *       { eventId: '1', hashtags: ['afrobeats', 'brooklyn'] },
 *       { eventId: '2', hashtags: ['soca'] }
 *     ];
 *     const result = filterEventsByHashtag(events, 'afrobeats');
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 *
 *   it('should handle hashtag with # symbol', () => {
 *     const events = [{ eventId: '1', hashtags: ['afrobeats'] }];
 *     const result = filterEventsByHashtag(events, '#afrobeats');
 *     expect(result).toHaveLength(1);
 *   });
 *
 *   it('should be case insensitive', () => {
 *     const events = [{ eventId: '1', hashtags: ['AfroBeats'] }];
 *     const result = filterEventsByHashtag(events, 'afrobeats');
 *     expect(result).toHaveLength(1);
 *   });
 *
 *   it('should throw error for invalid input', () => {
 *     expect(() => filterEventsByHashtag('not an array', 'tag')).toThrow(TypeError);
 *   });
 * });
 */
export const filterEventsByHashtag = (events, hashtag) => {
  if (!Array.isArray(events)) {
    throw new TypeError('Events must be an array');
  }

  if (!hashtag || typeof hashtag !== 'string') {
    return events;
  }

  // Normalize hashtag: remove # and convert to lowercase
  const normalizedHashtag = hashtag.replace('#', '').toLowerCase().trim();

  if (!normalizedHashtag) {
    return events;
  }

  return events.filter((event) => {
    if (!event.hashtags || !Array.isArray(event.hashtags)) {
      return false;
    }

    return event.hashtags.some((tag) =>
      tag.toLowerCase() === normalizedHashtag
    );
  });
};

/**
 * Filter events by time range (today, tomorrow, this weekend, this month, custom)
 * @param {Array<Object>} events - Array of event objects
 * @param {string|Object} range - Time range ('today', 'tomorrow', 'weekend', 'month') or {start, end}
 * @returns {Array<Object>} Filtered array of events
 * @throws {TypeError} If events is not an array
 *
 * @example
 * const events = [
 *   { eventId: '1', date: '2025-10-21T20:00:00' },
 *   { eventId: '2', date: '2025-10-22T20:00:00' }
 * ];
 * const todayEvents = filterEventsByTimeRange(events, 'today');
 * // Returns events happening today
 *
 * const customRange = filterEventsByTimeRange(events, {
 *   start: '2025-10-21',
 *   end: '2025-10-23'
 * });
 * // Returns events between specified dates
 *
 * @test
 * describe('filterEventsByTimeRange', () => {
 *   const now = new Date('2025-10-21T10:00:00');
 *
 *   beforeEach(() => {
 *     jest.useFakeTimers().setSystemTime(now);
 *   });
 *
 *   afterEach(() => {
 *     jest.useRealTimers();
 *   });
 *
 *   it('should filter events for today', () => {
 *     const events = [
 *       { eventId: '1', date: '2025-10-21T20:00:00' },
 *       { eventId: '2', date: '2025-10-22T20:00:00' }
 *     ];
 *     const result = filterEventsByTimeRange(events, 'today');
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 *
 *   it('should filter events for custom range', () => {
 *     const events = [
 *       { eventId: '1', date: '2025-10-21T20:00:00' },
 *       { eventId: '2', date: '2025-10-23T20:00:00' }
 *     ];
 *     const result = filterEventsByTimeRange(events, {
 *       start: '2025-10-21',
 *       end: '2025-10-22'
 *     });
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 * });
 */
export const filterEventsByTimeRange = (events, range) => {
  if (!Array.isArray(events)) {
    throw new TypeError('Events must be an array');
  }

  if (!range) {
    return events;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  let startDate, endDate;

  if (typeof range === 'string') {
    switch (range.toLowerCase()) {
      case 'today': {
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'tomorrow': {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() + 1);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'weekend': {
        // Find next/current weekend (Saturday-Sunday)
        const dayOfWeek = now.getDay();
        const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() + daysUntilSaturday);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }
      default:
        return events;
    }
  } else if (typeof range === 'object' && range.start && range.end) {
    startDate = new Date(range.start);
    endDate = new Date(range.end);
    endDate.setHours(23, 59, 59, 999);
  } else {
    return events;
  }

  return events.filter((event) => {
    if (!event.date) {
      return false;
    }

    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
};

/**
 * Filter events by category
 * @param {Array<Object>} events - Array of event objects
 * @param {string} category - Category to filter by
 * @returns {Array<Object>} Filtered array of events
 * @throws {TypeError} If events is not an array
 *
 * @example
 * const events = [
 *   { eventId: '1', category: 'brunch' },
 *   { eventId: '2', category: 'nightlife' }
 * ];
 * const brunchEvents = filterEventsByCategory(events, 'brunch');
 * // Returns: [{ eventId: '1', category: 'brunch' }]
 *
 * @test
 * describe('filterEventsByCategory', () => {
 *   it('should filter events by category', () => {
 *     const events = [
 *       { eventId: '1', category: 'brunch' },
 *       { eventId: '2', category: 'nightlife' }
 *     ];
 *     const result = filterEventsByCategory(events, 'brunch');
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 *
 *   it('should be case insensitive', () => {
 *     const events = [{ eventId: '1', category: 'Brunch' }];
 *     const result = filterEventsByCategory(events, 'brunch');
 *     expect(result).toHaveLength(1);
 *   });
 *
 *   it('should return all events if no category provided', () => {
 *     const events = [{ eventId: '1', category: 'brunch' }];
 *     const result = filterEventsByCategory(events, '');
 *     expect(result).toHaveLength(1);
 *   });
 * });
 */
export const filterEventsByCategory = (events, category) => {
  if (!Array.isArray(events)) {
    throw new TypeError('Events must be an array');
  }

  if (!category || typeof category !== 'string') {
    return events;
  }

  const normalizedCategory = category.toLowerCase().trim();

  if (!normalizedCategory) {
    return events;
  }

  return events.filter((event) =>
    event.category && event.category.toLowerCase() === normalizedCategory
  );
};

/**
 * Search events by text query (searches name, description, venue, hashtags)
 * @param {Array<Object>} events - Array of event objects
 * @param {string} searchTerm - Search query
 * @returns {Array<Object>} Filtered array of events matching search
 * @throws {TypeError} If events is not an array
 *
 * @example
 * const events = [
 *   { eventId: '1', name: 'Afrobeats Night', description: 'Dance party', venue: 'Brooklyn Bowl' },
 *   { eventId: '2', name: 'Soca Brunch', description: 'Sunday vibes', venue: 'Queens Hall' }
 * ];
 * const results = searchEvents(events, 'brooklyn');
 * // Returns: [{ eventId: '1', name: 'Afrobeats Night', ... }]
 *
 * @test
 * describe('searchEvents', () => {
 *   const events = [
 *     {
 *       eventId: '1',
 *       name: 'Afrobeats Night',
 *       description: 'Dance party with DJ',
 *       venue: 'Brooklyn Bowl',
 *       hashtags: ['afrobeats', 'brooklyn']
 *     },
 *     {
 *       eventId: '2',
 *       name: 'Soca Brunch',
 *       description: 'Sunday vibes',
 *       venue: 'Queens Hall',
 *       hashtags: ['soca', 'brunch']
 *     }
 *   ];
 *
 *   it('should search by event name', () => {
 *     const result = searchEvents(events, 'afrobeats');
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 *
 *   it('should search by venue', () => {
 *     const result = searchEvents(events, 'brooklyn');
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 *
 *   it('should search by description', () => {
 *     const result = searchEvents(events, 'dance');
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 *
 *   it('should search by hashtags', () => {
 *     const result = searchEvents(events, 'soca');
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('2');
 *   });
 *
 *   it('should be case insensitive', () => {
 *     const result = searchEvents(events, 'AFROBEATS');
 *     expect(result).toHaveLength(1);
 *   });
 *
 *   it('should return all events for empty search', () => {
 *     const result = searchEvents(events, '');
 *     expect(result).toHaveLength(2);
 *   });
 * });
 */
export const searchEvents = (events, searchTerm) => {
  if (!Array.isArray(events)) {
    throw new TypeError('Events must be an array');
  }

  if (!searchTerm || typeof searchTerm !== 'string') {
    return events;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  if (!normalizedSearch) {
    return events;
  }

  return events.filter((event) => {
    // Search in event name
    if (event.name && event.name.toLowerCase().includes(normalizedSearch)) {
      return true;
    }

    // Search in description
    if (event.description && event.description.toLowerCase().includes(normalizedSearch)) {
      return true;
    }

    // Search in venue
    if (event.venue && event.venue.toLowerCase().includes(normalizedSearch)) {
      return true;
    }

    // Search in address
    if (event.address) {
      const addressString = [
        event.address.street,
        event.address.city,
        event.address.state,
        event.address.zip,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (addressString.includes(normalizedSearch)) {
        return true;
      }
    }

    // Search in hashtags
    if (event.hashtags && Array.isArray(event.hashtags)) {
      return event.hashtags.some((tag) =>
        tag.toLowerCase().includes(normalizedSearch)
      );
    }

    return false;
  });
};

/**
 * Sort events by date
 * @param {Array<Object>} events - Array of event objects
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array<Object>} Sorted array of events
 * @throws {TypeError} If events is not an array
 *
 * @example
 * const events = [
 *   { eventId: '1', date: '2025-10-23T20:00:00' },
 *   { eventId: '2', date: '2025-10-21T20:00:00' }
 * ];
 * const sorted = sortEventsByDate(events, 'asc');
 * // Returns events sorted by date ascending (earliest first)
 *
 * @test
 * describe('sortEventsByDate', () => {
 *   it('should sort events in ascending order', () => {
 *     const events = [
 *       { eventId: '1', date: '2025-10-23T20:00:00' },
 *       { eventId: '2', date: '2025-10-21T20:00:00' }
 *     ];
 *     const result = sortEventsByDate(events, 'asc');
 *     expect(result[0].eventId).toBe('2');
 *     expect(result[1].eventId).toBe('1');
 *   });
 *
 *   it('should sort events in descending order', () => {
 *     const events = [
 *       { eventId: '1', date: '2025-10-21T20:00:00' },
 *       { eventId: '2', date: '2025-10-23T20:00:00' }
 *     ];
 *     const result = sortEventsByDate(events, 'desc');
 *     expect(result[0].eventId).toBe('2');
 *     expect(result[1].eventId).toBe('1');
 *   });
 *
 *   it('should default to ascending order', () => {
 *     const events = [
 *       { eventId: '1', date: '2025-10-23T20:00:00' },
 *       { eventId: '2', date: '2025-10-21T20:00:00' }
 *     ];
 *     const result = sortEventsByDate(events);
 *     expect(result[0].eventId).toBe('2');
 *   });
 *
 *   it('should handle events without dates', () => {
 *     const events = [
 *       { eventId: '1', date: '2025-10-21T20:00:00' },
 *       { eventId: '2' }
 *     ];
 *     const result = sortEventsByDate(events);
 *     expect(result).toHaveLength(2);
 *   });
 * });
 */
export const sortEventsByDate = (events, order = 'asc') => {
  if (!Array.isArray(events)) {
    throw new TypeError('Events must be an array');
  }

  // Create a copy to avoid mutating the original array
  const eventsCopy = [...events];

  return eventsCopy.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);

    if (order === 'desc') {
      return dateB - dateA;
    }

    return dateA - dateB;
  });
};

/**
 * Filter events by price range
 * @param {Array<Object>} events - Array of event objects
 * @param {Object} priceRange - Price range {min, max}
 * @returns {Array<Object>} Filtered array of events
 * @throws {TypeError} If events is not an array
 *
 * @example
 * const events = [
 *   { eventId: '1', price: 25 },
 *   { eventId: '2', price: 50 },
 *   { eventId: '3', price: 0 }
 * ];
 * const filtered = filterEventsByPrice(events, { min: 0, max: 30 });
 * // Returns: [{ eventId: '1', price: 25 }, { eventId: '3', price: 0 }]
 *
 * @test
 * describe('filterEventsByPrice', () => {
 *   it('should filter events by price range', () => {
 *     const events = [
 *       { eventId: '1', price: 25 },
 *       { eventId: '2', price: 50 },
 *       { eventId: '3', price: 0 }
 *     ];
 *     const result = filterEventsByPrice(events, { min: 0, max: 30 });
 *     expect(result).toHaveLength(2);
 *   });
 *
 *   it('should include free events when min is 0', () => {
 *     const events = [{ eventId: '1', price: 0 }];
 *     const result = filterEventsByPrice(events, { min: 0, max: 10 });
 *     expect(result).toHaveLength(1);
 *   });
 * });
 */
export const filterEventsByPrice = (events, priceRange) => {
  if (!Array.isArray(events)) {
    throw new TypeError('Events must be an array');
  }

  if (!priceRange || typeof priceRange !== 'object') {
    return events;
  }

  const { min, max } = priceRange;

  if (min === undefined && max === undefined) {
    return events;
  }

  return events.filter((event) => {
    const price = event.price ?? 0;

    if (min !== undefined && price < min) {
      return false;
    }

    if (max !== undefined && price > max) {
      return false;
    }

    return true;
  });
};

/**
 * Combine multiple filters on events
 * @param {Array<Object>} events - Array of event objects
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array<Object>} Filtered and sorted array of events
 * @throws {TypeError} If events is not an array
 *
 * @example
 * const events = [...];
 * const filtered = combineFilters(events, {
 *   category: 'brunch',
 *   hashtag: 'afrobeats',
 *   timeRange: 'weekend',
 *   searchTerm: 'brooklyn',
 *   priceRange: { min: 0, max: 50 },
 *   sortOrder: 'asc'
 * });
 * // Returns events matching all criteria, sorted by date
 *
 * @test
 * describe('combineFilters', () => {
 *   it('should apply multiple filters', () => {
 *     const events = [
 *       {
 *         eventId: '1',
 *         category: 'brunch',
 *         hashtags: ['afrobeats'],
 *         date: '2025-10-21T10:00:00',
 *         price: 30
 *       },
 *       {
 *         eventId: '2',
 *         category: 'nightlife',
 *         hashtags: ['soca'],
 *         date: '2025-10-22T22:00:00',
 *         price: 50
 *       }
 *     ];
 *     const result = combineFilters(events, {
 *       category: 'brunch',
 *       priceRange: { min: 0, max: 40 }
 *     });
 *     expect(result).toHaveLength(1);
 *     expect(result[0].eventId).toBe('1');
 *   });
 * });
 */
export const combineFilters = (events, filters = {}) => {
  if (!Array.isArray(events)) {
    throw new TypeError('Events must be an array');
  }

  let filtered = events;

  // Apply category filter
  if (filters.category) {
    filtered = filterEventsByCategory(filtered, filters.category);
  }

  // Apply hashtag filter
  if (filters.hashtag) {
    filtered = filterEventsByHashtag(filtered, filters.hashtag);
  }

  // Apply time range filter
  if (filters.timeRange) {
    filtered = filterEventsByTimeRange(filtered, filters.timeRange);
  }

  // Apply price range filter
  if (filters.priceRange) {
    filtered = filterEventsByPrice(filtered, filters.priceRange);
  }

  // Apply search term
  if (filters.searchTerm) {
    filtered = searchEvents(filtered, filters.searchTerm);
  }

  // Apply sorting
  if (filters.sortOrder) {
    filtered = sortEventsByDate(filtered, filters.sortOrder);
  }

  return filtered;
};
