import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Update hashtag count (increment when used)
 * @param {string} hashtag - Hashtag to update (without #)
 * @returns {Promise<Object>} Updated hashtag object
 * @throws {Error} If update fails
 */
export const updateHashtagCount = async (hashtag) => {
  try {
    if (!hashtag) {
      throw new Error('No hashtag provided');
    }

    // Normalize hashtag (remove # if present, convert to lowercase)
    const normalizedHashtag = hashtag.replace('#', '').toLowerCase().trim();

    if (!normalizedHashtag) {
      throw new Error('Invalid hashtag');
    }

    const hashtagRef = doc(db, 'hashtags', normalizedHashtag);
    const hashtagDoc = await getDoc(hashtagRef);

    if (hashtagDoc.exists()) {
      // Hashtag exists, increment count
      await updateDoc(hashtagRef, {
        usageCount: increment(1),
        lastUsed: new Date().toISOString(),
      });
    } else {
      // Create new hashtag document
      await setDoc(hashtagRef, {
        tag: normalizedHashtag,
        name: normalizedHashtag, // Add name field for UI compatibility
        usageCount: 1,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      });
    }

    // Return updated hashtag data
    const updatedDoc = await getDoc(hashtagRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error('Error updating hashtag count:', error);
    throw new Error(error.message || 'Failed to update hashtag count');
  }
};

/**
 * Update counts for multiple hashtags
 * @param {Array<string>} hashtags - Array of hashtags to update
 * @returns {Promise<Array<Object>>} Array of updated hashtag objects
 * @throws {Error} If update fails
 */
export const updateMultipleHashtagCounts = async (hashtags) => {
  try {
    if (!hashtags || hashtags.length === 0) {
      return [];
    }

    const updatePromises = hashtags.map((hashtag) => updateHashtagCount(hashtag));
    const results = await Promise.all(updatePromises);

    return results;
  } catch (error) {
    console.error('Error updating multiple hashtag counts:', error);
    throw new Error(error.message || 'Failed to update hashtag counts');
  }
};

/**
 * Get trending hashtags sorted by usage count
 * @param {number} maxResults - Maximum number of hashtags to return (default: 10)
 * @returns {Promise<Array>} Array of trending hashtag objects
 * @throws {Error} If fetching trending hashtags fails
 */
export const getTrendingHashtags = async (maxResults = 10) => {
  try {
    const q = query(
      collection(db, 'hashtags'),
      orderBy('usageCount', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const hashtags = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      hashtags.push({
        id: doc.id,
        name: data.tag || doc.id, // Add name field for UI compatibility
        ...data,
      });
    });

    return hashtags;
  } catch (error) {
    console.error('Error getting trending hashtags:', error);
    throw new Error(error.message || 'Failed to get trending hashtags');
  }
};

/**
 * Get recently used hashtags
 * @param {number} maxResults - Maximum number of hashtags to return (default: 10)
 * @returns {Promise<Array>} Array of recently used hashtag objects
 * @throws {Error} If fetching recent hashtags fails
 */
export const getRecentHashtags = async (maxResults = 10) => {
  try {
    const q = query(
      collection(db, 'hashtags'),
      orderBy('lastUsed', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const hashtags = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      hashtags.push({
        id: doc.id,
        name: data.tag || doc.id, // Add name field for UI compatibility
        ...data,
      });
    });

    return hashtags;
  } catch (error) {
    console.error('Error getting recent hashtags:', error);
    throw new Error(error.message || 'Failed to get recent hashtags');
  }
};

/**
 * Get a specific hashtag by tag name
 * @param {string} hashtag - Hashtag to search for (without #)
 * @returns {Promise<Object|null>} Hashtag object or null if not found
 * @throws {Error} If fetching hashtag fails
 */
export const getHashtagByTag = async (hashtag) => {
  try {
    if (!hashtag) {
      throw new Error('No hashtag provided');
    }

    // Normalize hashtag
    const normalizedHashtag = hashtag.replace('#', '').toLowerCase().trim();

    const hashtagDoc = await getDoc(doc(db, 'hashtags', normalizedHashtag));

    if (!hashtagDoc.exists()) {
      return null;
    }

    const data = hashtagDoc.data();
    return {
      id: hashtagDoc.id,
      name: data.tag || hashtagDoc.id, // Add name field for UI compatibility
      ...data,
    };
  } catch (error) {
    console.error('Error getting hashtag:', error);
    throw new Error(error.message || 'Failed to get hashtag');
  }
};

/**
 * Search hashtags by partial match
 * @param {string} searchTerm - Partial hashtag to search for
 * @param {number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Array of matching hashtag objects
 * @throws {Error} If search fails
 */
export const searchHashtags = async (searchTerm, maxResults = 10) => {
  try {
    if (!searchTerm) {
      return [];
    }

    // Normalize search term
    const normalizedSearch = searchTerm.replace('#', '').toLowerCase().trim();

    // Get all hashtags (in a production app, you'd want better search indexing)
    const q = query(
      collection(db, 'hashtags'),
      orderBy('usageCount', 'desc'),
      limit(100) // Get top 100 to search through
    );

    const querySnapshot = await getDocs(q);
    const hashtags = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if hashtag starts with or contains the search term
      if (data.tag && data.tag.includes(normalizedSearch)) {
        hashtags.push({
          id: doc.id,
          name: data.tag || doc.id, // Add name field for UI compatibility
          ...data,
        });
      }
    });

    // Return limited results
    return hashtags.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching hashtags:', error);
    throw new Error(error.message || 'Failed to search hashtags');
  }
};

/**
 * Extract hashtags from text
 * @param {string} text - Text to extract hashtags from
 * @returns {Array<string>} Array of hashtags found in the text (without #)
 */
export const extractHashtags = (text) => {
  if (!text) {
    return [];
  }

  // Match hashtags in the format #word or #word_with_underscore
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);

  if (!matches) {
    return [];
  }

  // Remove # and convert to lowercase, remove duplicates
  const hashtags = [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];

  return hashtags;
};
