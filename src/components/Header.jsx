// Enable Next.js "client component" mode — required for components using browser-side hooks like useEffect
"use client";

// Import React and the useEffect hook for managing component side effects
import React, { useEffect } from "react";

// Import Link component from Next.js for client-side navigation without page reload
import Link from "next/link";

// Import authentication-related functions from the Firebase auth module
// - signInWithGoogle: signs in users with Google
// - signOut: logs out the user
// - onIdTokenChanged: listens for authentication token (login/logout) changes
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";

// Import helper function for adding test recipe and review data to Firestore
import { addFakeRecipesAndReviews } from "@/src/lib/firebase/firestore.js";

// Import cookie utility functions for setting and deleting cookies in Next.js
import { setCookie, deleteCookie } from "cookies-next";

// Custom React hook to manage the authenticated user's session state
function useUserSession(initialUser) {
  // useEffect sets up a listener for authentication token changes (runs once when component mounts)
  useEffect(() => {
    // Start listening for Firebase authentication state changes
    return onIdTokenChanged(async (user) => {
      // If a user is signed in
      if (user) {
        // Get a fresh ID token for the user
        const idToken = await user.getIdToken();
        // Store the token in a cookie named "__session" (for server-side access)
        await setCookie("__session", idToken);
      } else {
        // If no user is signed in, delete the cookie (end session)
        await deleteCookie("__session");
      }

      // If the currently logged-in user hasn't changed, do nothing
      if (initialUser?.uid === user?.uid) {
        return;
      }

      // If the user has changed (login or logout), reload the page to refresh state
      window.location.reload();
    });
  // Dependency array ensures effect runs when initialUser changes
  }, [initialUser]);

  // Return the current user object to the component using this hook
  return initialUser;
}

// Default exported Header component, which displays the app header and sign-in/out UI
export default function Header({ initialUser }) {
  // Use the custom hook to keep track of the user's authentication state
  const user = useUserSession(initialUser);

  // Handler function to sign the user out when the "Sign Out" link is clicked
  const handleSignOut = (event) => {
    event.preventDefault(); // Prevent default link navigation
    signOut();              // Trigger Firebase sign-out
  };

  // Handler function to sign the user in with Google when the "Sign In" link is clicked
  const handleSignIn = (event) => {
    event.preventDefault();  // Prevent default link navigation
    signInWithGoogle();      // Trigger Firebase sign-in with Google
  };

  // Render the component's UI
  return (
    <header>
      {/* App logo and title that links to the homepage */}
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="RecipeAI" />
        RecipeAI
      </Link>

      {/* Conditional rendering: show different UI depending on whether the user is signed in */}
      {user ? (
        <>
          {/* If a user is signed in, show their profile info and menu */}
          <div className="profile">
            <p>
              {/* Show the user's profile photo or a placeholder */}
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {/* Display the user's display name */}
              {user.displayName}
            </p>

            {/* Dropdown menu with user actions */}
            <div className="menu">
              ...
              <ul>
                {/* Show user's name again inside the menu */}
                <li>{user.displayName}</li>

                {/* Option to add sample recipe data for testing */}
                <li>
                  <a href="#" onClick={addFakeRecipesAndReviews}>
                    Add sample recipes
                  </a>
                </li>

                {/* Option to sign out of the app */}
                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        // If no user is signed in, show the "Sign In with Google" link
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}