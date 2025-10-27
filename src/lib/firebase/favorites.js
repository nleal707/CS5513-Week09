// Favorites system for recipes
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase/clientApp";

// Add a recipe to user's favorites
export async function addFavorite(userId, recipeId) {
  try {
    const favoriteData = {
      recipeId,
      timestamp: new Date(),
    };
    
    const docRef = await addDoc(
      collection(db, "users", userId, "favorites"),
      favoriteData
    );
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
}

// Remove a recipe from user's favorites
export async function removeFavorite(userId, recipeId) {
  try {
    // First, find the favorite document
    const favoritesQuery = query(
      collection(db, "users", userId, "favorites"),
      where("recipeId", "==", recipeId)
    );
    
    const querySnapshot = await getDocs(favoritesQuery);
    
    if (!querySnapshot.empty) {
      const favoriteDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, "users", userId, "favorites", favoriteDoc.id));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
}

// Get all user's favorite recipe IDs
export async function getFavorites(userId) {
  try {
    const favoritesQuery = query(
      collection(db, "users", userId, "favorites"),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(favoritesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      recipeId: doc.data().recipeId,
      timestamp: doc.data().timestamp.toDate(),
    }));
  } catch (error) {
    console.error("Error getting favorites:", error);
    throw error;
  }
}

// Check if a recipe is favorited by the user
export async function isFavorite(userId, recipeId) {
  try {
    const favoritesQuery = query(
      collection(db, "users", userId, "favorites"),
      where("recipeId", "==", recipeId)
    );
    
    const querySnapshot = await getDocs(favoritesQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
}

// Toggle favorite status (add if not favorited, remove if favorited)
export async function toggleFavorite(userId, recipeId) {
  try {
    const isFavorited = await isFavorite(userId, recipeId);
    
    if (isFavorited) {
      await removeFavorite(userId, recipeId);
      return false; // Now unfavorited
    } else {
      await addFavorite(userId, recipeId);
      return true; // Now favorited
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}
