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
  arrayUnion,
  arrayRemove,
  Timestamp,
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
 * Get events with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.category - Filter by category
 * @param {string} filters.hashtag - Filter by hashtag
 * @param {string} filters.date - Filter by date (ISO string)
 * @param {number} filters.limit - Maximum number of events to return
 * @param {string} filters.promoterId - Filter by promoter ID
 * @returns {Promise<Array>} Array of event objects
 * @throws {Error} If fetching events fails
 */
export const getEvents = async (filters = {}) => {
  try {
    let q = collection(db, 'events');
    const constraints = [];

    // Apply filters
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters.hashtag) {
      constraints.push(where('hashtags', 'array-contains', filters.hashtag));
    }

    if (filters.date) {
      // Filter events on or after the specified date
      constraints.push(where('date', '>=', filters.date));
    }

    if (filters.promoterId) {
      constraints.push(where('promoterId', '==', filters.promoterId));
    }

    // Only add orderBy if we're filtering by date or have no filters
    // This avoids composite index requirements for simple queries
    if (filters.date || (!filters.category && !filters.hashtag && !filters.promoterId)) {
      constraints.push(orderBy('date', 'asc'));
    }

    // Apply limit if specified
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    // Only create query if we have constraints
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const events = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // If we couldn't order by date in the query, sort in memory
    if (!filters.date && (filters.category || filters.hashtag || filters.promoterId)) {
      events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
    }

    return events;
  } catch (error) {
    console.error('Error getting events:', error);
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
