/**
 * Script to normalize all photo hashtags to lowercase
 * Run this once to update existing photos in the database
 *
 * Usage: node scripts/normalizeHashtags.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function normalizeHashtags() {
  console.log('🚀 Starting hashtag normalization...\n');

  try {
    // Get all photos
    const photosSnapshot = await getDocs(collection(db, 'photos'));
    const totalPhotos = photosSnapshot.size;

    console.log(`📸 Found ${totalPhotos} photos to process\n`);

    if (totalPhotos === 0) {
      console.log('✅ No photos found in database');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each photo
    for (const photoDoc of photosSnapshot.docs) {
      const photoData = photoDoc.data();
      const photoId = photoDoc.id;

      // Check if photo has hashtags
      if (!photoData.hashtags || !Array.isArray(photoData.hashtags)) {
        console.log(`⏭️  Skipping photo ${photoId} (no hashtags)`);
        skippedCount++;
        continue;
      }

      // Normalize hashtags to lowercase
      const originalHashtags = photoData.hashtags;
      const normalizedHashtags = originalHashtags.map(tag =>
        typeof tag === 'string' ? tag.toLowerCase() : tag
      );

      // Check if any changes are needed
      const hasChanges = originalHashtags.some((tag, index) =>
        tag !== normalizedHashtags[index]
      );

      if (!hasChanges) {
        console.log(`✓ Photo ${photoId} - already normalized`);
        skippedCount++;
        continue;
      }

      try {
        // Update the document
        await updateDoc(doc(db, 'photos', photoId), {
          hashtags: normalizedHashtags,
          updatedAt: new Date().toISOString(),
        });

        console.log(`✅ Updated photo ${photoId}`);
        console.log(`   Before: [${originalHashtags.join(', ')}]`);
        console.log(`   After:  [${normalizedHashtags.join(', ')}]\n`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating photo ${photoId}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n========================================');
    console.log('📊 SUMMARY');
    console.log('========================================');
    console.log(`Total photos processed: ${totalPhotos}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (no changes needed): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('========================================\n');

    if (updatedCount > 0) {
      console.log('✨ Hashtag normalization completed successfully!');
    } else {
      console.log('ℹ️  All hashtags were already normalized');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
normalizeHashtags()
  .then(() => {
    console.log('\n✅ Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
