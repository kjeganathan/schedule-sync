const express = require("express");
let fs = require("fs");
const path = require("path");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const PORT = process.env.PORT || 8081;
const db = require("./database.js");
const { resolveSoa } = require("dns");

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
    res.redirect("/login");
  }
}

// ENDPOINT for sending the app to the login page on the main domain
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
});

// ENDPOINT for logging in user and adding user to database if they are not already in it
app.post("/login", async (req, res) => {
  const data = req.body;
  const results = await db.getUser(data.email);
  if (results.length === 0) {
    await db.addUser(data.full_name, data.email);
  } else {
    res.sendStatus(200);
  }
});

// ENDPOINT for adding a user to database
app.post("/register", async (req, res) => {
  const data = req.body;
  await db.addUser(data.full_name, data.email);
});

app.post("/deletePerson", async (req, res) => {
  const data = req.body;
  await db.delUser(data.email);
});

// ENDPOINT for logging out the user
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// ENDPOINT for scheduling a meeting
app.post("/schedule", async (req, res) => {
  //should be changed to updating the tentative meetings in users as well
  //adds a meeting to the meeting table
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
});

// ENDPOINT for getting the meeting information for a meeting with a specific id
app.get("/meetings/:id", async (req, res) => {
  res.send(JSON.stringify(await db.getMeeting(parseInt(req.params.id))));
});

// ENDPOINT for deleting a meeting with a specific id
app.delete("/meetings/:id", async (req, res) => {
  await db.delMeeting(req.params.id);
  res.sendStatus(200);
});

// ENDPOINT for getting the user's tentative meetings
app.get("/tentativemeetings/:email", async (req, res) => {
  //returns meeting id
  const email = req.params.email;
  const tentative = JSON.stringify(await db.getTentativeMeetings(email));
  let meetingId = JSON.parse(tentative)[0]["tentative_meetings"]["meeting_id"];
  res.send(JSON.stringify(await db.getMeeting(meetingId))); //gets the array of tentative meetings
});

// ENDPOINT for adding a meeting to user's tentative meetings
app.put("/tentativemeetings/:email", async (req, res) => {
  const data = req.body;
  //const meeting_id = 

});

// ENDPOINT for getting the user's upcoming meetings
app.post("/upcomingmeetings", async (req, res) => {
  const data = req.body;
  const upcoming = JSON.stringify(await db.getUpcomingMeetings(data.email));
  let meetingIds = JSON.parse(upcoming)[0]["meetings"];
  for (let i = 0; i < meetingIds.length; i++) {
    res.send(JSON.stringify(await db.getMeeting(meetingIds[i])));
  }
});

// ENDPOINT for user declining a meeting invite
app.post("/meetingdeclined", async (req, res) => {
  //called if tentative meeting is declined
  //deletes the meeting from the meetings table
  //get tentative meetings for a specific user
  const data = req.body;
  const tentative = JSON.stringify(await db.getTentativeMeetings(data.email));
  let meetingId = JSON.parse(tentative)[0]["tentative_meetings"]["meeting_id"]; //meeting id of declined tentative meeting
  await db.delMeeting(meetingId); //deletes the meeting from the meeting table
  await db.updateTentativeMeetings(
    { meeting_id: meetingId, isDecline: true },
    data.email
  );
});

// ENDPOINT for user accepting a meeting invite
app.post("/meetingaccepted", async (req, res) => {
  //meeting stays in the meetings table
  //get tentative meetings for a specific user
  const data = req.body;
  const tentative = JSON.stringify(await db.getTentativeMeetings(data.email));
  let meetingId = JSON.stringify(
    JSON.parse(tentative)[0]["tentative_meetings"]["meeting_id"]
  );
  await db.updateTentativeMeetings(
    { meeting_id: meetingId, isDecline: false },
    data.email
  );
  const upcoming = JSON.stringify(await db.getUpcomingMeetings(data.email));
  let upcomingmeetingIds = JSON.parse(upcoming)[0]["meetings"]; //gives the array of meetingids
  let arr = [];
  for (let i = 0; i < upcomingmeetingIds.length; i++) {
    arr.push(upcomingmeetingIds[i]); //pushes ids of all the upcoming meetings
  }
  arr.push(meetingId); //pushes id of tentative meeting turned upcoming
  await db.updateUpcomingMeetings(arr, data.email);
});

app.get("*", (req, res) => {
  res.send("Error");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
