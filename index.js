const express = require("express");
const path = require("path");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const LocalStorage = require("node-localstorage").LocalStorage;
const PORT = process.env.PORT || 8081;
const db = require("./database.js");
const googleCalendar = require("./google-calendar.js");
const url = require("url");

// environment variables
require("dotenv").config();

const app = express();

// App configuration
app.use(express.static(path.join(__dirname, "client"), { index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", router);
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
var userProfile;
var credentials;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN}/auth/google/callback`,
    },
    function (accessToken, refreshToken, params, profile, done) {
      userProfile = profile;
      credentials = params;
      credentials.refreshToken = refreshToken;
      return done(null, userProfile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Local Storage configuration
let localStorage = new LocalStorage("./local-storage");

function checkLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    // If we are authenticated, run the next route.
    next();
  } else {
    // Otherwise, redirect to the login page.
    res.redirect("/");
  }
}

// ENDPOINT for sending the app to the login page on the main domain
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/login.html"));
});

app.get("/meetings", function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/meetings.html"));
});

app.get("/calendar", function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/calendar.html"));
});

app.get("/meeting-info", function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/meeting-info.html"));
});

app.get("/scheduling", function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/scheduling.html"));
});

// ENDPOINTS for authenticating user
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar",
    ],
    accessType: "offline",
    approvalPrompt: "force",
  })
);

// ENDPOINT for logging in user and adding user to database if they are not already in it
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async function (req, res) {
    const email = userProfile.emails[0].value;
    const user = userProfile.displayName;
    console.log(user);
    const results = await db.getUser(email);
    if (results.length === 0) {
      await db.addUser(user, email);
    }
    // Redirect to calendar
    res.redirect(
      url.format({
        pathname: "/calendar",
        query: {
          email: email,
        },
      })
    );
  }
);

// ENDPOINT for logging out the user
app.get("/logout", (req, res) => {
  credentials = null;
  req.logout();
  localStorage.clear();
  res.redirect("/");
});

// ENDPOINT for deleting a person
app.post("/deletePerson", async (req, res) => {
  const data = req.body;
  await db.delUser(data.email);
});

// ENDPOINT for adding a person
app.post("/addPerson", async (req, res) => {
  const data = req.body;
  let result = await db.addUserTest(
    data.full_name,
    data.email,
    data.meetings,
    data.tentative_meetings
  );
  res.send(result);
});

// ENDPOINT for scheduling a meeting
app.post("/schedule", async (req, res) => {
  //should be changed to updating the tentative meetings in users as well
  //adds a meeting to the meeting table
  const data = req.body;
  let result = (
    await db.addMeeting(
      data.title,
      data.date,
      data.start_time,
      data.end_time,
      data.location,
      data.description,
      data.attendees
    )
  )[0];
  res.send(JSON.stringify({ id: result["meeting_id"] }));
});

// ENDPOINT for getting the meeting information for a meeting with a specific id
app.get("/meetings/:id", async (req, res) => {
  let meeting = (await db.getMeeting(parseInt(req.params.id)))[0];
  res.send(JSON.stringify(meeting));
});

// ENDPOINT for deleting a meeting with a specific id
app.delete("/meetings/:id", async (req, res) => {
  await db.delMeeting(req.params.id);
  res.redirect("/meetings");
});

// ENDPOINT for getting the user's tentative meetings
app.get("/tentative-meetings/:email", async (req, res) => {
  //returns meeting id
  const email = req.params.email;
  const tentative = JSON.stringify(await db.getTentativeMeetings(email));
  let results = JSON.parse(tentative)[0]["tentative_meetings"];
  let meetings = [];
  results.forEach((item) => {
    meetings.push(JSON.parse(item));
  });
  res.send(meetings); //gets the array of tentative meetings
});

// ENDPOINT for getting the meeting info from a user's tentative meetings
app.get("/tentative-meetings-info/:email", async (req, res) => {
  const email = req.params.email;
  const tentative = JSON.stringify(await db.getTentativeMeetings(email));
  let results = JSON.parse(tentative)[0]["tentative_meetings"];
  let meetings = await Promise.all(
    results.map(async (item) => {
      let meeting = (
        await db.getMeeting(parseInt(JSON.parse(item)["meetingId"]))
      )[0];
      return meeting;
    })
  );
  res.send(meetings); //gets the array of tentative meetings
});

// ENDPOINT for getting the group of users' tentative meetings
app.put("/tentative-meetings", async (req, res) => {
  const meeting_id = req.body.meeting_id;
  const attendees = req.body.attendees;
  attendees.forEach(async (email) => {
    const tentative = await db.getTentativeMeetings(email);
    let results = tentative[0]["tentative_meetings"];
    results.push({ meetingId: meeting_id, isDecline: null });
    await db.updateTentativeMeetings(results, email);
  });
  res.sendStatus(200);
});

// ENDPOINT for getting the user's upcoming meetings
app.get("/upcoming-meetings/:email", async (req, res) => {
  const email = req.params.email;
  const upcoming = await db.getUpcomingMeetings(email);
  let results = upcoming[0]["meetings"];
  let meetings = await Promise.all(
    results.map(async (item) => {
      let meeting = (await db.getMeeting(parseInt(JSON.parse(item))))[0];
      return meeting;
    })
  );
  res.send(meetings); //gets the array of tentative meetings
});

// ENDPOINT for updating the host's upcoming meetings
app.put("/upcoming-meetings", async (req, res) => {
  const email = req.body.email;
  const meeting_id = req.body.meeting_id;
  const upcoming = JSON.stringify(await db.getUpcomingMeetings(email));
  let results = JSON.parse(upcoming)[0]["meetings"];
  results.push(meeting_id);
  await db.updateUpcomingMeetings(results, email);
  res.sendStatus(200);
});

//ENDPOINT for getting a meeting id from a meeting's title
app.post("/meetingId", async (req, res) => {
  const data = req.body;
  let meetingId = await db.getMeetingIdFromTitle(data.title);
  let meetings = meetingId[0]["meeting_id"];
  res.send(JSON.stringify(meetings));
});

// ENDPOINT for user declining a meeting invite
app.post("/meeting-declined", async (req, res) => {
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
app.post("/meeting-accepted", async (req, res) => {
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

// ENDPOINT for getting the user's google calendar events
app.get("/google-calendar", async (req, res) => {
  try {
    const calendars = await googleCalendar.listCalendars(credentials);
    if (calendars.length !== 0) {
      res.contentType("application/json");
      res.send(JSON.stringify({ calendars: calendars }));
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.trace(error);
    res.sendStatus(500);
  }
});

app.get("*", (req, res) => {
  res.send("Error");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
