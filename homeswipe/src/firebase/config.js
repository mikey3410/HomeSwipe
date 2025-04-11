//config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIpbaK41KnSr-iY8B9J6rTAX7aRIeK5NQ",
  authDomain: "homeswipe-6b25b.firebaseapp.com",
  projectId: "homeswipe-6b25b",
  storageBucket: "homeswipe-6b25b.firebasestorage.app",
  messagingSenderId: "51707612531",
  appId: "1:51707612531:web:1e6beb14441f79999d4906"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 