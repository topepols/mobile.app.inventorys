// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTpNTxXFA-Qz7l0suasPsv3gDRAugczxg",
  authDomain: "mobile-inventory-95f33.firebaseapp.com",
  projectId: "mobile-inventory-95f33",
  storageBucket: "mobile-inventory-95f33.appspot.com",
  messagingSenderId: "287910189355",
  appId: "1:287910189355:web:e72db7deae86913b714d6e",
  measurementId: "G-7GLZG5L9JF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Create a reference to the correct Firestore collection
const inventoryCollection = collection(db, "inventory");

// Confirm connection in console
console.warn("✅ Connected to Firestore:", db);
console.warn("✅ Firebase Auth initialized:", auth);
console.warn("📦 Using collection: inventory");

export { db, auth, inventoryCollection };
