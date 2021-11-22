import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

window.addEventListener("load", function () {
  // Login user
  const login = this.document.getElementById("login");
  if (login != null) {
    login.addEventListener("click", googleLogin);
  }
  // Logout user
  const logout = this.document.getElementById("logout");
  if (logout != null) {
    logout.addEventListener("click", googleLogout);
  }
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
      // The signed-in user info.
      const user = result.user;
      // Add the user id to local storage for access accross the website
      localStorage.setItem("email", JSON.stringify(user.email));
      localStorage.setItem("username", JSON.stringify(user.displayName));
      // Open the home page in the same window
      open("/src/html/calendar.html", "_self");
      // ...
    })
    .catch((error) => {
      // Log the error
      console.log(error.message);
    });
}

function googleLogout() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      // Remove the user id to local storage for access accross the website
      localStorage.removeItem("user");
      // Open the login page in the same window
      open("login.html", "_self");
    })
    .catch((error) => {
      // An error happened.
      console.log(error);
    });
}
