import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2KQZOqi5mas7shm2v_bY_jbG3R13zqFw",
  authDomain: "unibic-a3778.firebaseapp.com",
  projectId: "unibic-a3778",
  storageBucket: "unibic-a3778.firebasestorage.app",
  messagingSenderId: "69501495624",
  appId: "1:69501495624:web:d4e826e33e569773f72b7d",
  measurementId: "G-Q777MGSBGQ"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
