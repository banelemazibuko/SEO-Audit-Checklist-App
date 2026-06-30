// Firebase Authentication helpers for register, login, logout, and auth state.

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './config.js';

// Turn Firebase error codes into plain English for the UI
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

// Create a new account with email and password
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

// Sign in an existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

// Sign the current user out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

// Listen for login/logout changes — returns unsubscribe for useEffect cleanup
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};
