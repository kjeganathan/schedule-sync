import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

// Firebase project configuration
var firebaseConfig = {
  apiKey: "AIzaSyA_dnFhAlsnKF_C6h49PHKq4bTnfHjjbBQ",
  authDomain: "schedule-sync-331716.firebaseapp.com",
  databaseURL: "https://schedule-sync-331716-default-rtdb.firebaseio.com",
  projectId: "schedule-sync-331716",
  storageBucket: "schedule-sync-331716.appspot.com",
  messagingSenderId: "500421331480",
  appId: "1:500421331480:web:412bb0fcbdb3b0ec1c916d",
  measurementId: "G-S8GX1HVD1T",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();
