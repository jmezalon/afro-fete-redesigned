#!/usr/bin/env node

/**
 * Firestore Seeding Script
 *
 * This script uploads seed data to Firestore collections.
 * Run with: npm run seed
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
 */
async function uploadInBatches(collectionName, dataArray, batchSize = 500) {
  console.log(`\n📤 Uploading ${dataArray.length} documents to '${collectionName}' collection...`);

  for (let i = 0; i < dataArray.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchData = dataArray.slice(i, i + batchSize);

    batchData.forEach((item) => {
      const docId = item.userId || item.eventId || item.photoId || item.hashtagId;
      const docRef = doc(db, collectionName, docId);

      // Remove the ID field from the document data (it's already in the doc path)
      const { userId, eventId, photoId, hashtagId, ...documentData } = item;

      batch.set(docRef, documentData);
    });

    await batch.commit();
    console.log(`   ✅ Uploaded batch ${Math.floor(i / batchSize) + 1} (${batchData.length} documents)`);
  }

  console.log(`✨ Successfully uploaded all documents to '${collectionName}'!\n`);
}

/**
 * Create authentication accounts for users
 */
async function createAuthAccounts() {
  console.log('\n🔐 Creating authentication accounts for users...\n');

  for (const user of users) {
    try {
      // Create auth account with email and a default password
      const password = 'TestPassword123!'; // In production, use secure passwords
      await createUserWithEmailAndPassword(auth, user.email, password);
      console.log(`   ✅ Created auth account for ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`   ⚠️  Auth account already exists for ${user.email}`);
      } else {
        console.error(`   ❌ Error creating auth for ${user.email}:`, error.message);
      }
    }
  }

  console.log('\n✨ Finished creating authentication accounts!\n');
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  console.log('\n🌱 Starting Firestore database seeding...\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Create auth accounts for users
    await createAuthAccounts();

    // Step 2: Upload users
    await uploadInBatches('users', users);

    // Step 3: Upload events
    await uploadInBatches('events', events);

    // Step 4: Upload photos
    await uploadInBatches('photos', photos);

    // Step 5: Upload hashtags
    await uploadInBatches('hashtags', hashtags);

    console.log('═'.repeat(60));
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${users.length} users created`);
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
