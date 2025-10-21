import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Create a new event
 * @param {Object} eventData - Event information
 * @param {string} promoterId - ID of the promoter creating the event
 * @returns {Promise<Object>} Created event object with ID
 * @throws {Error} If event creation fails
 */
export const createEvent = async (eventData, promoterId) => {
  try {
    const eventRef = doc(collection(db, 'events'));
    const eventId = eventRef.id;

    const event = {
      id: eventId,
      promoterId,
      title: eventData.title,
      description: eventData.description || '',
      category: eventData.category, // e.g., 'nightlife', 'brunch', 'arts', etc.
      date: eventData.date, // ISO string or Timestamp
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location || {},
      venue: eventData.venue || '',
      imageUrl: eventData.imageUrl || '',
      price: eventData.price || 0,
      ticketLink: eventData.ticketLink || '',
      hashtags: eventData.hashtags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favoritedBy: [], // Array of user IDs who favorited this event
      favoritesCount: 0,
    };

    await setDoc(eventRef, event);

    return event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error(error.message || 'Failed to create event');
  }
};

/**
 * Get events with advanced filtering, pagination, and sorting
 *
 * REQUIRED FIRESTORE COMPOSITE INDEXES:
 * 1. category + date (ASC/DESC)
 * 2. category + favoritesCount (DESC) + date
 * 3. promoterId + date (ASC/DESC)
 * 4. promoterId + favoritesCount (DESC) + date
 * 5. date (ASC) - single field index
 * 6. favoritesCount (DESC) + date (ASC)
 *
 * @param {Object} filters - Filter options
 * @param {string} [filters.category] - Filter by event category
 * @param {string} [filters.hashtag] - Filter by hashtag (uses array-contains)
 * @param {string} [filters.startDate] - Filter events on or after this date (ISO string)
 * @param {string} [filters.endDate] - Filter events before this date (ISO string)
 * @param {string} [filters.promoterId] - Filter by promoter ID
 * @param {number} [filters.minPrice] - Minimum price filter
 * @param {number} [filters.maxPrice] - Maximum price filter
 * @param {number} [filters.limit=20] - Maximum number of events to return
 * @param {string} [filters.sortBy='date'] - Sort field: 'date', 'popularity', 'trending'
 * @param {string} [filters.sortOrder='asc'] - Sort order: 'asc' or 'desc'
 * @param {Object} [filters.startAfterDoc] - Document snapshot for pagination (from previous query)
 * @returns {Promise<Object>} Object containing events array and pagination info
 * @throws {Error} If fetching events fails
 *
 * @example
 * // Get upcoming nightlife events, sorted by date
 * const result = await getEvents({
 *   category: 'nightlife',
 *   startDate: new Date().toISOString(),
 *   limit: 10,
 *   sortBy: 'date'
 * });
 *
 * @example
 * // Get popular events with pagination
 * const result = await getEvents({
 *   sortBy: 'popularity',
 *   limit: 20,
 *   startAfterDoc: previousResult.lastDoc
 * });
 */
export const getEvents = async (filters = {}) => {
  try {
    let q = collection(db, 'events');
    const constraints = [];

    // Destructure filters with defaults
    const {
      category,
      hashtag,
      startDate,
      endDate,
      promoterId,
      minPrice,
      maxPrice,
      limit: limitCount = 20,
      sortBy = 'date',
      sortOrder = 'asc',
      startAfterDoc
    } = filters;

    // Apply equality filters
    if (category) {
      constraints.push(where('category', '==', category));
    }

    if (promoterId) {
      constraints.push(where('promoterId', '==', promoterId));
    }

    // Apply array-contains filter for hashtags
    // NOTE: Can only use one array-contains per query
    if (hashtag) {
      constraints.push(where('hashtags', 'array-contains', hashtag));
    }

    // Apply date range filters
    if (startDate) {
      constraints.push(where('date', '>=', startDate));
    }

    if (endDate) {
      constraints.push(where('date', '<=', endDate));
    }

    // Apply price range filters (done in-memory to avoid index complexity)
    const needsPriceFilter = minPrice !== undefined || maxPrice !== undefined;

    // Apply sorting based on sortBy parameter
    // NOTE: Firestore requires composite indexes when combining where + orderBy on different fields
    switch (sortBy) {
      case 'popularity':
        // Sort by favoritesCount (most popular first), then by date
        constraints.push(orderBy('favoritesCount', 'desc'));
        constraints.push(orderBy('date', sortOrder));
        break;

      case 'trending':
        // Trending = high favorites count + recent dates
        // Similar to popularity but prioritize recent events
        constraints.push(orderBy('favoritesCount', 'desc'));
        constraints.push(orderBy('createdAt', 'desc'));
        break;

      case 'date':
      default:
        // Default sort by date
        constraints.push(orderBy('date', sortOrder));
        break;
    }

    // Apply pagination cursor
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    // Apply limit
    constraints.push(limit(limitCount));

    // Build and execute query
    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    let events = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
        _doc: doc // Store doc for pagination
      });
    });

    // Apply price filtering in-memory if needed
    if (needsPriceFilter) {
      events = events.filter(event => {
        const eventPrice = event.price || 0;
        const passesMin = minPrice === undefined || eventPrice >= minPrice;
        const passesMax = maxPrice === undefined || eventPrice <= maxPrice;
        return passesMin && passesMax;
      });
    }

    // Get last document for pagination
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    // Remove _doc from response to keep it clean
    const cleanEvents = events.map(({ _doc, ...event }) => event);

    return {
      events: cleanEvents,
      lastDoc, // Use this for next page: getEvents({ ...filters, startAfterDoc: lastDoc })
      hasMore: events.length === limitCount,
      count: events.length
    };
  } catch (error) {
    console.error('Error getting events:', error);

    // Provide helpful error messages for common issues
    if (error.message?.includes('index')) {
      throw new Error(
        'Missing Firestore index. Check console for index creation link, or see firestore.indexes.json'
      );
    }

    throw new Error(error.message || 'Failed to get events');
  }
};

/**
 * Get a single event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Event object
 * @throws {Error} If event not found or fetch fails
 */
export const getEventById = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));

    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    return {
      id: eventDoc.id,
      ...eventDoc.data(),
    };
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error(error.message || 'Failed to get event');
  }
};

/**
 * Update an existing event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated event object
 * @throws {Error} If update fails
 */
export const updateEvent = async (eventId, updates) => {
  try {
    const eventRef = doc(db, 'events', eventId);

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(eventRef, updateData);

    // Get updated event data
    const eventDoc = await getDoc(eventRef);
    return {
      id: eventDoc.id,
      ...eventDoc.data(),
    };
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error(error.message || 'Failed to update event');
  }
};

/**
 * Delete an event
 * @param {string} eventId - Event ID
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails
 */
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error(error.message || 'Failed to delete event');
  }
};

/**
 * Toggle favorite status for an event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated event object with favorite status
 * @throws {Error} If toggle fails
 */
export const toggleFavorite = async (eventId, userId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    const isFavorited = eventData.favoritedBy?.includes(userId);

    // Update event document
    if (isFavorited) {
      // Remove from favorites
      await updateDoc(eventRef, {
        favoritedBy: arrayRemove(userId),
        favoritesCount: Math.max(0, (eventData.favoritesCount || 0) - 1),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Add to favorites
      await updateDoc(eventRef, {
        favoritedBy: arrayUnion(userId),
        favoritesCount: (eventData.favoritesCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    // Also update user's favorites array
    const userRef = doc(db, 'users', userId);
    if (isFavorited) {
      await updateDoc(userRef, {
        favorites: arrayRemove(eventId),
      });
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(eventId),
      });
    }

    // Return updated event
    const updatedEventDoc = await getDoc(eventRef);
    return {
      id: updatedEventDoc.id,
      ...updatedEventDoc.data(),
      isFavorited: !isFavorited,
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error(error.message || 'Failed to toggle favorite');
  }
};

// ============================================================================
// REAL-TIME LISTENERS
// ============================================================================

/**
 * Subscribe to real-time event updates with filters
 *
 * REQUIRED FIRESTORE COMPOSITE INDEXES: Same as getEvents()
 *
 * @param {Object} filters - Same filter options as getEvents()
 * @param {Function} callback - Callback function called with updated events array
 * @returns {Function} Unsubscribe function to stop listening
 *
 * @example
 * const unsubscribe = subscribeToEvents(
 *   { category: 'nightlife', startDate: new Date().toISOString() },
 *   (events) => {
 *     console.log('Events updated:', events);
 *     setEvents(events); // Update React state
 *   }
 * );
 *
 * // Later, stop listening
 * unsubscribe();
 */
export const subscribeToEvents = (filters = {}, callback) => {
  try {
    let q = collection(db, 'events');
    const constraints = [];

    // Destructure filters with defaults
    const {
      category,
      hashtag,
      startDate,
      endDate,
      promoterId,
      minPrice,
      maxPrice,
      limit: limitCount = 20,
      sortBy = 'date',
      sortOrder = 'asc',
    } = filters;

    // Apply equality filters
    if (category) {
      constraints.push(where('category', '==', category));
    }

    if (promoterId) {
      constraints.push(where('promoterId', '==', promoterId));
    }

    // Apply array-contains filter for hashtags
    if (hashtag) {
      constraints.push(where('hashtags', 'array-contains', hashtag));
    }

    // Apply date range filters
    if (startDate) {
      constraints.push(where('date', '>=', startDate));
    }

    if (endDate) {
      constraints.push(where('date', '<=', endDate));
    }

    // Apply price range filters (done in-memory)
    const needsPriceFilter = minPrice !== undefined || maxPrice !== undefined;

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
        constraints.push(orderBy('favoritesCount', 'desc'));
        constraints.push(orderBy('date', sortOrder));
        break;

      case 'trending':
        constraints.push(orderBy('favoritesCount', 'desc'));
        constraints.push(orderBy('createdAt', 'desc'));
        break;

      case 'date':
      default:
        constraints.push(orderBy('date', sortOrder));
        break;
    }

    // Apply limit
    constraints.push(limit(limitCount));

    // Build query
    q = query(q, ...constraints);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let events = [];
        querySnapshot.forEach((doc) => {
          events.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Apply price filtering in-memory if needed
        if (needsPriceFilter) {
          events = events.filter(event => {
            const eventPrice = event.price || 0;
            const passesMin = minPrice === undefined || eventPrice >= minPrice;
            const passesMax = maxPrice === undefined || eventPrice <= maxPrice;
            return passesMin && passesMax;
          });
        }

        // Call the callback with updated events
        callback(events);
      },
      (error) => {
        console.error('Error in events subscription:', error);
        callback([], error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up events subscription:', error);
    throw new Error(error.message || 'Failed to subscribe to events');
  }
};

/**
 * Subscribe to real-time updates for a user's favorite events
 *
 * @param {string} userId - User ID to watch favorites for
 * @param {Function} callback - Callback function called with updated favorite events array
 * @returns {Function} Unsubscribe function to stop listening
 *
 * @example
 * const unsubscribe = subscribeToUserFavorites('user123', (favoriteEvents) => {
 *   console.log('User favorites updated:', favoriteEvents);
 *   setFavorites(favoriteEvents);
 * });
 *
 * // Clean up
 * unsubscribe();
 */
export const subscribeToUserFavorites = (userId, callback) => {
  try {
    // First, listen to the user's favorites array
    const userRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(
      userRef,
      async (userDoc) => {
        if (!userDoc.exists()) {
          callback([]);
          return;
        }

        const userData = userDoc.data();
        const favoriteIds = userData.favorites || [];

        if (favoriteIds.length === 0) {
          callback([]);
          return;
        }

        // Fetch all favorite events
        // NOTE: Firestore 'in' queries are limited to 10 items
        // For more than 10 favorites, we need to batch the queries
        const favoriteEvents = [];
        const batchSize = 10;

        for (let i = 0; i < favoriteIds.length; i += batchSize) {
          const batch = favoriteIds.slice(i, i + batchSize);
          const q = query(
            collection(db, 'events'),
            where('__name__', 'in', batch)
          );

          const snapshot = await getDocs(q);
          snapshot.forEach((doc) => {
            favoriteEvents.push({
              id: doc.id,
              ...doc.data(),
            });
          });
        }

        // Sort by date
        favoriteEvents.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });

        callback(favoriteEvents);
      },
      (error) => {
        console.error('Error in user favorites subscription:', error);
        callback([], error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up user favorites subscription:', error);
    throw new Error(error.message || 'Failed to subscribe to user favorites');
  }
};

/**
 * Subscribe to real-time updates for trending hashtags
 *
 * REQUIRED FIRESTORE COMPOSITE INDEX:
 * - usageCount (DESC) + lastUsed (DESC)
 *
 * @param {Function} callback - Callback function called with updated trending hashtags array
 * @param {number} limit - Number of trending hashtags to return (default: 10)
 * @returns {Function} Unsubscribe function to stop listening
 *
 * @example
 * const unsubscribe = subscribeToTrendingHashtags((hashtags) => {
 *   console.log('Trending hashtags updated:', hashtags);
 *   setTrendingHashtags(hashtags);
 * }, 15);
 *
 * // Clean up
 * unsubscribe();
 */
export const subscribeToTrendingHashtags = (callback, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'hashtags'),
      orderBy('usageCount', 'desc'),
      orderBy('lastUsed', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const hashtags = [];
        querySnapshot.forEach((doc) => {
          hashtags.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        callback(hashtags);
      },
      (error) => {
        console.error('Error in trending hashtags subscription:', error);
        callback([], error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up trending hashtags subscription:', error);
    throw new Error(error.message || 'Failed to subscribe to trending hashtags');
  }
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Delete multiple events in a single batch operation
 * Firestore batched writes have a limit of 500 operations per batch
 *
 * @param {Array<string>} eventIds - Array of event IDs to delete
 * @returns {Promise<Object>} Result object with success count and any errors
 *
 * @example
 * const result = await deleteMultipleEvents(['event1', 'event2', 'event3']);
 * console.log(`Deleted ${result.successCount} events`);
 * if (result.errors.length > 0) {
 *   console.error('Errors:', result.errors);
 * }
 */
export const deleteMultipleEvents = async (eventIds) => {
  try {
    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      throw new Error('eventIds must be a non-empty array');
    }

    // Firestore batch limit is 500 operations
    const BATCH_SIZE = 500;
    let successCount = 0;
    const errors = [];

    // Process deletions in batches of 500
    for (let i = 0; i < eventIds.length; i += BATCH_SIZE) {
      const batchIds = eventIds.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      // Add delete operations to batch
      batchIds.forEach(eventId => {
        const eventRef = doc(db, 'events', eventId);
        batch.delete(eventRef);
      });

      try {
        await batch.commit();
        successCount += batchIds.length;
      } catch (error) {
        console.error(`Error deleting batch starting at index ${i}:`, error);
        errors.push({
          batchStartIndex: i,
          batchSize: batchIds.length,
          error: error.message,
        });
      }
    }

    return {
      successCount,
      totalAttempted: eventIds.length,
      errors,
      success: errors.length === 0,
    };
  } catch (error) {
    console.error('Error in deleteMultipleEvents:', error);
    throw new Error(error.message || 'Failed to delete multiple events');
  }
};

/**
 * Delete multiple photos in a single batch operation
 * This deletes the photo documents from Firestore
 * NOTE: This does NOT delete the actual image files from Firebase Storage
 * For complete deletion, also use deletePhotoFile() from photoService.js
 *
 * Firestore batched writes have a limit of 500 operations per batch
 *
 * @param {Array<string>} photoIds - Array of photo IDs to delete
 * @returns {Promise<Object>} Result object with success count and any errors
 *
 * @example
 * const result = await deleteMultiplePhotos(['photo1', 'photo2', 'photo3']);
 * console.log(`Deleted ${result.successCount} photo documents`);
 */
export const deleteMultiplePhotos = async (photoIds) => {
  try {
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      throw new Error('photoIds must be a non-empty array');
    }

    // Firestore batch limit is 500 operations
    const BATCH_SIZE = 500;
    let successCount = 0;
    const errors = [];

    // Process deletions in batches of 500
    for (let i = 0; i < photoIds.length; i += BATCH_SIZE) {
      const batchIds = photoIds.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      // Add delete operations to batch
      batchIds.forEach(photoId => {
        const photoRef = doc(db, 'photos', photoId);
        batch.delete(photoRef);
      });

      try {
        await batch.commit();
        successCount += batchIds.length;
      } catch (error) {
        console.error(`Error deleting photo batch starting at index ${i}:`, error);
        errors.push({
          batchStartIndex: i,
          batchSize: batchIds.length,
          error: error.message,
        });
      }
    }

    return {
      successCount,
      totalAttempted: photoIds.length,
      errors,
      success: errors.length === 0,
    };
  } catch (error) {
    console.error('Error in deleteMultiplePhotos:', error);
    throw new Error(error.message || 'Failed to delete multiple photos');
  }
};

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

/**
 * Search events by text across multiple fields
 *
 * IMPORTANT: Firestore does not have native full-text search capabilities.
 * This implementation fetches all events and performs client-side filtering.
 * For production apps with large datasets, consider using:
 * - Algolia (recommended for Firestore)
 * - ElasticSearch
 * - Typesense
 * - Firebase Extensions: Search with Algolia
 *
 * This function searches across:
 * - Event title (case-insensitive)
 * - Event description (case-insensitive)
 * - Venue name (case-insensitive)
 * - Hashtags (exact match, case-insensitive)
 *
 * @param {string} searchTerm - Search term to look for
 * @param {Object} options - Additional search options
 * @param {number} [options.limit=50] - Maximum number of results to return
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.startDate] - Filter by start date
 * @param {string} [options.sortBy='date'] - Sort by: 'date', 'popularity', 'relevance'
 * @returns {Promise<Array>} Array of matching events
 *
 * @example
 * const results = await searchEventsByText('afrobeats brunch', {
 *   category: 'brunch',
 *   limit: 20,
 *   sortBy: 'popularity'
 * });
 */
export const searchEventsByText = async (searchTerm, options = {}) => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new Error('searchTerm must be a non-empty string');
    }

    const {
      limit: limitCount = 50,
      category,
      startDate,
      sortBy = 'date',
    } = options;

    // Normalize search term
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const searchWords = normalizedSearch.split(/\s+/); // Split into words

    // Build base query with optional filters
    let q = collection(db, 'events');
    const constraints = [];

    // Apply category filter if provided
    if (category) {
      constraints.push(where('category', '==', category));
    }

    // Apply date filter if provided
    if (startDate) {
      constraints.push(where('date', '>=', startDate));
    }

    // Add sorting based on sortBy
    switch (sortBy) {
      case 'popularity':
        constraints.push(orderBy('favoritesCount', 'desc'));
        break;
      case 'date':
      default:
        constraints.push(orderBy('date', 'asc'));
        break;
    }

    // Fetch a larger set to filter client-side
    // Firestore doesn't support text search, so we over-fetch then filter
    constraints.push(limit(limitCount * 3)); // Fetch 3x to account for filtering

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    let events = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side text search
    const scoredEvents = events
      .map((event) => {
        const titleLower = (event.title || '').toLowerCase();
        const descriptionLower = (event.description || '').toLowerCase();
        const venueLower = (event.venue || '').toLowerCase();
        const hashtagsLower = (event.hashtags || []).map(h => h.toLowerCase());

        let score = 0;

        // Check each search word
        searchWords.forEach(word => {
          // Title match (highest weight)
          if (titleLower.includes(word)) {
            score += 10;
            // Exact word match gets bonus
            if (titleLower.split(/\s+/).includes(word)) {
              score += 5;
            }
          }

          // Venue match (medium-high weight)
          if (venueLower.includes(word)) {
            score += 7;
          }

          // Description match (medium weight)
          if (descriptionLower.includes(word)) {
            score += 3;
          }

          // Hashtag match (exact match only, high weight)
          hashtagsLower.forEach(hashtag => {
            if (hashtag === word || hashtag === `#${word}`) {
              score += 8;
            }
          });
        });

        return {
          ...event,
          searchScore: score,
        };
      })
      .filter(event => event.searchScore > 0); // Only include events with matches

    // Sort by relevance if requested
    if (sortBy === 'relevance') {
      scoredEvents.sort((a, b) => b.searchScore - a.searchScore);
    }

    // Remove search score from results and apply limit
    const results = scoredEvents
      .slice(0, limitCount)
      .map(({ searchScore, ...event }) => event);

    return results;
  } catch (error) {
    console.error('Error searching events:', error);
    throw new Error(error.message || 'Failed to search events');
  }
};

/**
 * Search events by hashtag using Firestore's array-contains
 *
 * @param {string} hashtag - Hashtag to search for (with or without #)
 * @param {Object} options - Additional filter options
 * @param {number} [options.limit=20] - Maximum number of results
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.startDate] - Filter by start date
 * @param {string} [options.sortBy='date'] - Sort by: 'date', 'popularity'
 * @returns {Promise<Array>} Array of events with the specified hashtag
 *
 * @example
 * const events = await searchEventsByHashtag('afrobeats', {
 *   limit: 10,
 *   sortBy: 'popularity'
 * });
 */
export const searchEventsByHashtag = async (hashtag, options = {}) => {
  try {
    if (!hashtag || typeof hashtag !== 'string') {
      throw new Error('hashtag must be a non-empty string');
    }

    // Normalize hashtag (remove # if present)
    const normalizedHashtag = hashtag.startsWith('#')
      ? hashtag.substring(1).toLowerCase()
      : hashtag.toLowerCase();

    const {
      limit: limitCount = 20,
      category,
      startDate,
      sortBy = 'date',
    } = options;

    // Build query with hashtag filter
    const constraints = [
      where('hashtags', 'array-contains', normalizedHashtag)
    ];

    // Apply category filter if provided
    // NOTE: Only one array-contains is allowed per query
    if (category) {
      constraints.push(where('category', '==', category));
    }

    // Apply date filter if provided
    if (startDate) {
      constraints.push(where('date', '>=', startDate));
    }

    // Add sorting
    switch (sortBy) {
      case 'popularity':
        constraints.push(orderBy('favoritesCount', 'desc'));
        constraints.push(orderBy('date', 'asc'));
        break;
      case 'date':
      default:
        constraints.push(orderBy('date', 'asc'));
        break;
    }

    // Apply limit
    constraints.push(limit(limitCount));

    // Execute query
    const q = query(collection(db, 'events'), ...constraints);
    const querySnapshot = await getDocs(q);

    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return events;
  } catch (error) {
    console.error('Error searching events by hashtag:', error);

    if (error.message?.includes('index')) {
      throw new Error(
        'Missing Firestore index for hashtag search. Check console for index creation link.'
      );
    }

    throw new Error(error.message || 'Failed to search events by hashtag');
  }
};
