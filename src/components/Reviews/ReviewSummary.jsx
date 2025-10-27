import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { getReviewsByRecipeId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

export async function GeminiSummary({ recipeId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByRecipeId(
    getFirestore(firebaseServerApp),
    recipeId
  );

  // Check if there are no reviews
  if (!reviews || reviews.length === 0) {
    return (
      <div className="recipe__review_summary">
        <p>No reviews yet. Be the first to review this recipe!</p>
      </div>
    );
  }

  const reviewSeparator = "@";
  const prompt = `
    Based on the following recipe reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the recipe. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance.
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // set default model
    });
    const { text } = await ai.generate(prompt);

    return (
      <div className="recipe__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Error summarizing reviews.</p>;
  }
}

export function GeminiSummarySkeleton() {
  return (
    <div className="recipe__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
