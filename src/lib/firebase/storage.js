import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp";

import { updateRecipeImageReference } from "@/src/lib/firebase/firestore";

export async function updateRecipeImage(recipeId, image) {
  try {
    if (!recipeId) {
      throw new Error("No recipe ID has been provided.");
    }

    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }

    // Note: Authentication is enforced by Firebase Storage rules
    // Client-side validation is handled in the calling component

    const publicImageUrl = await uploadImage(recipeId, image);
    await updateRecipeImageReference(recipeId, publicImageUrl);

    return publicImageUrl;
  } catch (error) {
    console.error("Error processing request:", error);
    throw error; // Re-throw to allow caller to handle
  }
}

async function uploadImage(recipeId, image) {
  const filePath = `images/${recipeId}/${image.name}`;
  const newImageRef = ref(storage, filePath);
  await uploadBytesResumable(newImageRef, image);

  return await getDownloadURL(newImageRef);
}