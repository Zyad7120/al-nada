import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPwIcBu4PoPKZsDz-FFQqcARXfxC1kYHY",
  authDomain: "lively-vision-rr5vm.firebaseapp.com",
  projectId: "lively-vision-rr5vm",
  storageBucket: "lively-vision-rr5vm.firebasestorage.app",
  messagingSenderId: "806714661922",
  appId: "1:806714661922:web:d71e63d3d4ef34f25cbe7b"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with database ID for immediate real-time synchronization
export const db = initializeFirestore(app, {}, "ai-studio-b73c3768-3dfd-410a-8067-ef3c7c19f3d6");
