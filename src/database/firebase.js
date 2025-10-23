// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjAW13nzeMYYCSsjpLiZH9u4wGRSEsKNg",
  authDomain: "webdesign-project-a0cfc.firebaseapp.com",
  projectId: "webdesign-project-a0cfc",
  storageBucket: "webdesign-project-a0cfc.firebasestorage.app",
  messagingSenderId: "991886662273",
  appId: "1:991886662273:web:36c981543fd94ef2720b80",
  measurementId: "G-PVCPYXDRBQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const firebase_db = getFirestore(app); 
export const auth = getAuth(app);
