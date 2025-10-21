import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload an image file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path where the file will be saved
 * @returns {Promise<string>} Download URL of the uploaded file
 * @throws {Error} If upload fails
 */
export const uploadImage = async (file, path) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload an image file with progress tracking
 * @param {File} file - The file to upload
 * @param {string} path - Storage path where the file will be saved
 * @param {Function} onProgress - Callback function for progress updates (receives percentage)
 * @returns {Promise<string>} Download URL of the uploaded file
 * @throws {Error} If upload fails
 */
export const uploadImageWithProgress = async (file, path, onProgress) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create a storage reference
    const storageRef = ref(storage, path);

    // Create an upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          // Call progress callback if provided
          if (onProgress && typeof onProgress === 'function') {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle upload error
          console.error('Error uploading image with progress:', error);
          reject(new Error(error.message || 'Failed to upload image'));
        },
        async () => {
          // Upload completed successfully, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(new Error('Failed to get download URL'));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image with progress:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Delete an image from Firebase Storage
 * @param {string} path - Storage path of the file to delete
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails
 */
export const deleteImage = async (path) => {
  try {
    if (!path) {
      throw new Error('No path provided');
    }

    // Create a storage reference
    const storageRef = ref(storage, path);

    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    // If file doesn't exist, we can consider it successfully deleted
    if (error.code === 'storage/object-not-found') {
      console.warn('File not found, already deleted:', path);
      return;
    }

    console.error('Error deleting image:', error);
    throw new Error(error.message || 'Failed to delete image');
  }
};

/**
 * Get download URL for a file in Firebase Storage
 * @param {string} path - Storage path of the file
 * @returns {Promise<string>} Download URL
 * @throws {Error} If getting URL fails
 */
export const getImageUrl = async (path) => {
  try {
    if (!path) {
      throw new Error('No path provided');
    }

    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw new Error(error.message || 'Failed to get image URL');
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param {Array<File>} files - Array of files to upload
 * @param {string} basePath - Base storage path (files will be saved as basePath/filename)
 * @param {Function} onProgress - Optional callback for overall progress updates
 * @returns {Promise<Array<Object>>} Array of objects with filename and downloadURL
 * @throws {Error} If any upload fails
 */
export const uploadMultipleImages = async (files, basePath, onProgress) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map(async (file, index) => {
      const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
      const downloadURL = await uploadImage(file, path);

      return {
        filename: file.name,
        path,
        downloadURL,
      };
    });

    const results = await Promise.all(uploadPromises);

    if (onProgress && typeof onProgress === 'function') {
      onProgress(100);
    }

    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error(error.message || 'Failed to upload images');
  }
};
