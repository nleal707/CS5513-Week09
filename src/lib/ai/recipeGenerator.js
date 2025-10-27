import { generateObject } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Define the schema for recipe generation
const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe'),
  description: z.string().describe('A brief description of the recipe'),
  ingredients: z.array(z.string()).describe('List of ingredients needed'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions'),
  cuisineType: z.string().describe('The cuisine type (e.g., Italian, Chinese, American)'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('Difficulty level'),
  cookingTime: z.enum(['< 15 min', '15-30 min', '30-60 min', '60+ min']).describe('Estimated cooking time'),
  dietaryRestrictions: z.array(z.string()).describe('Dietary restrictions this recipe accommodates'),
  servings: z.number().describe('Number of servings'),
  prepTime: z.string().describe('Estimated prep time'),
  calories: z.number().optional().describe('Estimated calories per serving'),
});

// Create the recipe generation flow
export const generateRecipeFromIngredients = generateObject({
  model: googleAI('gemini-1.5-flash'),
  schema: RecipeSchema,
  config: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

// Main function to generate a recipe based on available ingredients
export async function generateRecipe(ingredients, filters = {}) {
  try {
    // Create a prompt based on available ingredients and filters
    const prompt = createRecipePrompt(ingredients, filters);
    
    // Generate the recipe using Genkit
    const result = await generateRecipeFromIngredients(prompt);
    
    if (result && result.object) {
      // Add additional metadata
      const recipe = {
        ...result.object,
        aiGenerated: true,
        timestamp: new Date(),
        avgRating: 0,
        numRatings: 0,
        sumRating: 0,
        photo: getRandomRecipeImage(),
      };
      
      return recipe;
    } else {
      throw new Error('Failed to generate recipe');
    }
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw new Error('Failed to generate recipe. Please try again.');
  }
}

// Helper function to create a comprehensive prompt
function createRecipePrompt(ingredients, filters) {
  let prompt = `Create a delicious recipe using these available ingredients: ${ingredients.join(', ')}.\n\n`;
  
  // Add filter constraints
  if (filters.cuisineType) {
    prompt += `Make it a ${filters.cuisineType} style recipe.\n`;
  }
  
  if (filters.difficulty) {
    prompt += `Make it ${filters.difficulty.toLowerCase()} difficulty.\n`;
  }
  
  if (filters.cookingTime) {
    prompt += `The cooking time should be ${filters.cookingTime}.\n`;
  }
  
  if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
    prompt += `The recipe should be suitable for: ${filters.dietaryRestrictions.join(', ')}.\n`;
  }
  
  prompt += `\nPlease create a complete recipe with:
- A creative and appetizing name
- A brief description of the dish
- Complete list of ingredients (you may suggest additional common ingredients if needed)
- Clear, step-by-step cooking instructions
- Appropriate cuisine type, difficulty level, and cooking time
- Any dietary restrictions it accommodates
- Number of servings and prep time
- Optional calorie estimate per serving

Make sure the recipe is practical, delicious, and uses the provided ingredients as the main components.`;

  return prompt;
}

// Helper function to get a random recipe image
function getRandomRecipeImage() {
  const imageNumbers = Array.from({ length: 22 }, (_, i) => i + 1);
  const randomIndex = Math.floor(Math.random() * imageNumbers.length);
  return `https://storage.googleapis.com/firestorequickstarts.appspot.com/food_${imageNumbers[randomIndex]}.png`;
}

// Function to generate multiple recipe suggestions
export async function generateMultipleRecipes(ingredients, filters = {}, count = 3) {
  const recipes = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const recipe = await generateRecipe(ingredients, filters);
      recipes.push(recipe);
    } catch (error) {
      console.error(`Error generating recipe ${i + 1}:`, error);
      // Continue with other recipes even if one fails
    }
  }
  
  return recipes;
}
