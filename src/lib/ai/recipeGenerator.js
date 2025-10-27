import { googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { Timestamp, addDoc, collection, getFirestore } from "firebase/firestore";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getRecipeImage } from "@/src/lib/imageService";

// Main function to generate a recipe based on available ingredients
export async function generateRecipe(ingredients, filters = {}) {
  try {
    // Check for required environment variable
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance
    const ai = genkit({
      plugins: [googleAI()],
      model: googleAI.model('gemini-2.5-flash'), // stable production model
    });

    // Create a prompt based on available ingredients and filters
    const prompt = createRecipePrompt(ingredients, filters);
    
    // Generate the recipe using Genkit
    const { text } = await ai.generate(prompt);
    
    // Parse the JSON response
    let recipeData;
    try {
      const cleanedText = cleanJsonResponse(text);
      recipeData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', text);
      console.error('Cleaned response:', cleanJsonResponse(text));
      console.error('First 200 chars of cleaned response:', cleanJsonResponse(text).substring(0, 200));
      throw new Error('Failed to parse recipe data from AI response');
    }
    
    // Validate required fields
    if (!recipeData.name || !recipeData.ingredients || !recipeData.instructions) {
      throw new Error('AI response missing required recipe fields');
    }
    
    // Add additional metadata
    const recipe = {
      name: recipeData.name,
      description: recipeData.description || `A delicious ${recipeData.cuisineType || 'homemade'} recipe`,
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [recipeData.ingredients],
      instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [recipeData.instructions],
      cuisineType: recipeData.cuisineType || 'International',
      difficulty: recipeData.difficulty || 'Medium',
      cookingTime: recipeData.cookingTime || '30-60 min',
      dietaryRestrictions: Array.isArray(recipeData.dietaryRestrictions) ? recipeData.dietaryRestrictions : [],
      servings: recipeData.servings || 4,
      prepTime: recipeData.prepTime || '15 min',
      calories: recipeData.calories || null,
      aiGenerated: true,
      timestamp: Timestamp.fromDate(new Date()),
      avgRating: 0,
      numRatings: 0,
      sumRating: 0,
      photo: await getRecipeImage(recipeData.name, recipeData.cuisineType),
    };
    
    return recipe;
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw new Error('Failed to generate recipe. Please try again.');
  }
}

// Helper function to clean JSON response from markdown code blocks and fix common issues
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  
  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  // Remove any text before the first {
  const jsonStart = cleaned.indexOf('{');
  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }
  
  // Remove any text after the last }
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonEnd > 0 && jsonEnd < cleaned.length - 1) {
    cleaned = cleaned.substring(0, jsonEnd + 1);
  }
  
  // Fix common JSON issues
  cleaned = cleaned
    .replace(/,\s*}/g, '}')  // Remove trailing commas before }
    .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
    .replace(/(\w+):/g, '"$1":')  // Add quotes around unquoted keys
    .replace(/:\s*([^",{\[\]]+)([,}])/g, ': "$1"$2');  // Add quotes around unquoted string values
  
  return cleaned.trim();
}
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
  
  prompt += `\nPlease create a complete recipe and return it as a valid JSON object with the following structure:
{
  "name": "Recipe Name",
  "description": "Brief description of the dish",
  "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "cuisineType": "Italian/Chinese/American/etc",
  "difficulty": "Easy/Medium/Hard",
  "cookingTime": "< 15 min/15-30 min/30-60 min/60+ min",
  "dietaryRestrictions": ["Vegetarian", "Vegan", "Gluten-Free", etc],
  "servings": 4,
  "prepTime": "15 min",
  "calories": 300
}

  prompt += `\nIMPORTANT: Return ONLY a valid JSON object. Do not include any markdown formatting, explanations, or additional text. The response must start with { and end with }.

Example format:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["Step 1", "Step 2"],
  "cuisineType": "Italian",
  "difficulty": "Easy",
  "cookingTime": "30-60 min",
  "dietaryRestrictions": ["Vegetarian"],
  "servings": 4,
  "prepTime": "15 min",
  "calories": 300
}

Make sure the recipe is practical, delicious, and uses the provided ingredients as the main components. Return ONLY the JSON object, no additional text.`;

  return prompt;
}

// Helper function to get a random recipe image (kept for backward compatibility)
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

// Function to save AI-generated recipe to Firestore
export async function addRecipeToFirestore(recipe) {
  try {
    const { firebaseServerApp } = await getAuthenticatedAppForUser();
    const db = getFirestore(firebaseServerApp);

    const recipeData = {
      ...recipe,
      // Ensure all required fields are present
      avgRating: recipe.avgRating || 0,
      numRatings: recipe.numRatings || 0,
      sumRating: recipe.sumRating || 0,
    };

    const docRef = await addDoc(collection(db, "recipes"), recipeData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding AI generated recipe to Firestore: ", e);
    throw e;
  }
}
