// Import the RecipeListings React component from the components folder
import RecipeListings from "@/src/components/RecipeListings.jsx"; 

// Import the getRecipes function for fetching recipe data from Firestore
import { getRecipes, getLatestAIRecipe } from "@/src/lib/firebase/firestore.js";

// Import a function that returns a Firebase app instance authenticated for the current user
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";

// Import Firestore utilities from the Firebase SDK
import { getFirestore } from "firebase/firestore";

// Import the ingredient input wrapper component
import IngredientInputWrapper from "@/src/components/IngredientInputWrapper.jsx";

// Import the featured recipe component
import FeaturedRecipe from "@/src/components/FeaturedRecipe.jsx";

// Instruct Next.js to render this route dynamically on the server each time it's requested
// Without this, Next.js might pre-render the page at build time (static generation)
export const dynamic = "force-dynamic";

// Alternative approach: this line could be used to disable revalidation completely (commented out here)
// export const revalidate = 0;

// Define the default exported asynchronous function (the page component)
// This function runs on the server in Next.js (App Router)
export default async function Home(props) {
  
  // Extract search parameters from the props passed to the page (URL query parameters)
  const searchParams = await props.searchParams;
  
  // searchParams can contain filters like cuisineType, difficulty, or sort options, e.g.:
  // ?cuisineType=Italian&difficulty=Easy&sort=Rating
  
  // Get the Firebase server app instance authenticated for the current user session
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();
  
  // Get the Firestore database instance
  const db = getFirestore(firebaseServerApp);
  
  // Fetch the recipe data from Firestore using the authenticated app and search parameters
  const recipes = await getRecipes(db, searchParams);
  
  // Fetch the most recent AI-generated recipe
  const latestAIRecipe = await getLatestAIRecipe(db);
  
  // Return the rendered page markup (JSX)
  // The <main> element contains the IngredientInput, FeaturedRecipe, and RecipeListings components with initial data
  return (
    <main className="main__home">
      <IngredientInputWrapper initialUserId={currentUser?.uid || ""} />
      {latestAIRecipe && <FeaturedRecipe recipe={latestAIRecipe} />}
      <RecipeListings
        initialRecipes={recipes}  // Pass the loaded recipes to the component
        searchParams={searchParams}       // Pass the search parameters for client-side filtering or display
      />
    </main>
  );
}
