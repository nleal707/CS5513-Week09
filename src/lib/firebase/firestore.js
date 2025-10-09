// Import function that generates sample (fake) restaurant and review data
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

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
} from "firebase/firestore";

// Import the Firestore database instance configured for the client
import { db } from "@/src/lib/firebase/clientApp";

// Function to update a restaurant’s photo URL in the Firestore database
export async function updateRestaurantImageReference(
  restaurantId,      // The document ID of the restaurant
  publicImageUrl     // The new public image URL to save
) {
  // Create a reference to the specific restaurant document in the "restaurants" collection
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);

  // If the reference exists, update its "photo" field with the new image URL
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Placeholder helper function to handle transaction updates with rating data (currently unused)
const updateWithRating = async (
  transaction,         // The Firestore transaction object
  docRef,              // Reference to the restaurant document
  newRatingDocument,   // The new rating document being added
  review               // Review data object
) => {
  return; // No functionality yet
};

// Placeholder function for adding a new review to a restaurant (currently not implemented)
export async function addReviewToRestaurant(db, restaurantId, review) {
  return; // No functionality yet
}

// Helper function to apply filtering and sorting options to a Firestore query
function applyQueryFilters(q, { category, city, price, sort }) {
  // If category filter is provided, add it to the query
  if (category) {
    q = query(q, where("category", "==", category));
  }
  // If city filter is provided, add it to the query
  if (city) {
    q = query(q, where("city", "==", city));
  }
  // If price filter is provided, match restaurants with equal price level
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  // If sort is "Rating" (or unspecified), sort by average rating descending
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  }
  // If sort is "Review", sort by number of ratings descending
  else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the modified query
  return q;
}

// Fetch restaurants from Firestore based on optional filters
export async function getRestaurants(db = db, filters = {}) {
  // Create a query reference for the "restaurants" collection
  let q = query(collection(db, "restaurants"));

  // Apply category, city, price, and sort filters to the query
  q = applyQueryFilters(q, filters);

  // Execute the query and get the documents
  const results = await getDocs(q);

  // Map each document into a plain JS object
  return results.docs.map((doc) => {
    return {
      id: doc.id,                       // Include document ID
      ...doc.data(),                    // Spread document fields
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore Timestamp to JS Date
    };
  });
}

// Subscribe to real-time restaurant updates using Firestore snapshots
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Ensure the callback is a valid function
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Start with a query for all restaurants
  let q = query(collection(db, "restaurants"));

  // Apply filters to the query
  q = applyQueryFilters(q, filters);

  // Set up a snapshot listener to get updates whenever data changes
  return onSnapshot(q, (querySnapshot) => {
    // Convert snapshot documents into plain objects
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(), // Convert Firestore Timestamp to JS Date
      };
    });

    // Call the provided callback function with the results
    cb(results);
  });
}

// Fetch a single restaurant document by its ID
export async function getRestaurantById(db, restaurantId) {
  // Validate that a restaurant ID was provided
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }

  // Get a reference to the restaurant document
  const docRef = doc(db, "restaurants", restaurantId);

  // Retrieve the document snapshot from Firestore
  const docSnap = await getDoc(docRef);

  // Return its data as a plain object with converted timestamp
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Placeholder for a real-time listener for a single restaurant (not yet implemented)
export function getRestaurantSnapshotById(restaurantId, cb) {
  return; // No functionality yet
}

// Fetch all reviews for a specific restaurant
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Validate restaurant ID
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create a query for the "ratings" subcollection under the restaurant
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc") // Sort reviews by most recent first
  );

  // Execute the query and fetch all reviews
  const results = await getDocs(q);

  // Map each review document into a plain object
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore Timestamp to JS Date
    };
  });
}

// Set up a real-time snapshot listener for reviews of a given restaurant
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Validate restaurant ID
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create a query for the restaurant's "ratings" subcollection ordered by timestamp
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Set up a listener that triggers whenever review data changes
  return onSnapshot(q, (querySnapshot) => {
    // Convert Firestore docs into plain JS objects
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Invoke the callback with updated results
    cb(results);
  });
}

// Add a batch of fake restaurants and their reviews to Firestore (for demo/testing)
export async function addFakeRestaurantsAndReviews() {
  // Generate fake restaurant and review data
  const data = await generateFakeRestaurantsAndReviews();

  // Loop through each generated restaurant and its related ratings
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add a new restaurant document to Firestore
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add all associated review documents to its "ratings" subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
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
