// Image service for fetching recipe images from Unsplash API with fallback to stock images

// Fetch food image from Unsplash based on search term
export async function getRecipeImage(recipeName, cuisineType) {
  try {
    // Check if Unsplash API key is configured
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.log('Unsplash API key not configured, using fallback images');
      return getRandomRecipeImage(); // Fallback
    }

    // Clean recipe name for search - remove common words and focus on main ingredients
    const cleanRecipeName = recipeName
      .toLowerCase()
      .replace(/\b(classic|homemade|delicious|amazing|perfect|best|easy|quick|simple)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Create search term combining recipe name and cuisine type
    const searchTerm = `${cleanRecipeName} food ${cuisineType || ''}`.trim();
    
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerm)}&orientation=landscape&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return high-quality image URL
    return data.urls?.regular || data.urls?.small || getRandomRecipeImage();
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return getRandomRecipeImage(); // Fallback to stock images
  }
}

// Fallback to existing stock images (original function)
function getRandomRecipeImage() {
  const imageNumbers = Array.from({ length: 22 }, (_, i) => i + 1);
  const randomIndex = Math.floor(Math.random() * imageNumbers.length);
  return `https://storage.googleapis.com/firestorequickstarts.appspot.com/food_${imageNumbers[randomIndex]}.png`;
}

// Export the fallback function for direct use if needed
export { getRandomRecipeImage };
