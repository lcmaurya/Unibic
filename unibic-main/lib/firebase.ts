import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCrmMPM9St8fTkH4NmeYEIkuQ6RkjJBeu8",
  authDomain: "unibic-trust.firebaseapp.com",
  projectId: "unibic-trust",
  storageBucket: "unibic-trust.firebasestorage.app",
  messagingSenderId: "681799962148",
  appId: "1:681799962148:web:0b1b7e1d8b8e376a0d92b1",
  measurementId: "G-C8CZCJGY7T"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
