<!-- 512fc21a-b873-4ecb-84b8-c9148b6ed18a 1021b8b9-9b3a-4632-8f50-a1ac905c04d3 -->
# Improve Recipe Image Diversity

## Current Situation

The project currently uses only **22 stock images** from a Firebase storage bucket that are randomly assigned to recipes:

```javascript
// src/lib/ai/recipeGenerator.js (line 134-138)
function getRandomRecipeImage() {
  const imageNumbers = Array.from({ length: 22 }, (_, i) => i + 1);
  const randomIndex = Math.floor(Math.random() * imageNumbers.length);
  return `https://storage.googleapis.com/firestorequickstarts.appspot.com/food_${imageNumbers[randomIndex]}.png`;
}
```

The same pattern is used in:

- `src/lib/fakeRecipes.js` (line 105-108)
- `src/lib/fakeRestaurants.js` (similar pattern)

With only 22 images, repetition is very noticeable, especially as more recipes are generated.

## Solution Options

### Option 1: Integrate Unsplash API (Recommended)

Use the free Unsplash API to fetch real, high-quality food photos dynamically based on recipe attributes.

**Benefits:**

- Unlimited unique images
- High-quality professional photos
- Searchable by keywords (e.g., "pasta carbonara", "chicken tikka")
- Free tier allows 50 requests/hour (5,000/month)
- Better user experience with relevant images

**Implementation:**

1. Sign up for Unsplash API key (free)
2. Create helper function to fetch images by recipe name or cuisine type
3. Update `getRandomRecipeImage()` to call Unsplash APIntire ro
4. Add fallback to stock images if API fails or rate limit reached
5. Optionally cache image URLs in Firestore to reduce API calls

### Option 2: Expand Seed Image Library

Manually add 100-200 food images to the Firebase storage bucket.

**Benefits:**

- No external API dependencies
- No rate limits
- Works offline
- Predictable behavior

**Drawbacks:**

- Still limited variety (just less noticeable)
- Manual work to source and upload images
- Storage costs (minimal but present)
- Still eventual repetition with many recipes

## Recommended Implementation: Unsplash API Integration

### 1. Create Image Service Module

Create `src/lib/imageService.js`:

```javascript
// Fetch food image from Unsplash based on search term
export async function getRecipeImage(recipeName, cuisineType) {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return getRandomRecipeImage(); // Fallback
    }

    // Clean recipe name for search
    const searchTerm = `${recipeName} food ${cuisineType}`.toLowerCase();
    
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerm)}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    return data.urls.regular; // Returns high-quality image URL
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return getRandomRecipeImage(); // Fallback to stock images
  }
}

// Fallback to existing stock images
function getRandomRecipeImage() {
  const imageNumbers = Array.from({ length: 22 }, (_, i) => i + 1);
  const randomIndex = Math.floor(Math.random() * imageNumbers.length);
  return `https://storage.googleapis.com/firestorequickstarts.appspot.com/food_${imageNumbers[randomIndex]}.png`;
}
```

### 2. Update Recipe Generator

Modify `src/lib/ai/recipeGenerator.js`:

```javascript
import { getRecipeImage } from '@/src/lib/imageService';

export async function generateRecipe(ingredients, filters = {}) {
  try {
    // ... existing code ...
    
    const recipe = {
      name: recipeData.name,
      description: recipeData.description || `A delicious ${recipeData.cuisineType || 'homemade'} recipe`,
      // ... other fields ...
      photo: await getRecipeImage(recipeData.name, recipeData.cuisineType), // NEW
    };
    
    return recipe;
  } catch (error) {
    // ... error handling ...
  }
}
```

### 3. Update Fake Recipe Generator

Modify `src/lib/fakeRecipes.js`:

```javascript
import { getRecipeImage } from '@/src/lib/imageService';

export async function generateFakeRecipesAndReviews() {
  // ... existing code ...
  
  const recipeData = {
    name: recipeName,
    // ... other fields ...
    photo: await getRecipeImage(recipeName, cuisineType), // NEW
  };
}
```

### 4. Environment Configuration

Add to environment variables (Firebase App Hosting):

```bash
firebase apphosting:secrets:set UNSPLASH_ACCESS_KEY
```

### 5. Rate Limiting & Caching Considerations

- Unsplash free tier: 50 requests/hour
- For high-volume apps, consider caching image URLs in Firestore
- Could store `imageUrl` with recipe data on first generation
- User-uploaded images bypass this entirely

## Alternative: Hybrid Approach

Combine both solutions:

1. Use Unsplash for AI-generated recipes (new, unique content)
2. Expand seed images to 50-100 for fake/seed data
3. Allow user uploads for personalization

This provides the best of both worlds with fallback options.

## Files to Modify

1. **Create:** `src/lib/imageService.js` - New image fetching service
2. **Update:** `src/lib/ai/recipeGenerator.js` - Use new image service
3. **Update:** `src/lib/fakeRecipes.js` - Use new image service  
4. **Update:** `src/lib/fakeRestaurants.js` - Use new image service (if exists)
5. **Configure:** Environment variables for Unsplash API key

## Testing Plan

1. Test with Unsplash API key configured
2. Test fallback behavior without API key
3. Test with network failures (should use fallback)
4. Verify image quality and relevance
5. Monitor API rate limits during usage

## Implementation Approved

User confirmed: Implement Option 1 with fallback mechanism. API key will be added later via `firebase apphosting:secrets:set UNSPLASH_ACCESS_KEY`.