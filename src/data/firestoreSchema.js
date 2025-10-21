/**
 * Firestore Database Schema Documentation
 *
 * This file documents the structure of all Firestore collections used in Afro-fete.
 * Each collection is documented with TypeScript-style JSDoc comments for better
 * type safety and IDE autocomplete support.
 */

/**
 * @typedef {Object} Address
 * @property {string} street - Street address
 * @property {string} city - City name
 * @property {string} state - State abbreviation (e.g., 'NY')
 * @property {string} zip - ZIP code
 */

/**
 * @typedef {Object} User
 * @property {string} userId - Unique user identifier (matches auth UID)
 * @property {string} username - Unique username for the user
 * @property {string} fullName - User's full name
 * @property {string} email - User's email address
 * @property {'promoter'|'partygoer'} userType - Type of user account
 * @property {string} [profilePhoto] - URL to user's profile photo
 * @property {string[]} favoriteEvents - Array of event IDs favorited by user
 * @property {string[]} followedHashtags - Array of hashtag names user follows
 * @property {string} [bio] - User bio/description
 * @property {string} [instagramHandle] - Instagram username (without @)
 * @property {string} [twitterHandle] - Twitter/X username (without @)
 * @property {string} createdAt - ISO timestamp of account creation
 * @property {string} updatedAt - ISO timestamp of last update
 *
 * Collection: users
 * Document ID: {userId}
 */

/**
 * @typedef {Object} Event
 * @property {string} eventId - Unique event identifier
 * @property {string} name - Event name/title
 * @property {string} venue - Venue name
 * @property {Address} address - Venue address
 * @property {string} date - ISO timestamp of event date
 * @property {string} startTime - Event start time (e.g., '9:00 PM')
 * @property {string} [endTime] - Event end time (e.g., '2:00 AM')
 * @property {string} description - Event description
 * @property {string[]} hashtags - Array of associated hashtag names
 * @property {string} [ticketLink] - URL to purchase tickets
 * @property {string} [flyerUrl] - URL to event flyer image
 * @property {'brunch'|'nightlife'|'festivals'|'arts'|'afterwork'|'concerts'|'dayparty'|'boatrides'} category - Event category
 * @property {number} [price] - Ticket price (0 for free events)
 * @property {string} createdBy - User ID of event creator (promoter)
 * @property {string[]} favoritedBy - Array of user IDs who favorited this event
 * @property {number} favoritesCount - Count of favorites
 * @property {string} createdAt - ISO timestamp of event creation
 * @property {string} updatedAt - ISO timestamp of last update
 *
 * Collection: events
 * Document ID: {eventId}
 *
 * Indexes required:
 * - category (ascending), date (ascending)
 * - hashtags (array-contains), date (ascending)
 * - createdBy (ascending), date (ascending)
 * - favoritedBy (array-contains), date (ascending)
 */

/**
 * @typedef {Object} Photo
 * @property {string} photoId - Unique photo identifier
 * @property {string} imageUrl - URL to the uploaded image
 * @property {string} storagePath - Firebase Storage path for the image
 * @property {string[]} hashtags - Array of hashtag names
 * @property {string} postedBy - User ID of photo uploader
 * @property {string} [eventId] - Event ID if photo is linked to an event
 * @property {string} [caption] - Photo caption/description
 * @property {number} likes - Number of likes
 * @property {string[]} likedBy - Array of user IDs who liked this photo
 * @property {string} createdAt - ISO timestamp of upload
 * @property {string} updatedAt - ISO timestamp of last update
 *
 * Collection: photos
 * Document ID: {photoId}
 *
 * Indexes required:
 * - hashtags (array-contains), createdAt (descending)
 * - eventId (ascending), createdAt (descending)
 * - postedBy (ascending), createdAt (descending)
 */

/**
 * @typedef {Object} Hashtag
 * @property {string} hashtagId - Unique hashtag identifier (normalized tag name)
 * @property {string} name - Hashtag name (without #, lowercase)
 * @property {number} count - Number of times hashtag has been used
 * @property {string} lastUsed - ISO timestamp of last usage
 * @property {string} createdAt - ISO timestamp of first usage
 * @property {string} [description] - Optional hashtag description
 * @property {boolean} [trending] - Whether this hashtag is currently trending
 *
 * Collection: hashtags
 * Document ID: {hashtagId} (normalized hashtag name)
 *
 * Indexes required:
 * - count (descending)
 * - lastUsed (descending)
 */

/**
 * Firestore Security Rules Recommendations
 *
 * Place these rules in your Firebase Console -> Firestore Database -> Rules
 *
 * ```
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *
 *     // Helper function to check if user is authenticated
 *     function isSignedIn() {
 *       return request.auth != null;
 *     }
 *
 *     // Helper function to check if user owns the resource
 *     function isOwner(userId) {
 *       return request.auth.uid == userId;
 *     }
 *
 *     // Users collection
 *     match /users/{userId} {
 *       // Anyone can read user profiles
 *       allow read: if true;
 *
 *       // Only the user can create/update their own profile
 *       allow create: if isSignedIn() && isOwner(userId);
 *       allow update: if isSignedIn() && isOwner(userId);
 *
 *       // Only the user can delete their own profile
 *       allow delete: if isSignedIn() && isOwner(userId);
 *     }
 *
 *     // Events collection
 *     match /events/{eventId} {
 *       // Anyone can read events
 *       allow read: if true;
 *
 *       // Only authenticated users can create events
 *       allow create: if isSignedIn()
 *         && request.resource.data.createdBy == request.auth.uid;
 *
 *       // Only event creator can update their events
 *       allow update: if isSignedIn()
 *         && resource.data.createdBy == request.auth.uid;
 *
 *       // Only event creator can delete their events
 *       allow delete: if isSignedIn()
 *         && resource.data.createdBy == request.auth.uid;
 *     }
 *
 *     // Photos collection
 *     match /photos/{photoId} {
 *       // Anyone can read photos
 *       allow read: if true;
 *
 *       // Only authenticated users can upload photos
 *       allow create: if isSignedIn()
 *         && request.resource.data.postedBy == request.auth.uid;
 *
 *       // Only photo uploader can update their photos
 *       allow update: if isSignedIn()
 *         && resource.data.postedBy == request.auth.uid;
 *
 *       // Only photo uploader can delete their photos
 *       allow delete: if isSignedIn()
 *         && resource.data.postedBy == request.auth.uid;
 *     }
 *
 *     // Hashtags collection
 *     match /hashtags/{hashtagId} {
 *       // Anyone can read hashtags
 *       allow read: if true;
 *
 *       // Only authenticated users can create/update hashtags
 *       // (typically done programmatically when events/photos are created)
 *       allow create, update: if isSignedIn();
 *
 *       // Hashtags shouldn't be deleted, but if needed, require authentication
 *       allow delete: if isSignedIn();
 *     }
 *   }
 * }
 * ```
 *
 * Additional Security Considerations:
 * 1. Enable App Check to prevent abuse from unauthorized clients
 * 2. Set up rate limiting using Firebase App Check
 * 3. Validate data types and required fields using security rules
 * 4. Consider using Cloud Functions for sensitive operations like:
 *    - Incrementing hashtag counts
 *    - Updating favorites count on events
 *    - Sending notifications
 * 5. Regularly audit your security rules using the Rules Playground
 */

export const COLLECTION_NAMES = {
  USERS: 'users',
  EVENTS: 'events',
  PHOTOS: 'photos',
  HASHTAGS: 'hashtags',
};

export const USER_TYPES = {
  PROMOTER: 'promoter',
  PARTYGOER: 'partygoer',
};

export const EVENT_CATEGORIES = {
  BRUNCH: 'brunch',
  NIGHTLIFE: 'nightlife',
  FESTIVALS: 'festivals',
  ARTS: 'arts',
  AFTERWORK: 'afterwork',
  CONCERTS: 'concerts',
  DAYPARTY: 'dayparty',
  BOATRIDES: 'boatrides',
};
