import Recipe from "@/src/components/Recipe.jsx";
import { Suspense } from "react";
import { getRecipeById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";

export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const recipe = await getRecipeById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__recipe">
      <Recipe
        id={params.id}
        initialRecipe={recipe}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary recipeId={params.id} />
        </Suspense>
      </Recipe>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={recipe.numRatings} />}
      >
        <ReviewsList recipeId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}
