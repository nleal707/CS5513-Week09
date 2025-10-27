"use client";

import Link from "next/link";

export default function FeaturedRecipe({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="featured-recipe">
      <div className="featured-recipe__header">
        <h2>🎉 Your AI-Generated Recipe!</h2>
        <p>Fresh from the kitchen</p>
      </div>
      
      <div className="featured-recipe__card">
        <Link href={`/recipe/${recipe.id}`}>
          <div className="featured-recipe__image">
            <img src={recipe.photo} alt={recipe.name} />
            {recipe.aiGenerated && (
              <span className="featured-recipe__badge">AI Generated</span>
            )}
          </div>
          
          <div className="featured-recipe__content">
            <h3>{recipe.name}</h3>
            <p className="featured-recipe__description">{recipe.description}</p>
            
            <div className="featured-recipe__meta">
              <span>🍳 {recipe.cuisineType}</span>
              <span>⏱️ {recipe.cookingTime}</span>
              <span>📊 {recipe.difficulty}</span>
            </div>
            
            <button className="featured-recipe__cta">View Full Recipe →</button>
          </div>
        </Link>
      </div>
    </div>
  );
}
