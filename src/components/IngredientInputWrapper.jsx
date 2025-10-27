"use client";

import { useState } from "react";
import IngredientInput from "@/src/components/IngredientInput.jsx";
import LoadingScreen from "@/src/components/LoadingScreen.jsx";
import { handleRecipeGeneration } from "@/src/app/actions.js";
import { useUser } from "@/src/lib/getUser";

export default function IngredientInputWrapper({ initialUserId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const userId = useUser()?.uid || initialUserId;

  const onGenerateRecipes = async (ingredients) => {
    if (!userId) {
      alert("You must be logged in to generate recipes.");
      return;
    }
    
    setIsLoading(true);
    setIsFadingOut(false);
    try {
      const result = await handleRecipeGeneration(ingredients);
      if (result.success) {
        // Add fade-out animation before reloading
        setIsFadingOut(true);
        setTimeout(() => {
          window.location.reload();
        }, 500); // Wait for fade-out animation to complete
      } else {
        alert(`Error generating recipe: ${result.error}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Error generating recipe. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen 
          message="Generating your recipe..." 
          className={isFadingOut ? "fade-out" : ""}
        />
      )}
      <IngredientInput 
        onGenerateRecipes={onGenerateRecipes} 
        isLoading={isLoading}
        userId={userId}
      />
    </>
  );
}
