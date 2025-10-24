import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
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
    if (userData.fullName) {
      await updateProfile(user, {
        displayName: userData.fullName,
      });
    }

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      username: userData.username || '',
      fullName: userData.fullName || '',
      userType: userData.userType || 'partygoer',
      favoriteEvents: [],
      followedHashtags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    // Check if document exists
    const userDoc = await getDoc(userRef);

    // Separate password from other updates
    const { password, ...firestoreUpdates } = updates;

    // Update password in Firebase Auth if provided
    if (password && auth.currentUser) {
      await updatePassword(auth.currentUser, password);
    }

    // Add updatedAt timestamp
    const updateData = {
      ...firestoreUpdates,
      updatedAt: new Date().toISOString(),
    };

    if (!userDoc.exists()) {
      // Create the document if it doesn't exist
      const newUserDoc = {
        uid: userId,
        email: auth.currentUser?.email || '',
        username: updates.username || '',
        fullName: updates.fullName || '',
        userType: 'partygoer', // Default user type
        favoriteEvents: [],
        followedHashtags: [],
        createdAt: new Date().toISOString(),
        ...updateData,
      };

      await setDoc(userRef, newUserDoc);
    } else {
      // Update existing document
      await updateDoc(userRef, updateData);
    }

    // Update Firebase Auth profile if fullName is changed
    if (firestoreUpdates.fullName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: firestoreUpdates.fullName,
      });
    }

    // Get updated user data
    const updatedUserDoc = await getDoc(userRef);
    return updatedUserDoc.data();
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

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 * @throws {Error} If sending reset email fails
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
