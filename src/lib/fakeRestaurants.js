import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";
import { getRecipeImage } from "@/src/lib/imageService";

import { Timestamp } from "firebase/firestore";

export async function generateFakeRecipesAndReviews() {
  const recipesToAdd = 5;
  const data = [];

  for (let i = 0; i < recipesToAdd; i++) {
    const recipeTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this recipe
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(recipeTimestamp.toDate())
      );

      const ratingData = {
        rating:
          randomData.recipeReviews[
            randomNumberBetween(0, randomData.recipeReviews.length - 1)
          ].rating,
        text: randomData.recipeReviews[
          randomNumberBetween(0, randomData.recipeReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    // Generate random ingredients for this recipe
    const numIngredients = randomNumberBetween(3, 8);
    const ingredients = [];
    for (let k = 0; k < numIngredients; k++) {
      const ingredient = randomData.ingredients[
        randomNumberBetween(0, randomData.ingredients.length - 1)
      ];
      if (!ingredients.includes(ingredient)) {
        ingredients.push(ingredient);
      }
    }

    // Generate random dietary restrictions
    const numDietaryRestrictions = randomNumberBetween(0, 3);
    const dietaryRestrictions = [];
    for (let l = 0; l < numDietaryRestrictions; l++) {
      const restriction = randomData.dietaryRestrictions[
        randomNumberBetween(0, randomData.dietaryRestrictions.length - 1)
      ];
      if (!dietaryRestrictions.includes(restriction)) {
        dietaryRestrictions.push(restriction);
      }
    }

    // Generate simple instructions
    const instructions = [
      "Prepare all ingredients as needed.",
      "Heat a large pan over medium heat.",
      "Add the main ingredients and cook until done.",
      "Season to taste and serve hot.",
      "Enjoy your delicious meal!"
    ];

    const recipeData = {
      name: randomData.recipeNames[
        randomNumberBetween(0, randomData.recipeNames.length - 1)
      ],
      description: `A delicious ${randomData.cuisineTypes[
        randomNumberBetween(0, randomData.cuisineTypes.length - 1)
      ].toLowerCase()} recipe that's perfect for any occasion.`,
      ingredients: ingredients,
      instructions: instructions,
      cuisineType: randomData.cuisineTypes[
        randomNumberBetween(0, randomData.cuisineTypes.length - 1)
      ],
      difficulty: randomData.difficultyLevels[
        randomNumberBetween(0, randomData.difficultyLevels.length - 1)
      ],
      cookingTime: randomData.cookingTimes[
        randomNumberBetween(0, randomData.cookingTimes.length - 1)
      ],
      dietaryRestrictions: dietaryRestrictions,
      avgRating,
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      photo: await getRecipeImage(
        randomData.recipeNames[randomNumberBetween(0, randomData.recipeNames.length - 1)],
        randomData.cuisineTypes[randomNumberBetween(0, randomData.cuisineTypes.length - 1)]
      ),
      timestamp: recipeTimestamp,
      aiGenerated: false,
    };

    data.push({
      recipeData,
      ratingsData,
    });
  }
  return data;
}
