// This component shows recipe metadata, and offers some actions to the user like uploading a new recipe image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const RecipeDetails = ({
  recipe,
  userId,
  handleRecipeImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <>
      <section className="recipe-image-section">
        <img src={recipe.photo} alt={recipe.name} />
        <div className="image-actions">
          <label
            onChange={(event) => handleRecipeImage(event.target)}
            htmlFor="upload-image"
            className="add"
          >
            <input
              name=""
              type="file"
              id="upload-image"
              className="file-input hidden w-full h-full"
            />

            <img className="add-image" src="/add.svg" alt="Add image" />
          </label>
        </div>
      </section>
      
      <section className="recipe-details-section">
        <div className="details">
          <h2>{recipe.name}</h2>

          <div className="recipe__rating">
            <ul>{renderStars(recipe.avgRating)}</ul>

            <span>({recipe.numRatings})</span>
          </div>

          <div className="recipe__meta">
            <span>🍳 {recipe.cuisineType}</span>
            <span>⏱️ {recipe.cookingTime}</span>
            <span>📊 {recipe.difficulty}</span>
          </div>
          <p>{recipe.dietaryRestrictions?.join(", ") || "No restrictions"}</p>
          
          {recipe.description && (
            <p className="recipe__description">{recipe.description}</p>
          )}
          
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="recipe__ingredients">
              <h3>Ingredients:</h3>
              <ul>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
          
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="recipe__instructions">
              <h3>Instructions:</h3>
              <ol>
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}
          
          {children}
        </div>
      </section>
      
      <section className="reviews-section">
        <div className="reviews-actions">
          {userId && (
            <img
              alt="review"
              className="review"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              src="/review.svg"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default RecipeDetails;
