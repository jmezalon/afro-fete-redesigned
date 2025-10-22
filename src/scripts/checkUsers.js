import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkUsers() {
  console.log('🔍 Checking users in Firestore...\n');

  const snapshot = await getDocs(collection(db, 'users'));

  console.log(`Found ${snapshot.size} users:\n`);

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`📧 Email: ${data.email}`);
    console.log(`   Doc ID: ${doc.id}`);
    console.log(`   uid field: ${data.uid || 'NOT SET'}`);
    console.log(`   Match: ${doc.id === data.uid ? '✅ YES' : '❌ NO'}`);
    console.log(`   Username: ${data.username}`);
    console.log(`   Full Name: ${data.fullName}`);
    console.log(`   User Type: ${data.userType}`);
    console.log('');
  });

  process.exit(0);
}

checkUsers().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
