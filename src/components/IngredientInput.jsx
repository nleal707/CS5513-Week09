"use client";

import { useState } from "react";
import { randomData } from "@/src/lib/randomData.js";

export default function IngredientInput({ onGenerateRecipes, isLoading }) {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter ingredients based on input
  const filteredIngredients = randomData.ingredients.filter(ingredient =>
    ingredient.toLowerCase().includes(newIngredient.toLowerCase()) &&
    !ingredients.includes(ingredient)
  );

  const addIngredient = (ingredient) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
      setNewIngredient("");
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (ingredientToRemove) => {
    setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewIngredient(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredIngredients.length > 0) {
        addIngredient(filteredIngredients[0]);
      } else if (newIngredient.trim()) {
        addIngredient(newIngredient.trim());
      }
    }
  };

  const handleGenerateRecipes = () => {
    if (ingredients.length > 0) {
      onGenerateRecipes(ingredients);
    }
  };

  return (
    <div className="ingredient-input">
      <div className="ingredient-input__header">
        <h2>What ingredients do you have?</h2>
        <p>Add ingredients to get AI-powered recipe suggestions</p>
      </div>

      <div className="ingredient-input__form">
        <div className="ingredient-input__field">
          <input
            type="text"
            value={newIngredient}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type an ingredient..."
            className="ingredient-input__text"
          />
          <button
            type="button"
            onClick={() => addIngredient(newIngredient.trim())}
            disabled={!newIngredient.trim()}
            className="ingredient-input__add-btn"
          >
            Add
          </button>
        </div>

        {showSuggestions && filteredIngredients.length > 0 && (
          <div className="ingredient-input__suggestions">
            {filteredIngredients.slice(0, 5).map((ingredient, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addIngredient(ingredient)}
                className="ingredient-input__suggestion"
              >
                {ingredient}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ingredient-input__tags">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-tag">
            <span className="ingredient-tag__text">{ingredient}</span>
            <button
              type="button"
              onClick={() => removeIngredient(ingredient)}
              className="ingredient-tag__remove"
              aria-label={`Remove ${ingredient}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="ingredient-input__actions">
        <button
          type="button"
          onClick={handleGenerateRecipes}
          disabled={ingredients.length === 0 || isLoading}
          className="ingredient-input__generate-btn"
        >
          {isLoading ? "Generating Recipes..." : `Generate Recipes (${ingredients.length} ingredients)`}
        </button>
        
        {ingredients.length > 0 && (
          <button
            type="button"
            onClick={() => setIngredients([])}
            className="ingredient-input__clear-btn"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
