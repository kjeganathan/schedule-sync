const express = require("express");
const path = require("path");
const router = express.Router();
const PORT = process.env.PORT || 8081;
const { Pool } = require("pg");
// environment variables
require("dotenv").config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// environment variables
require("dotenv").config();

const app = express();

// App configuration
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", router);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/login.html"));
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
