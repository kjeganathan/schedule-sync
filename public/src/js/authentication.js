import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

$(document).ready(function () {
  // Login user
  $("#login").click(googleLogin);
  // Logout user
  $("#logout").click(googleLogout);
});

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

initializeApp(firebaseConfig);
const auth = getAuth();
let provider = new GoogleAuthProvider();

function googleLogin() {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // Add the customer id to local storage for access accross the website
      localStorage.setItem("user", JSON.stringify(user));
      // Open the home page in the same window
      open("/src/html/calendar.html", "_self");
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(errorCode);
      // ...
    });
}

function googleLogout() {
  signOut()
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });
}
