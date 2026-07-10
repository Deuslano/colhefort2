import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC6OCeSJatlQitn-sYHs_HfIUOh2BBPDOE",
  authDomain: "colhefort-709e2.firebaseapp.com",
  projectId: "colhefort-709e2",
  storageBucket: "colhefort-709e2.firebasestorage.app",
  messagingSenderId: "261931437976",
  appId: "1:261931437976:web:745d8a7192d8df19daa5ed",
  measurementId: "G-CDRVTB9XBK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure auth to not persist session (memory only - no persistence)
setPersistence(auth, inMemoryPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});
