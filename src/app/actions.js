"use server";

import { addReviewToRestaurant } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

// This is a next.js server action, which is an alpha feature, so use with caution.
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
export async function handleReviewFormSubmission(data) {
        // const { app } = await getAuthenticatedAppForUser();
        // ETHAN NOTE: RETRIEVE currentUser FROM SERVER-SIDE FIREBASE AUTH FOR SECURITY
        const { app, currentUser } = await getAuthenticatedAppForUser();
        const db = getFirestore(app);

        // console.log( JSON.stringify( currentUser ) );

        await addReviewToRestaurant(db, data.get("restaurantId"), {
                text: data.get("text"),
                rating: data.get("rating"),

                // This came from a hidden form field.
                //userId: data.get("userId"),
                // ETHAN NOTE: INSTEAD OF LETTING USERID BE PASSED FROM CLIENT IN HIDDEN FORM
                // FIELD, USE THE SERVER-SIDE FIREBASE AUTH RESULT FOR currentUser.uid
                // THIS WILL BE MORE SECURE SINCE NOT RELYING ON CLIENT POSTED USERID
                userId: currentUser.uid,
        });
}