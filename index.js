const express = require("express");
let fs = require('fs');
const path = require("path");
const router = express.Router();
const passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy;   
const PORT = process.env.PORT || 8081;
const db = require("./database.js");

// environment variables
require("dotenv").config();

const app = express();

// App configuration
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", router);

function checkLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
// If we are authenticated, run the next route.
next();
  } else {
// Otherwise, redirect to the login page.
res.redirect('/login');
  }
}

// ENDPOINT for sending the app to the login page on the main domain
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
});

app.post("/login", async (req, res) => {
  const data = req.body;
  const results = await db.getUser(data.email);
  if (results.length === 0) {
    await db.addUser(data.first_name, data.last_name, data.email);
  } else {
    res.sendStatus(200);
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.post("/schedule-meeting", async (req, res) => {
  const data = req.body;
  await db.addMeeting(
    data.title,
    data.date,
    data.start_time,
    data.end_time,
    data.location,
    data.description,
    data.attendees
  );
  res.sendStatus(200);
});

app.get("/meetings", checkLoggedIn, async (req, res) => {
  res.send(JSON.stringify(await db.getMeetings(req.email)));
});

app.delete("/meetings/:title", checkLoggedIn, async (req, res) => {
  await db.delMeeting(req.params.title, req.email);
  res.sendStatus(200);
});

app.get("*", (req, res) => {
  res.send("Error");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
