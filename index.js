const express = require("express");
const path = require("path");
const router = express.Router();
const googleCalendar = require("./calendar.js");

// environment variables
require("dotenv").config();

const PORT = process.env.PORT || 8081;
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

// App configuration
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", router);

// ENDPOINT for sending the app to the login page on the main domain
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
});

// ENDPOINT for getting the user's calendars
app.get("/api/user-calendars", async function (req, res) {
  try {
    const calendars = await googleCalendar.listCalendars();
    if (calendars.length !== 0) {
      res.json({ googleCalendars: calendars });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.trace(error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

/* * * * * * * * * * * * * * * * * * * * * *  
 *             DATABASE TABLES             *
 * * * * * * * * * * * * * * * * * * * * * * 
TABLE users( 
    user_id SERIAL PRIMARY KEY, 
    first_name TEXT NOT NULL, 
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    meetings TEXT NOT NULL ---> string of json array
    tentative_meetings TEXT NOT NULL ---> string of json array
);
TABLE meetings( 
    meeting_id SERIAL PRIMARY KEY, 
    title TEXT NOT NULL, 
    date DATE NOT NULL,
    start TIME NOT NULL,
    end TIME NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    attendees TEXT NOT NULL  ---> string of json array
);
*/
