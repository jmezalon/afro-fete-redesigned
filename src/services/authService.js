import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {Object} userData - Additional user data (name, role, etc.)
 * @returns {Promise<Object>} User data object
 * @throws {Error} If signup fails
 */
export const signUpUser = async (email, password, userData) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name if provided
    if (userData.name) {
      await updateProfile(user, {
        displayName: userData.name,
      });
    }

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      name: userData.name || '',
      role: userData.role || 'user', // 'user' or 'promoter'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorites: [],
      ...userData,
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return {
      uid: user.uid,
      email: user.email,
      ...userDoc,
    };
  } catch (error) {
    console.error('Error signing up user:', error);
    throw new Error(error.message || 'Failed to sign up user');
  }
};

/**
 * Sign in an existing user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data object
 * @throws {Error} If signin fails
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return {
      uid: user.uid,
      email: user.email,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('Error signing in user:', error);
    throw new Error(error.message || 'Failed to sign in user');
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 * @throws {Error} If signout fails
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out user:', error);
    throw new Error(error.message || 'Failed to sign out user');
  }
};

/**
 * Update user profile information
 * @param {string} userId - User's ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If update fails
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userRef, updateData);

    // Update auth profile if name is changed
    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name,
      });
    }

    // Get updated user data
    const userDoc = await getDoc(userRef);
    return userDoc.data();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update user profile');
  }
};

/**
 * Get current user data from Firestore
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} User data object
 * @throws {Error} If fetching user data fails
 */
export const getCurrentUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    return {
      uid: userId,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    throw new Error(error.message || 'Failed to get user data');
  }
};
