import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage, deleteImage } from './storageService';

/**
 * Upload a photo with metadata
 * @param {Object} photoData - Photo information
 * @param {File} photoData.file - The image file to upload
 * @param {string} photoData.caption - Photo caption
 * @param {string} photoData.eventId - Associated event ID (optional)
 * @param {Array<string>} photoData.hashtags - Array of hashtags
 * @param {string} userId - ID of the user uploading the photo
 * @param {string} userName - Full name of the user uploading the photo
 * @returns {Promise<Object>} Created photo object with ID
 * @throws {Error} If photo upload fails
 */
export const uploadPhoto = async (photoData, userId, userName = 'Anonymous') => {
  try {
    const { file, caption, eventId, hashtags } = photoData;

    // Upload image to Firebase Storage
    const storagePath = `photos/${userId}/${Date.now()}_${file.name}`;
    const imageUrl = await uploadImage(file, storagePath);

    // Create photo document in Firestore
    const photoRef = doc(collection(db, 'photos'));
    const photoId = photoRef.id;

    const photo = {
      id: photoId,
      userId,
      userName,
      imageUrl,
      storagePath,
      caption: caption || '',
      eventId: eventId || null,
      hashtags: hashtags || [],
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(photoRef, photo);

    return photo;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error(error.message || 'Failed to upload photo');
  }
};

/**
 * Get all photos from all users
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of photos to return
 * @returns {Promise<Array>} Array of photo objects
 * @throws {Error} If fetching photos fails
 */
export const getAllPhotos = async (options = {}) => {
  try {
    const { limit: maxResults = 100 } = options;

    const constraints = [
      orderBy('createdAt', 'desc'),
    ];

    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const q = query(collection(db, 'photos'), ...constraints);
    const querySnapshot = await getDocs(q);

    const photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return photos;
  } catch (error) {
    console.error('Error getting all photos:', error);
    throw new Error(error.message || 'Failed to get all photos');
  }
};

/**
 * Get photos for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of photos to return
 * @param {string} options.orderByField - Field to order by (default: 'createdAt')
 * @param {string} options.orderDirection - Order direction ('asc' or 'desc', default: 'desc')
 * @returns {Promise<Array>} Array of photo objects
 * @throws {Error} If fetching photos fails
 */
export const getUserPhotos = async (userId, options = {}) => {
  try {
    const {
      limit: maxResults = 50,
      orderByField = 'createdAt',
      orderDirection = 'desc',
    } = options;

    const constraints = [
      where('userId', '==', userId),
    ];

    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const q = query(collection(db, 'photos'), ...constraints);
    const querySnapshot = await getDocs(q);

    let photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort in memory to avoid needing a Firestore index
    if (orderByField) {
      photos.sort((a, b) => {
        const aVal = a[orderByField];
        const bVal = b[orderByField];

        if (orderDirection === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });
    }

    return photos;
  } catch (error) {
    console.error('Error getting user photos:', error);
    throw new Error(error.message || 'Failed to get user photos');
  }
};

/**
 * Get photos for a specific event
 * @param {string} eventId - Event ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of photos to return
 * @returns {Promise<Array>} Array of photo objects
 * @throws {Error} If fetching photos fails
 */
export const getEventPhotos = async (eventId, options = {}) => {
  try {
    const { limit: maxResults = 50 } = options;

    const constraints = [
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc'),
    ];

    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const q = query(collection(db, 'photos'), ...constraints);
    const querySnapshot = await getDocs(q);

    const photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return photos;
  } catch (error) {
    console.error('Error getting event photos:', error);
    throw new Error(error.message || 'Failed to get event photos');
  }
};

/**
 * Get photos by hashtag
 * @param {string} hashtag - Hashtag to search for
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of photos to return
 * @returns {Promise<Array>} Array of photo objects
 * @throws {Error} If fetching photos fails
 */
export const getPhotosByHashtag = async (hashtag, options = {}) => {
  try {
    const { limit: maxResults = 50 } = options;

    const constraints = [
      where('hashtags', 'array-contains', hashtag),
      orderBy('createdAt', 'desc'),
    ];

    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const q = query(collection(db, 'photos'), ...constraints);
    const querySnapshot = await getDocs(q);

    const photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return photos;
  } catch (error) {
    console.error('Error getting photos by hashtag:', error);
    throw new Error(error.message || 'Failed to get photos by hashtag');
  }
};

/**
 * Delete a photo
 * @param {string} photoId - Photo ID
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails
 */
export const deletePhoto = async (photoId) => {
  try {
    // Get photo document to retrieve storage path
    const photoDoc = await getDoc(doc(db, 'photos', photoId));

    if (!photoDoc.exists()) {
      throw new Error('Photo not found');
    }

    const photoData = photoDoc.data();

    // Delete image from Firebase Storage
    if (photoData.storagePath) {
      await deleteImage(photoData.storagePath);
    }

    // Delete photo document from Firestore
    await deleteDoc(doc(db, 'photos', photoId));
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error(error.message || 'Failed to delete photo');
  }
};

/**
 * Get a single photo by ID
 * @param {string} photoId - Photo ID
 * @returns {Promise<Object>} Photo object
 * @throws {Error} If photo not found or fetch fails
 */
export const getPhotoById = async (photoId) => {
  try {
    const photoDoc = await getDoc(doc(db, 'photos', photoId));

    if (!photoDoc.exists()) {
      throw new Error('Photo not found');
    }

    return {
      id: photoDoc.id,
      ...photoDoc.data(),
    };
  } catch (error) {
    console.error('Error getting photo:', error);
    throw new Error(error.message || 'Failed to get photo');
  }
};
