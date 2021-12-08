const express = require("express");
const path = require("path");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
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

// ENDPOINT for sending the app to the my meetings page
app.get("/meetings", checkLoggedIn, function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/meetings.html"));
});

// ENDPOINT for sending the app to the my calendar page
app.get("/calendar", checkLoggedIn, function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/calendar.html"));
});

// ENDPOINT for sending the app to the meeting info page
app.get("/meeting-info", checkLoggedIn, function (req, res) {
  res.sendFile(path.join(__dirname + "/client/html/meeting-info.html"));
});

// ENDPOINT for sending the app to the scheduling page
app.get("/scheduling", checkLoggedIn, function (req, res) {
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
    // Redirect to calendar with user email
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
  res.redirect("/");
});

// ENDPOINT for deleting a person
app.post("/delete-user", async (req, res) => {
  const data = req.body;
  await db.delUser(data.email);
});

// ENDPOINT for adding a user
app.post("/add-user", async (req, res) => {
  const data = req.body;
  let result = await db.addUserTest(
    data.full_name,
    data.email,
    data.meetings,
    data.tentative_meetings
  );
  res.send(result);
});

// ENDPOINT for deleting a meeting from user's upcoming and tentative meetings when the meeting is deleted
app.put("/attendee-meetings", async (req, res) => {
  // Get meeting id
  const meeting_id = req.body.meeting_id.toString();
  // Get attendees
  const attendees = req.body.attendees;
  // Loop through attendees and update their upcoming and tentative meetings
  attendees.forEach(async (email) => {
    // Get the user from the database
    let results = await db.getUser(email);
    let result = results[0];
    // Get tentative meetings
    let tentative_meetings = result["tentative_meetings"];
    // Get upcoming meetings
    let upcoming_meetings = result["meetings"];
    // filter out the meeting id that we are deleting for both upcoming and tentative meetings
    tentative_meetings = tentative_meetings.filter(
      (meeting) => meeting !== meeting_id
    );
    upcoming_meetings = upcoming_meetings.filter(
      (meeting) => meeting !== meeting_id
    );
    console.log(`upcoming: ${upcoming_meetings}`);
    console.log(`tentative: ${tentative_meetings}`);
    // update the user's meetings with the new upcoming and tentative meetings
    await db.updateUserMeetings(upcoming_meetings, tentative_meetings, email);
  });
  res.sendStatus(200);
});

// ENDPOINT for scheduling a meeting
app.post("/schedule", checkLoggedIn, async (req, res) => {
  // Gets the posted meeting data
  const data = req.body;
  // Adds the meeting to the database
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
  // Returns the meeting id of the newly scheduled meeting
  res.send(JSON.stringify({ id: result["meeting_id"] }));
});

// ENDPOINT for getting the meeting information for a meeting with a specific id
app.get("/meetings/:id", checkLoggedIn, async (req, res) => {
  // Gets a meeting with a specific id
  let meeting = (await db.getMeeting(parseInt(req.params.id)))[0];
  // Returns that meeting
  res.send(JSON.stringify(meeting));
});

// ENDPOINT for deleting a meeting with a specific id
app.delete("/meetings/:id", checkLoggedIn, async (req, res) => {
  // Deletes a meeting with the specified id
  await db.delMeeting(req.params.id);
  res.sendStatus(200);
});

// ENDPOINT for getting the meeting info from a user's tentative meetings
app.get("/tentative-meetings/:email", checkLoggedIn, async (req, res) => {
  // Get email
  const email = req.params.email;
  // Get tentative meetings
  const results = await db.getTentativeMeetings(email);
  let tentative_meetings = results[0]["tentative_meetings"];
  let meetings = await Promise.all(
    tentative_meetings.map(async (item) => {
      // Gets the meeting information from a specified meeting id
      let meeting = (await db.getMeeting(parseInt(item)))[0];
      return meeting;
    })
  );
  // Returns user's tentative meetings
  res.send(meetings);
});

// ENDPOINT for getting the group of users' tentative meetings
app.put("/tentative-meetings", async (req, res) => {
  // Get meeting id
  const meeting_id = req.body.meeting_id.toString();
  // Get attendees
  const attendees = req.body.attendees;
  // Loop through the attendees and add the new meeting to their tentative meetings
  attendees.forEach(async (email) => {
    const results = await db.getTentativeMeetings(email);
    // Get the tentative meetings
    let tentative_meetings = results[0]["tentative_meetings"];
    // If the meeting id is not already there we add it to the tentative meetings
    if (!tentative_meetings.includes(meeting_id)) {
      tentative_meetings.push(meeting_id);
    }
    // Update their meetings
    await db.updateTentativeMeetings(tentative_meetings, email);
  });
  // Send back an OK status
  res.sendStatus(200);
});

// ENDPOINT for getting the user's upcoming meetings
app.get("/upcoming-meetings/:email", checkLoggedIn, async (req, res) => {
  // Get email
  const email = req.params.email;
  // Get upcoming meetings
  const results = await db.getUpcomingMeetings(email);
  let upcoming_meetings = results[0]["meetings"];
  let meetings = await Promise.all(
    upcoming_meetings.map(async (item) => {
      // Gets the meeting information from a specified meeting id
      let meeting = (await db.getMeeting(parseInt(item)))[0];
      return meeting;
    })
  );
  // Returns the user's upcoming meetings
  res.send(meetings);
});

// ENDPOINT for updating the host's upcoming meetings
app.put("/upcoming-meetings", checkLoggedIn, async (req, res) => {
  // Get email
  const email = req.body.email;
  // Get meeting id
  const meeting_id = req.body.meeting_id.toString();
  // Get the upcoming meeting
  const results = await db.getUpcomingMeetings(email);
  let upcoming_meetings = results[0]["meetings"];
  // If the meeting id is not already there we add it to the upcoming meetings
  if (!upcoming_meetings.includes(meeting_id)) {
    upcoming_meetings.push(meeting_id);
  }
  // Update their meetings
  await db.updateUpcomingMeetings(upcoming_meetings, email);
  // Send back an OK status
  res.sendStatus(200);
});

// ENDPOINT for user declining a meeting invite
app.post("/meeting-declined", checkLoggedIn, async (req, res) => {
  // Get email
  const email = req.body.email;
  // Get meeting id
  const meeting_id = req.body.meeting_id;
  // Get tentative meetings
  const results = await db.getTentativeMeetings(email);
  let tentative_meetings = results[0]["tentative_meetings"];
  // Filter through tentative meetings to remove the specified meeting id
  tentative_meetings = tentative_meetings.filter(
    (meeting) => meeting !== meeting_id
  );
  // Update the user's tentative meetings
  res.send(await db.updateTentativeMeetings(tentative_meetings, email));
});

// ENDPOINT for user accepting a meeting invite
app.post("/meeting-accepted", checkLoggedIn, async (req, res) => {
  // Get email
  const email = req.body.email;
  // Get meeting id
  const meeting_id = req.body.meeting_id;
  // Get tentative meetings
  const tentative_results = await db.getTentativeMeetings(email);
  let tentative_meetings = tentative_results[0]["tentative_meetings"];
  // Filter through tentative meetings to remove the specified meeting id
  tentative_meetings = tentative_meetings.filter(
    (meeting) => meeting !== meeting_id
  );
  // Update the user's tentative meetings
  res.send(await db.updateTentativeMeetings(tentative_meetings, email));
  // Get to upcoming meetings
  const upcoming_results = await db.getUpcomingMeetings(email);
  let upcoming_meetings = upcoming_results[0]["meetings"];
  // Add the new id to their upcoming meetings
  upcoming_meetings.push(meeting_id);
  // Update user's meetings
  await db.updateUpcomingMeetings(upcoming_meetings, email);
});

// ENDPOINT for getting the user's google calendar events
app.get("/google-calendar", checkLoggedIn, async (req, res) => {
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

// ENDPOINT for getting google user's availability given a time range
app.get("/availability", checkLoggedIn, async (req, res) => {
  const dateMin = req.body.dateMin;
  const dateMax = req.body.dateMax;
  try {
    const busy = await googleCalendar.freeBusy(credentials, dateMin, dateMax);
    res.send(JSON.stringify(busy));
    res.sendStatus(200);
  } catch (error) {
    console.trace(error);
    res.sendStatus(500);
  }
});

app.get("*", (req, res) => {
  res.send("Error");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
