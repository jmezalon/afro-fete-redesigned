import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
  console.log(`\n🗑️  Clearing ${collectionName} collection...`);
  const snapshot = await getDocs(collection(db, collectionName));
  
  let count = 0;
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
    count++;
  }
  
  console.log(`✅ Deleted ${count} documents from ${collectionName}`);
}

async function main() {
  console.log('🧹 Starting Firestore cleanup...\n');
  
  await clearCollection('events');
  await clearCollection('photos');
  await clearCollection('hashtags');
  await clearCollection('users');
  
  console.log('\n✨ Firestore cleanup completed!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
