"use server";

import { addReviewToRecipe } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";
import { generateRecipe, addRecipeToFirestore } from "@/src/lib/ai/recipeGenerator.js";
import { toggleFavorite } from "@/src/lib/firebase/favorites.js";

// This is a next.js server action, which is an alpha feature, so use with caution.
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
export async function handleReviewFormSubmission(data) {
        // const { app } = await getAuthenticatedAppForUser();
        // ETHAN NOTE: RETRIEVE currentUser FROM SERVER-SIDE FIREBASE AUTH FOR SECURITY
        const { app, currentUser } = await getAuthenticatedAppForUser();
        const db = getFirestore(app);

        // console.log( JSON.stringify( currentUser ) );

        await addReviewToRecipe(db, data.get("recipeId"), {
                text: data.get("text"),
                rating: data.get("rating"),

                // This came from a hidden form field.
                //userId: data.get("userId"),
                // ETHAN NOTE: INSTEAD OF LETTING USERID BE PASSED FROM CLIENT IN HIDDEN FORM
                // FIELD, USE THE SERVER-SIDE FIREBASE AUTH RESULT FOR currentUser.uid
                // THIS WILL BE MORE SECURE SINCE NOT RELYING ON CLIENT POSTED USERID
                userId: currentUser.uid,
        });
}

// Server action for generating recipes from ingredients
export async function handleRecipeGeneration(ingredients, filters = {}) {
  try {
    const { currentUser } = await getAuthenticatedAppForUser();
    
    if (!currentUser) {
      throw new Error("User must be authenticated to generate recipes");
    }

    // Generate recipe using AI
    const recipe = await generateRecipe(ingredients, filters);
    
    // Add recipe to Firestore
    const recipeId = await addRecipeToFirestore(recipe);
    
    return { success: true, recipeId, recipe };
  } catch (error) {
    console.error("Error generating recipe:", error);
    return { success: false, error: error.message };
  }
}

// Server action for toggling favorite status
export async function handleFavoriteToggle(recipeId) {
  try {
    const { currentUser } = await getAuthenticatedAppForUser();
    
    if (!currentUser) {
      throw new Error("User must be authenticated to save favorites");
    }

    const isFavorited = await toggleFavorite(currentUser.uid, recipeId);
    
    return { success: true, isFavorited };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: error.message };
  }
}