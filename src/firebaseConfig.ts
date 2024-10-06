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
  query,
  where,
} from "firebase/firestore";
import { MongoClient } from "mongodb";

import { FirebaseApp } from "@firebase/app-types";

const mongoUri =
  "mongodb+srv://thusalapi:79WSKJoZqmMM8fdG@cluster0.1jgln.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB Atlas connection string

const mongoClient = new MongoClient(mongoUri);

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

// Fetch all sessions related to a specific student
export async function getAllSessions(studentId: string) {
  const sessions: any = [];
  const sessionCollectionRef = collection(db, `sessions`);
  const sessionSnapshot = await getDocs(sessionCollectionRef);

  sessionSnapshot.forEach((doc) => {
    const sessionData = doc.data();
    if (sessionData.students && sessionData.students[studentId]) {
      sessions.push({ sessionId: doc.id, ...sessionData });
    }
  });

  return sessions;
}

export async function getCurrentVersion(sessionId: string, studentId: string) {
  const versionCollectionRef = collection(
    db,
    `sessions/${sessionId}/students/${studentId}/codeVersions`
  );
  const snapshot = await getDocs(versionCollectionRef);
  const versionCount = snapshot.size;
  return versionCount + 1; // Version numbers start from 1
}

// Function to upload code to Firebase and MongoDB
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

    // Upload to Firebase Firestore
    await setDoc(codeVersionRef, {
      code: code,
      commitMessage: commitMessage,
      timestamp: serverTimestamp(),
    });

    // Upload to MongoDB Atlas
    await mongoClient.connect(); // Ensure connection is established
    const database = mongoClient.db("test"); // Replace with your database name
    const collection = database.collection("codeuploads"); // Replace with your collection name

    await collection.insertOne({
      sessionId,
      studentId,
      code,
      commitMessage,
      timestamp: new Date(), // or serverTimestamp() if you prefer
      version: currentVersion,
    });

    return `Code uploaded successfully as version ${currentVersion} with commit message: "${commitMessage}"`;
  } catch (error) {
    throw new Error(
      `Failed to upload code: ${error instanceof Error ? error.message : error}`
    );
  } finally {
    await mongoClient.close(); // Close the connection
  }
}

export { db };
