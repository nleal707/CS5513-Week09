"use client";

// This components shows one individual recipe
// It receives data from src/app/recipe/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getRecipeSnapshotById } from "@/src/lib/firebase/firestore.js";
import { useUser } from "@/src/lib/getUser";
import RecipeDetails from "@/src/components/RecipeDetails.jsx";
import { updateRecipeImage } from "@/src/lib/firebase/storage.js";

const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

export default function Recipe({
  id,
  initialRecipe,
  initialUserId,
  children,
}) {
  const [recipeDetails, setRecipeDetails] = useState(initialRecipe);
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  async function handleRecipeImage(target) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateRecipeImage(id, image);
    setRecipeDetails({ ...recipeDetails, photo: imageURL });
  }

  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  useEffect(() => {
    return getRecipeSnapshotById(id, (data) => {
      setRecipeDetails(data);
    });
  }, [id]);

  return (
    <>
      <RecipeDetails
        recipe={recipeDetails}
        userId={userId}
        handleRecipeImage={handleRecipeImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </RecipeDetails>
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
