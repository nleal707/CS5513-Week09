// Import function that generates sample (fake) recipe and review data
import { generateFakeRecipesAndReviews } from "@/src/lib/fakeRecipes.js";

// Import Firestore functions used for database operations
import {
  collection,       // References a Firestore collection
  onSnapshot,       // Sets up a real-time listener for a collection or query
  query,            // Builds a Firestore query object
  getDocs,          // Retrieves multiple documents from a query
  doc,              // References a specific Firestore document
  getDoc,           // Retrieves a single document by reference
  updateDoc,        // Updates fields of a document
  orderBy,          // Sorts query results by a field
  Timestamp,        // Firestore timestamp type
  runTransaction,   // Executes a series of reads/writes atomically
  where,            // Adds filters to queries
  addDoc,           // Adds a new document to a collection
  getFirestore,     // Returns a Firestore instance (usually from an app)
  limit,            // Limits the number of documents returned by a query
} from "firebase/firestore";

// Import the Firestore database instance configured for the client
import { db } from "@/src/lib/firebase/clientApp";

// Function to update a recipe's photo URL in the Firestore database
export async function updateRecipeImageReference(
  recipeId,      // The document ID of the recipe
  publicImageUrl     // The new public image URL to save
) {
  // Create a reference to the specific recipe document in the "recipes" collection
  const recipeRef = doc(collection(db, "recipes"), recipeId);

  // If the reference exists, update its "photo" field with the new image URL
  if (recipeRef) {
    await updateDoc(recipeRef, { photo: publicImageUrl });
  }
}

// Placeholder helper function to handle transaction updates with rating data (currently unused)
// new function from step 8
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
    //ADD NEW FIELD FOR USERID MAKING REVIEW TO USE AS SECURITY CHECK
    lastReviewUserId: review.userId,
  });

  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

// Placeholder function for adding a new review to a recipe (currently not implemented)
// new function from step 8
export async function addReviewToRecipe(db, recipeId, review) {
        if (!recipeId) {
                throw new Error("No recipe ID has been provided.");
        }

        if (!review) {
                throw new Error("A valid review has not been provided.");
        }

        try {
                const docRef = doc(collection(db, "recipes"), recipeId);
                const newRatingDocument = doc(
                        collection(db, `recipes/${recipeId}/ratings`)
                );

                // corrected line
                await runTransaction(db, (transaction) =>
                        updateWithRating(transaction, docRef, newRatingDocument, review)
                );
        } catch (error) {
                console.error(
                        "There was an error adding the rating to the recipe",
                        error
                );
                throw error;
        }
}

// Helper function to apply filtering and sorting options to a Firestore query
// new functions from step 7
function applyQueryFilters(q, { cuisineType, difficulty, cookingTime, dietaryRestrictions, sort }) {
  // If cuisine type filter is provided, add it to the query
  if (cuisineType) {
    q = query(q, where("cuisineType", "==", cuisineType));
  }
  // If difficulty filter is provided, add it to the query
  if (difficulty) {
    q = query(q, where("difficulty", "==", difficulty));
  }
  // If cooking time filter is provided, add it to the query
  if (cookingTime) {
    q = query(q, where("cookingTime", "==", cookingTime));
  }
  // If dietary restrictions filter is provided, add it to the query
  if (dietaryRestrictions) {
    q = query(q, where("dietaryRestrictions", "array-contains", dietaryRestrictions));
  }
  // If sort is "Rating" (or unspecified), sort by average rating descending
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  }
  // If sort is "Review", sort by number of ratings descending
  else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  // If sort is "Cooking Time", sort by cooking time ascending
  else if (sort === "Cooking Time") {
    q = query(q, orderBy("cookingTime", "asc"));
  }
  // Return the modified query
  return q;
}

// Fetch recipes from Firestore based on optional filters
export async function getRecipes(db = db, filters = {}) {
  // Create a query reference for the "recipes" collection
  let q = query(collection(db, "recipes"));

  // Apply cuisine type, difficulty, cooking time, dietary restrictions, and sort filters to the query
  q = applyQueryFilters(q, filters);

  // Execute the query and get the documents
  const results = await getDocs(q);

  // Map each document into a plain JS object
  return results.docs.map((doc) => {
    return {
      id: doc.id,                       // Include document ID
      ...doc.data(),                    // Spread document fields
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore Timestamp to JS Date
    };
  });
}

// Subscribe to real-time recipe updates using Firestore snapshots
// new function from step 7
export function getRecipesSnapshot(cb, filters = {}) {
  // Ensure the callback is a valid function
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Start with a query for all recipes
  let q = query(collection(db, "recipes"));

  // Apply filters to the query
  q = applyQueryFilters(q, filters);

  // Set up a snapshot listener to get updates whenever data changes
  return onSnapshot(q, (querySnapshot) => {
    // Convert snapshot documents into plain objects
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(), // Convert Firestore Timestamp to JS Date
      };
    });

    // Call the provided callback function with the results
    cb(results);
  });
}

// Fetch a single recipe document by its ID
export async function getRecipeById(db, recipeId) {
  // Validate that a recipe ID was provided
  if (!recipeId) {
    console.log("Error: Invalid ID received: ", recipeId);
    return;
  }

  // Get a reference to the recipe document
  const docRef = doc(db, "recipes", recipeId);

  // Retrieve the document snapshot from Firestore
  const docSnap = await getDoc(docRef);

  // Return its data as a plain object with converted timestamp
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Placeholder for a real-time listener for a single recipe (not yet implemented)
// this function is complete in the nextjs-end codebase,
// but is never introduced in the tutorial steps anywhere, 
// so it remains non-functional at the end of the tutorial
export function getRecipeSnapshotById(recipeId, cb) {
  if (!recipeId) {
    console.log("Error: Invalid ID received: ", recipeId);
    return;
  }

  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  const docRef = doc(db, "recipes", recipeId);
  return onSnapshot(docRef, (docSnap) => {
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}

// Fetch all reviews for a specific recipe
export async function getReviewsByRecipeId(db, recipeId) {
  // Validate recipe ID
  if (!recipeId) {
    console.log("Error: Invalid recipeId received: ", recipeId);
    return;
  }

  // Create a query for the "ratings" subcollection under the recipe
  const q = query(
    collection(db, "recipes", recipeId, "ratings"),
    orderBy("timestamp", "desc") // Sort reviews by most recent first
  );

  // Execute the query and fetch all reviews
  const results = await getDocs(q);

  // Map each review document into a plain object
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore Timestamp to JS Date
    };
  });
}

// Set up a real-time snapshot listener for reviews of a given recipe
export function getReviewsSnapshotByRecipeId(recipeId, cb) {
  // Validate recipe ID
  if (!recipeId) {
    console.log("Error: Invalid recipeId received: ", recipeId);
    return;
  }

  // Create a query for the recipe's "ratings" subcollection ordered by timestamp
  const q = query(
    collection(db, "recipes", recipeId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Set up a listener that triggers whenever review data changes
  return onSnapshot(q, (querySnapshot) => {
    // Convert Firestore docs into plain JS objects
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Invoke the callback with updated results
    cb(results);
  });
}

// Add a batch of fake recipes and their reviews to Firestore (for demo/testing)
export async function addFakeRecipesAndReviews() {
  // Generate fake recipe and review data
  const data = await generateFakeRecipesAndReviews();

  // Loop through each generated recipe and its related ratings
  for (const { recipeData, ratingsData } of data) {
    try {
      // Add a new recipe document to Firestore
      const docRef = await addDoc(
        collection(db, "recipes"),
        recipeData
      );

      // Add all associated review documents to its "ratings" subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "recipes", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // Handle any errors encountered during document creation
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}

// Add a recipe to Firestore (for AI-generated recipes)
export async function addRecipeToFirestore(recipeData) {
  try {
    const docRef = await addDoc(
      collection(db, "recipes"),
      recipeData
    );
    return docRef.id;
  } catch (e) {
    console.error("Error adding recipe: ", e);
    throw e;
  }
}

// Get the most recent AI-generated recipe
export async function getLatestAIRecipe(db) {
  const recipesRef = collection(db, 'recipes');
  const q = query(
    recipesRef,
    where('aiGenerated', '==', true),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}
