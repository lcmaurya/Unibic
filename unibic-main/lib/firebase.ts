"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCrmMPM9St8fTkH4NmeYEIkuQ6RkjUBeu8",
  authDomain: "unibic-trust.firebaseapp.com",
  projectId: "unibic-trust",
  storageBucket: "unibic-trust.appspot.com",
  messagingSenderId: "681799962148",
  appId: "1:681799962148:web:0b1b7e1d8b8e376a0d92b1",
  measurementId: "G-C8CZCJGY7T"
};

// 👇 Browser-safe init (SSR crash guard)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
