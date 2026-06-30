// Firestore helpers for saving and loading audit sessions and completed items.

import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './config.js';

const auditSessionsRef = collection(db, 'auditSessions');

// Placeholder scores until calculateScore.js is built in a later phase
const defaultCategoryScores = {
  onPage: 0,
  technical: 0,
  content: 0,
};

// Turn Firebase/Firestore errors into plain English for the UI
const getFirestoreErrorMessage = (error) => {
  if (error.code === 'permission-denied') {
    return 'You do not have permission to save this data. Check Firestore security rules.';
  }
  if (error.code === 'unavailable' || error.code === 'network-request-failed') {
    return 'Unable to reach the server. Check your internet connection.';
  }
  return 'Something went wrong while saving your progress. Please try again.';
};

// Check if a Firestore timestamp falls on today's calendar date (local timezone)
const isToday = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return false;
  }

  const sessionDate = timestamp.toDate();
  const now = new Date();

  return (
    sessionDate.getFullYear() === now.getFullYear() &&
    sessionDate.getMonth() === now.getMonth() &&
    sessionDate.getDate() === now.getDate()
  );
};

// Fetch the user's most recent audit session (used by save and load)
const getMostRecentSession = async (userId) => {
  const sessionsQuery = query(
    auditSessionsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(1),
  );

  const snapshot = await getDocs(sessionsQuery);

  if (snapshot.empty) {
    return null;
  }

  const sessionDoc = snapshot.docs[0];
  return {
    id: sessionDoc.id,
    ...sessionDoc.data(),
  };
};

// Save checklist progress — updates today's session or creates a new one
export const saveAuditSession = async (userId, checkedItems) => {
  try {
    const recentSession = await getMostRecentSession(userId);

    // If user already has a session from today, update it (don't create duplicates)
    if (recentSession && isToday(recentSession.date)) {
      const sessionRef = doc(db, 'auditSessions', recentSession.id);
      await updateDoc(sessionRef, {
        completedItems: checkedItems,
        date: serverTimestamp(),
      });
      return { success: true, sessionId: recentSession.id };
    }

    // No session today — create a new audit session document
    const newSessionRef = await addDoc(auditSessionsRef, {
      userId,
      completedItems: checkedItems,
      date: serverTimestamp(),
      score: 0,
      categoryScores: defaultCategoryScores,
    });

    return { success: true, sessionId: newSessionRef.id };
  } catch (error) {
    return { error: getFirestoreErrorMessage(error) };
  }
};

// Load the user's most recent session to restore checked items
export const loadAuditSession = async (userId) => {
  try {
    const recentSession = await getMostRecentSession(userId);

    if (!recentSession) {
      return { completedItems: [] };
    }

    return {
      completedItems: recentSession.completedItems ?? [],
      sessionId: recentSession.id,
    };
  } catch (error) {
    return {
      error: getFirestoreErrorMessage(error),
      completedItems: [],
    };
  }
};
