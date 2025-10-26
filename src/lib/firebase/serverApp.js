// Enforces that this file and its code can only run on the server side in Next.js.
// If this module is accidentally imported in a client component, it will cause an error.
// Reference: Next.js documentation on server-only code.
import "server-only";

// Import the cookies API from Next.js, used to read cookies in a server context.
import { cookies } from "next/headers";

// Import Firebase initialization functions:
// - initializeServerApp: initializes Firebase for server-side environments.
// - initializeApp: initializes the base Firebase app instance.
import { initializeServerApp, initializeApp } from "firebase/app";

// Import the getAuth function to access Firebase Authentication services.
import { getAuth } from "firebase/auth";

// Define an async function that returns an authenticated Firebase app instance
// for use in Server-Side Rendering (SSR) or Static Site Generation (SSG).
export async function getAuthenticatedAppForUser() {
  // Retrieve the value of the "__session" cookie, which stores the Firebase ID token.
  // The token is set on the client after login and allows the server to authenticate the user.
  const authIdToken = (await cookies()).get("__session")?.value;

  // console.log( authIdToken );

  // Firebase Server App is a newer feature in the Firebase SDK that enables
  // creating an app instance on the server using credentials (like the ID token)
  // obtained from the client. It is designed specifically for secure server environments.
  const firebaseServerApp = initializeServerApp(
    // The first argument initializes a standard Firebase app instance.
    // The comment below references a known GitHub issue clarifying the correct usage pattern.
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    initializeApp(),
    {
      // The second argument passes the ID token for authentication,
      // allowing the server to access Firebase as the logged-in user.
      authIdToken,
    }
  );

  // Retrieve the authentication instance tied to the initialized Firebase server app.
  const auth = getAuth(firebaseServerApp);

  // Wait for Firebase Auth to finish verifying the authentication state.
  // This ensures that `auth.currentUser` is available and accurate before continuing.
  await auth.authStateReady();

   // console.log( JSON.stringify( auth.currentUser ) );

  // Return both the initialized Firebase Server App and the authenticated user.
  // auth.currentUser contains uid, displayName, email amongst other properties
  return { firebaseServerApp, currentUser: auth.currentUser };
}
