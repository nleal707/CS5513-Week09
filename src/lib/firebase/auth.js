// Import specific authentication functions and classes from Firebase Authentication SDK
import {
  GoogleAuthProvider,        // Used to configure Google sign-in as an authentication provider
  signInWithPopup,           // Opens a popup for the user to sign in with their Google account
  onAuthStateChanged as _onAuthStateChanged,  // Listener for changes in authentication state (login/logout)
  onIdTokenChanged as _onIdTokenChanged,      // Listener for changes in the user's ID token (refresh/expiration)
} from "firebase/auth";

// Import the initialized Firebase Authentication instance from the clientApp configuration file
import { auth } from "@/src/lib/firebase/clientApp";

// Define a function to listen for authentication state changes (user signed in or out)
// This wraps Firebase’s built-in onAuthStateChanged and binds it to the app’s auth instance
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb); // Returns the unsubscribe function so it can be cleaned up later
}

// Define a function to listen for ID token changes (token refresh or user state changes)
// Also wraps Firebase’s native function for convenience and consistency
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb); // Returns the unsubscribe function to stop listening when needed
}

// Define an async function to sign in a user using Google authentication
export async function signInWithGoogle() {
  // Create a new Google authentication provider instance
  const provider = new GoogleAuthProvider();

  try {
    // Open a popup window and sign in the user with their Google account
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors that occur during sign-in for debugging
    console.error("Error signing in with Google", error);
  }
}

// Define an async function to sign out the current authenticated user
export async function signOut() {
  try {
    // Call Firebase’s signOut method to log out the user
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during sign-out
    console.error("Error signing out with Google", error);
  }
}
