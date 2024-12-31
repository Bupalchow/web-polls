import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {

  apiKey: "AIzaSyAPV8IX0VPpfQXaEY4dLz4RZUELbVaYe5o",

  authDomain: "proximity-51dec.firebaseapp.com",

  projectId: "proximity-51dec",

  storageBucket: "proximity-51dec.firebasestorage.app",

  messagingSenderId: "658097798807",

  appId: "1:658097798807:web:23a2e95916b07a3a7e33d2",

  measurementId: "G-3QMJ5D4WK8"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);