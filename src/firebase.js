import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
