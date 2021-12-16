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
  passport.authenticate("google", {
    prompt: "select_account",
    failureRedirect: "/",
  }),
  async function (req, res) {
    const email = userProfile.emails[0].value;
    const user = userProfile.displayName;
    const picture = userProfile._json.picture;
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
          name: user,
          picture: picture,
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
app.put("/attendee-meetings", async (req, res) => {});

// ENDPOINT for scheduling a meeting
app.post("/schedule", checkLoggedIn, async (req, res) => {
  // Gets the posted meeting data
  const data = req.body;
  // Adds the meeting to the database
  let result = (
    await db.addMeeting(
      data.event_id,
      data.title,
      data.date,
      data.timeZone,
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

// ENDPOINT for updating the group of attendees meetings
app.put("/meetings", async (req, res) => {
  // Get meeting id
  const meeting = req.body.meeting;
  // Get attendees
  const attendees = req.body.attendees;
  // Loop through the attendees and add the new meeting to their tentative meetings
  attendees.forEach(async (email) => {
    const results = await db.getUserMeetings(email);
    // Get the tentative meetings
    let meetings = results[0]["meetings"];
    meetings.push(meeting);
    // Update their meetings
    await db.updateMeetings(meetings, email);
  });
  // Send back an OK status
  res.sendStatus(200);
});

// ENDPOINT for deleting a meeting with a specific id
app.delete("/meetings/:id", checkLoggedIn, async (req, res) => {
  // Deletes a meeting with the specified id
  await db.delMeeting(req.params.id);
  res.sendStatus(200);
});

// ENDPOINT for getting the user's upcoming meetings
app.get("/upcoming-meetings/:email", checkLoggedIn, async (req, res) => {
  // Get email
  const email = req.params.email;
  // Get upcoming meetings
  const results = await db.getUserMeetings(email);
  let upcoming_meetings = results[0]["meetings"];
  let meetings = await Promise.all(
    upcoming_meetings.map(async (item) => {
      let meeting_id = JSON.parse(item)["meeting_id"];
      // Gets the meeting information from a specified meeting id
      let meeting = (await db.getMeeting(meeting_id))[0];
      return meeting;
    })
  );
  // Filter the meetings based on the confirmed meetings
  // ASYNC FILTER IMPLEMENTATION
  const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
  };

  meetings = await asyncFilter(meetings, async (meeting) => {
    return (
      (await googleCalendar.attendeeStatus(
        credentials,
        meeting["event_id"],
        email
      )) === "accepted"
    );
  });

  // Returns the user's confirmed upcoming meetings
  res.send(meetings);
});

// ENDPOINT for getting the user's google calendar events
app.get("/google-calendar", checkLoggedIn, async (req, res) => {
  try {
    const calendars = await googleCalendar.listEvents(credentials);
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
app.get("/availability/:dateMin/:dateMax", checkLoggedIn, async (req, res) => {
  const dateMin = req.params.dateMin;
  const dateMax = req.params.dateMax;
  try {
    const busy = await googleCalendar.freeBusy(credentials, dateMin, dateMax);
    res.send(JSON.stringify(busy));
    res.sendStatus(200);
  } catch (error) {
    console.trace(error);
    res.sendStatus(500);
  }
});

// ENDPOINT for adding an event to a google user's calendar
app.post("/add-to-calendar", checkLoggedIn, async (req, res) => {
  const data = req.body;
  const event = {
    summary: data.title,
    location: data.location,
    description: data.description,
    start: {
      dateTime: data.start_time,
      timeZone: data.timeZone,
    },
    end: {
      dateTime: data.end_time,
      timeZone: data.timeZone,
    },
    // recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
    attendees: data.attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  try {
    const event_id = await googleCalendar.insertIntoCalendar(
      credentials,
      event
    );
    res.send(JSON.stringify({ event_id: event_id }));
  } catch (error) {
    console.trace(error);
    res.sendStatus(500);
  }
});

// ENDPOINT for getting attendee status on meeting
app.get("/status/:event_id/:attendee", checkLoggedIn, async (req, res) => {
  const event_id = req.params.event_id;
  const email = req.params.attendee;
  try {
    const status = await googleCalendar.attendeeStatus(
      credentials,
      event_id,
      email
    );
    res.send(JSON.stringify(status));
  } catch (error) {
    console.trace(error);
    res.sendStatus(500);
  }
});

app.get("*", (req, res) => {
  res.send("Error");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
