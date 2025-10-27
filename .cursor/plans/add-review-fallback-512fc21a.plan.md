<!-- 512fc21a-b873-4ecb-84b8-c9148b6ed18a 79d6e901-44e9-47d6-8aeb-cc1fa90cad37 -->
# Restrict Recipe Generator to Authenticated Users

## Overview

Currently, unauthenticated users can access the ingredient input form and attempt to generate recipes, which results in an error "User must be authenticated to generate recipes". We need to hide the form from unauthenticated users and display a message encouraging them to log in.

## Changes Required

### 1. Update `src/app/page.js` (Server Component)

Pass the current user information to `IngredientInputWrapper`:

```javascript
export default async function Home(props) {
  const searchParams = await props.searchParams;
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();
  const db = getFirestore(firebaseServerApp);
  const recipes = await getRecipes(db, searchParams);
  const latestAIRecipe = await getLatestAIRecipe(db);
  
  return (
    <main className="main__home">
      <IngredientInputWrapper initialUserId={currentUser?.uid || ""} />
      {latestAIRecipe && <FeaturedRecipe recipe={latestAIRecipe} />}
      <RecipeListings
        initialRecipes={recipes}
        searchParams={searchParams}
      />
    </main>
  );
}
```

### 2. Update `src/components/IngredientInputWrapper.jsx`

Add user authentication check and pass userId to IngredientInput:

```javascript
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
        setIsFadingOut(true);
        setTimeout(() => {
          window.location.reload();
        }, 500);
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
```

### 3. Update `src/components/IngredientInput.jsx`

Add conditional rendering to show login prompt when user is not authenticated:

```javascript
export default function IngredientInput({ onGenerateRecipes, isLoading, userId }) {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ... existing functions ...

  // If user is not authenticated, show login prompt
  if (!userId) {
    return (
      <div className="ingredient-input">
        <div className="ingredient-input__header">
          <h2>AI-Powered Recipe Generator</h2>
          <p>Sign in to generate personalized recipes based on your available ingredients</p>
        </div>
        <div className="ingredient-input__login-prompt">
          <p>🔒 Please log in to use the recipe generator</p>
          <p>Click "Sign In" in the top right corner to get started</p>
        </div>
      </div>
    );
  }

  // Existing component JSX for authenticated users
  return (
    <div className="ingredient-input">
      {/* ... existing form ... */}
    </div>
  );
}
```

### 4. Add CSS for Login Prompt (Optional)

Add styling for the login prompt in `src/app/styles.css`:

```css
.ingredient-input__login-prompt {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.ingredient-input__login-prompt p {
  margin: 0.5rem 0;
  color: #666;
}

.ingredient-input__login-prompt p:first-child {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}
```

## Implementation Pattern

This follows the same authentication pattern used for:

- Reviews (ReviewDialog only shown to authenticated users)
- Photo uploads (upload button only shown to authenticated users)
- Favorites (handled server-side with authentication check)

## Security Notes

- Server-side validation already exists in `handleRecipeGeneration` (checks `currentUser`)
- These changes add UI/UX improvements to prevent error messages
- Users get clear guidance to log in rather than encountering errors