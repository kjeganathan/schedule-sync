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

app.post("/login", async (req, res) => {
  const data = req.body;
  const results = await db.getUser(data.email);
  if (results.length === 0) {
    await db.addUser(data.full_name, data.email);
  } else {
    res.sendStatus(200);
  }
});

app.post("/addPerson", async(req,res) => {
  const data = req.body;
  await db.addUserTest(data.full_name, data.email, data.meetings, data.tentative_meetings);
});

app.post("/deletePerson", async(req,res) => {
  const data = req.body;
  await db.delUser(data.email);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

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

app.get("/meetings", async (req, res) => {
  const data = req.body;
  res.send(JSON.stringify(await db.getMeetings(req.email)));
});

app.post('/tentativemeetings', async (req, res) => { //returns meeting id
   const data = req.body;
   const tentative = JSON.stringify(await db.getTentativeMeetings(data.email));
  let meetingId = JSON.parse(tentative)[0]["tentative_meetings"]["meeting_id"];
  res.send(JSON.stringify(await db.getMeetings(meetingId))); //gets the array of tentative meetings
})

app.post('/upcomingmeetings', async (req, res) => {
  const data = req.body;
  const upcoming = JSON.stringify(await db.getUpcomingMeetings(data.email));
  let meetingIds = JSON.parse(upcoming)[0]["meetings"]; 
  for(let i = 0; i<meetingIds.length;i++){ 
    res.send(JSON.stringify(await db.getMeetings(meetingIds[i])));
  }
})

app.post('/meetingdeclined', async (req, res) => { //called if tentative meeting is declined
  //deletes the meeting from the meetings table
  //get tentative meetings for a specific user
  const data = req.body; 
  const tentative = JSON.stringify(await db.getTentativeMeetings(data.email));
  let meetingId = JSON.parse(tentative)[0]["tentative_meetings"]["meeting_id"]; //meeting id of declined tentative meeting
  await db.delMeeting(meetingId); //deletes the meeting from the meeting table
  await db.updateTentativeMeetings({}, data.email);
})

app.post('/meetingaccepted', async (req, res) => {
  //meeting stays in the meetings table
  //get tentative meetings for a specific user
  const data = req.body;
  const tentative = JSON.stringify(await db.getTentativeMeetings(data.email));
  let meetingId = JSON.stringify(JSON.parse(tentative)[0]["tentative_meetings"]["meeting_id"]);
  await db.updateTentativeMeetings({}, data.email);
  const upcoming = JSON.stringify(await db.getUpcomingMeetings(data.email));
  let upcomingmeetingIds = JSON.parse(upcoming)[0]["meetings"]; //gives the array of meetingids
  let arr = [];
  for(let i = 0; i<upcomingmeetingIds.length;i++){ 
    arr.push(upcomingmeetingIds[i]); //pushes ids of all the upcoming meetings
  }
  arr.push(meetingId); //pushes id of tentative meeting turned upcoming
  await db.updateUpcomingMeetings(arr, data.email);
})

app.delete("/meetings/:title", async (req, res) => {
  await db.delMeeting(req.params.title, req.email);
  res.sendStatus(200);
});

app.get("*", (req, res) => {
  res.send("Error");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
