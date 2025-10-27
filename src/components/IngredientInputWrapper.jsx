"use client";

import { useState } from "react";
import IngredientInput from "@/src/components/IngredientInput.jsx";
import { handleRecipeGeneration } from "@/src/app/actions.js";

export default function IngredientInputWrapper() {
  const [isLoading, setIsLoading] = useState(false);

  const onGenerateRecipes = async (ingredients) => {
    setIsLoading(true);
    try {
      const result = await handleRecipeGeneration(ingredients);
      if (result.success) {
        // Refresh the page to show the new recipe
        window.location.reload();
      } else {
        alert(`Error generating recipe: ${result.error}`);
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Error generating recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return <IngredientInput onGenerateRecipes={onGenerateRecipes} isLoading={isLoading} />;
}
