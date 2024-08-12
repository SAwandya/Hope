// Import required functions from Firebase SDK
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8XrgPikkM1h29FHkqA4RRMPzFFnpSCEk",
  authDomain: "hope-d24b7.firebaseapp.com",
  projectId: "hope-d24b7",
  storageBucket: "hope-d24b7.appspot.com",
  messagingSenderId: "581027301365",
  appId: "1:581027301365:web:1dca7d180227a1576002bc",
  measurementId: "G-XKTNDBTR3B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db, collection, addDoc, serverTimestamp };
