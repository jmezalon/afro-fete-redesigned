import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import {
  signUpUser,
  signInUser,
  signOutUser,
  updateUserProfile,
} from '../services/authService';

/**
 * @typedef {Object} User
 * @property {string} uid - User ID
 * @property {string} email - User email
 * @property {string} username - Username
 * @property {string} fullName - Full name
 * @property {'promoter'|'partygoer'} userType - User type
 * @property {string} [profilePhoto] - Profile photo URL
 * @property {string[]} favoriteEvents - Array of favorited event IDs
 * @property {string[]} followedHashtags - Array of followed hashtags
 * @property {string} [bio] - User bio
 * @property {string} [instagramHandle] - Instagram handle
 * @property {string} [twitterHandle] - Twitter handle
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User | null} user - Current user object with Firestore data
 * @property {boolean} isLoading - Loading state while checking auth
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {Function} signUp - Sign up new user
 * @property {Function} signIn - Sign in existing user
 * @property {Function} signOut - Sign out current user
 * @property {Function} updateProfile - Update user profile
 * @property {Function} toggleFavorite - Toggle event favorite
 * @property {Function} followHashtag - Follow a hashtag
 * @property {Function} unfollowHashtag - Unfollow a hashtag
 * @property {Function} getCurrentUser - Get current user data
 * @property {string | null} error - Error message if any
 */

const AuthContext = createContext(/** @type {AuthContextValue | undefined} */ (undefined));

/**
 * Custom hook to use the Auth context
 * @returns {AuthContextValue} Auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to the app
 *
 * Features:
 * - Firebase Authentication state management
 * - Real-time Firestore user data sync
 * - Comprehensive auth methods
 * - Error handling with user-friendly messages
 * - Loading states
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, set up Firestore listener
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        // Subscribe to real-time Firestore updates
        const unsubscribeFirestore = onSnapshot(
          userDocRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...userData,
              });
            } else {
              // Firestore doc doesn't exist yet (might be creating)
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
              });
            }
            setIsLoading(false);
          },
          (error) => {
            console.error('Error fetching user data from Firestore:', error);
            setError('Failed to load user data');
            setIsLoading(false);
          }
        );

        // Store unsubscribe function for cleanup
        return () => {
          unsubscribeFirestore();
        };
      } else {
        // User is signed out
        setUser(null);
        setIsLoading(false);
      }
    });

    // Cleanup auth listener on unmount
    return () => {
      unsubscribeAuth();
    };
  }, []);

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Username
   * @param {string} fullName - Full name
   * @param {'promoter'|'partygoer'} userType - User type
   * @returns {Promise<User>} Created user object
   * @throws {Error} If signup fails
   */
  const signUp = async (email, password, username, fullName, userType) => {
    try {
      setError(null);
      setIsLoading(true);

      const userData = await signUpUser(email, password, {
        username,
        fullName,
        userType,
        favoriteEvents: [],
        followedHashtags: [],
      });

      return userData;
    } catch (err) {
      console.error('Sign up error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User>} Signed in user object
   * @throws {Error} If signin fails
   */
  const signIn = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const userData = await signInUser(email, password);
      return userData;
    } catch (err) {
      console.error('Sign in error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   * @throws {Error} If signout fails
   */
  const signOut = async () => {
    try {
      setError(null);
      await signOutUser();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Update current user's profile
   * @param {Object} updates - Fields to update
   * @returns {Promise<User>} Updated user object
   * @throws {Error} If update fails or user not authenticated
   */
  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      setError(null);
      const updatedUser = await updateUserProfile(user.uid, updates);
      return updatedUser;
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Toggle favorite status for an event
   * @param {string} eventId - Event ID to favorite/unfavorite
   * @returns {Promise<void>}
   * @throws {Error} If toggle fails or user not authenticated
   */
  const toggleFavorite = async (eventId) => {
    try {
      if (!user) {
        throw new Error('You must be signed in to favorite events');
      }

      setError(null);
      const userRef = doc(db, 'users', user.uid);
      const isFavorited = user.favoriteEvents?.includes(eventId);

      if (isFavorited) {
        // Remove from favorites
        await updateDoc(userRef, {
          favoriteEvents: arrayRemove(eventId),
        });
      } else {
        // Add to favorites
        await updateDoc(userRef, {
          favoriteEvents: arrayUnion(eventId),
        });
      }

      // Also update the event's favoritedBy array
      const eventRef = doc(db, 'events', eventId);
      if (isFavorited) {
        await updateDoc(eventRef, {
          favoritedBy: arrayRemove(user.uid),
          favoritesCount: Math.max(0, (user.favoritesCount || 0) - 1),
        });
      } else {
        await updateDoc(eventRef, {
          favoritedBy: arrayUnion(user.uid),
          favoritesCount: (user.favoritesCount || 0) + 1,
        });
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Follow a hashtag
   * @param {string} hashtag - Hashtag to follow (without #)
   * @returns {Promise<void>}
   * @throws {Error} If follow fails or user not authenticated
   */
  const followHashtag = async (hashtag) => {
    try {
      if (!user) {
        throw new Error('You must be signed in to follow hashtags');
      }

      setError(null);
      const normalizedHashtag = hashtag.replace('#', '').toLowerCase().trim();
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        followedHashtags: arrayUnion(normalizedHashtag),
      });
    } catch (err) {
      console.error('Follow hashtag error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Unfollow a hashtag
   * @param {string} hashtag - Hashtag to unfollow (without #)
   * @returns {Promise<void>}
   * @throws {Error} If unfollow fails or user not authenticated
   */
  const unfollowHashtag = async (hashtag) => {
    try {
      if (!user) {
        throw new Error('You must be signed in to unfollow hashtags');
      }

      setError(null);
      const normalizedHashtag = hashtag.replace('#', '').toLowerCase().trim();
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        followedHashtags: arrayRemove(normalizedHashtag),
      });
    } catch (err) {
      console.error('Unfollow hashtag error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Get current user data
   * @returns {User | null} Current user object or null if not authenticated
   */
  const getCurrentUser = () => {
    return user;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateProfile,
    toggleFavorite,
    followHashtag,
    unfollowHashtag,
    getCurrentUser,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

/**
 * Protected Route Component
 * Redirects to signin page if user is not authenticated
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 * @param {string} [props.redirectTo='/signin'] - Path to redirect if not authenticated
 * @returns {React.ReactElement} Protected content or redirect
 *
 * @example
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({ children, redirectTo = '/signin' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Convert Firebase error codes to user-friendly messages
 * @param {Error} error - Error object from Firebase
 * @returns {string} User-friendly error message
 */
function getErrorMessage(error) {
  const errorCode = error.code || error.message;

  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'unauthenticated': 'You must be signed in to perform this action.',
  };

  // Check if error code exists in our messages
  for (const [code, message] of Object.entries(errorMessages)) {
    if (errorCode.includes(code)) {
      return message;
    }
  }

  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
}
