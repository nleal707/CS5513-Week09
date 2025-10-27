"use client";

// This components handles the recipe listings page
// It receives data from src/app/page.jsx, such as the initial recipes and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getRecipesSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const RecipeItem = ({ recipe }) => (
  <li key={recipe.id}>
    <Link href={`/recipe/${recipe.id}`}>
      <ActiveRecipe recipe={recipe} />
    </Link>
  </li>
);

const ActiveRecipe = ({ recipe }) => (
  <div>
    <ImageCover photo={recipe.photo} name={recipe.name} />
    <RecipeDetails recipe={recipe} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const RecipeDetails = ({ recipe }) => (
  <div className="recipe__details">
    <h2>{recipe.name}</h2>
    <RecipeRating recipe={recipe} />
    <RecipeMetadata recipe={recipe} />
  </div>
);

const RecipeRating = ({ recipe }) => (
  <div className="recipe__rating">
    <ul>{renderStars(recipe.avgRating)}</ul>
    <span>({recipe.numRatings})</span>
  </div>
);

const RecipeMetadata = ({ recipe }) => (
  <div className="recipe__meta">
    <span>🍳 {recipe.cuisineType}</span>
    <span>⏱️ {recipe.cookingTime}</span>
    <span>📊 {recipe.difficulty}</span>
  </div>
);

export default function RecipeListings({
  initialRecipes,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    cuisineType: searchParams.cuisineType || "",
    difficulty: searchParams.difficulty || "",
    cookingTime: searchParams.cookingTime || "",
    dietaryRestrictions: searchParams.dietaryRestrictions || "",
    sort: searchParams.sort || "",
  };

  const [recipes, setRecipes] = useState(initialRecipes);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getRecipesSnapshot((data) => {
      setRecipes(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="recipes">
        {recipes.map((recipe) => (
          <RecipeItem key={recipe.id} recipe={recipe} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
