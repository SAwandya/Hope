// Import required functions from Firebase SDK
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

import { FirebaseApp } from "@firebase/app-types";

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

export async function getCurrentVersion(sessionId: string, studentId: string) {
  const versionCollectionRef = collection(
    db,
    `sessions/${sessionId}/students/${studentId}/codeVersions`
  );
  const snapshot = await getDocs(versionCollectionRef);
  const versionCount = snapshot.size;
  return versionCount + 1; // Version numbers start from 1
}

export async function uploadCode(
  sessionId: string,
  studentId: string,
  code: string
) {
  try {
    const currentVersion = await getCurrentVersion(sessionId, studentId);
    const codeVersionRef = doc(
      db,
      `sessions/${sessionId}/students/${studentId}/codeVersions/${currentVersion}`
    );

    await setDoc(codeVersionRef, {
      code: code,
      timestamp: serverTimestamp(),
    });

    return `Code uploaded successfully as version ${currentVersion}`;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
  }
}
