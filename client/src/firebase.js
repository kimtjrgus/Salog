// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAKoQH_vIQATLEC2xDKd67aCWjx1GcHZA4",
	authDomain: "quill-image-store.firebaseapp.com",
	projectId: "quill-image-store",
	storageBucket: "quill-image-store.appspot.com",
	messagingSenderId: "450434413148",
	appId: "1:450434413148:web:a38241597325fe20192c99",
	measurementId: "G-SLW4W4CY9G",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage();
export default app;
