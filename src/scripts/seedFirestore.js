#!/usr/bin/env node

/**
 * Firestore Seeding Script
 *
 * This script uploads seed data to Firestore collections.
 * Run with: npm run seed
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { users, events, photos, hashtags } from '../data/seedData.js';

// Initialize Firebase (same config as in firebase.js)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Upload data in batches to avoid Firestore limits
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Array} dataArray - Array of documents to upload
 * @param {number} batchSize - Number of documents per batch (max 500)
 * @param {Object} uidMapping - Mapping of custom userId to Firebase UID
 */
async function uploadInBatches(collectionName, dataArray, batchSize = 500, uidMapping = {}) {
  console.log(`\n📤 Uploading ${dataArray.length} documents to '${collectionName}' collection...`);

  for (let i = 0; i < dataArray.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchData = dataArray.slice(i, i + batchSize);

    batchData.forEach((item) => {
      // For users collection, use Firebase UID; for others, use custom IDs
      let docId;
      if (collectionName === 'users' && item.userId && uidMapping[item.userId]) {
        docId = uidMapping[item.userId]; // Use Firebase UID for users
      } else {
        docId = item.userId || item.eventId || item.photoId || item.hashtagId;
      }

      const docRef = doc(db, collectionName, docId);

      // Remove the ID field from the document data (it's already in the doc path)
      const { userId, eventId, photoId, hashtagId, ...documentData } = item;

      // For users, add uid field to document
      if (collectionName === 'users' && userId && uidMapping[userId]) {
        documentData.uid = uidMapping[userId];
      }

      // For events, update createdBy field to use Firebase UID
      if (collectionName === 'events' && documentData.createdBy && uidMapping[documentData.createdBy]) {
        documentData.createdBy = uidMapping[documentData.createdBy];
      }

      // For photos, update postedBy field to use Firebase UID
      if (collectionName === 'photos' && documentData.postedBy && uidMapping[documentData.postedBy]) {
        documentData.postedBy = uidMapping[documentData.postedBy];
      }

      batch.set(docRef, documentData);
    });

    await batch.commit();
    console.log(`   ✅ Uploaded batch ${Math.floor(i / batchSize) + 1} (${batchData.length} documents)`);
  }

  console.log(`✨ Successfully uploaded all documents to '${collectionName}'!\n`);
}

/**
 * Create authentication accounts for users and return mapping
 */
async function createAuthAccounts() {
  console.log('\n🔐 Creating authentication accounts for users...\n');

  const uidMapping = {}; // Map custom userId to Firebase UID
  const password = 'TestPassword123!'; // In production, use secure passwords

  for (const user of users) {
    try {
      // Try to create new auth account
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, password);
      uidMapping[user.userId] = userCredential.user.uid;
      console.log(`   ✅ Created auth account for ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        // Account exists, sign in to get UID
        try {
          const userCredential = await signInWithEmailAndPassword(auth, user.email, password);
          uidMapping[user.userId] = userCredential.user.uid;
          console.log(`   ♻️  Using existing auth account for ${user.email}`);
          // Sign out to avoid conflicts
          await signOut(auth);
        } catch (signInError) {
          console.error(`   ❌ Error signing in to existing account ${user.email}:`, signInError.message);
        }
      } else {
        console.error(`   ❌ Error creating auth for ${user.email}:`, error.message);
      }
    }
  }

  // Sign out after all accounts are processed
  try {
    await signOut(auth);
  } catch (error) {
    // Ignore sign out errors
  }

  console.log('\n✨ Finished creating authentication accounts!\n');
  return uidMapping;
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  console.log('\n🌱 Starting Firestore database seeding...\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Create auth accounts for users and get UID mapping
    const uidMapping = await createAuthAccounts();

    // Step 2: Upload users with Firebase UIDs
    await uploadInBatches('users', users, 500, uidMapping);

    // Step 3: Upload events (createdBy field will be updated to Firebase UIDs)
    await uploadInBatches('events', events, 500, uidMapping);

    // Step 4: Upload photos (uploadedBy field will be updated to Firebase UIDs)
    await uploadInBatches('photos', photos, 500, uidMapping);

    // Step 5: Upload hashtags
    await uploadInBatches('hashtags', hashtags, 500, uidMapping);

    console.log('═'.repeat(60));
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${users.length} users created with Firebase Auth UIDs`);
    console.log(`   • ${events.length} events uploaded`);
    console.log(`   • ${photos.length} photos uploaded`);
    console.log(`   • ${hashtags.length} hashtags uploaded`);
    console.log('\n💡 Note: All test accounts use password: TestPassword123!');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();
