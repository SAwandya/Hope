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

// Firebase configuration
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
  code: string,
  commitMessage: string
) {
  try {
    const currentVersion = await getCurrentVersion(sessionId, studentId);
    const codeVersionRef = doc(
      db,
      `sessions/${sessionId}/students/${studentId}/codeVersions/${currentVersion}`
    );

    await setDoc(codeVersionRef, {
      code: code,
      commitMessage: commitMessage, // Store commit message
      timestamp: serverTimestamp(),
    });

    return `Code uploaded successfully as version ${currentVersion} with commit message: "${commitMessage}"`;
  } catch (error) {
    throw new Error(
      `Failed to upload code: ${error instanceof Error ? error.message : error}`
    );
  }
}

export { db };
