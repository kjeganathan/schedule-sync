const express = require("express");
let fs = require('fs');
const path = require("path");
const router = express.Router();
const PORT = process.env.PORT || 8081;
const { Pool } = require("pg");
// environment variables
let database;
database = JSON.parse(fs.readFileSync("data.json"));

require("dotenv").config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// environment variables
require("dotenv").config();

express()
  .use(
    express.static(path.join(__dirname, "public"), {
      index: false,
    })
  )
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use("/api", router)

  .get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/login.html"));
  })

  .get("/meetings", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/meetings.html"));
  })

  .get("/calendar", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/calendar.html"));
  })

  .get("/meeting-info", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/meeting-info.html"));
  })

  .get("/scheduling", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/scheduling.html"));
  })

  
  .get("/meetings/tentative", function(req, res){
    let userId = "1";
    for(let i = 0; i<database["users"].length; i++){
      if(userId === JSON.stringify(database["users"][i].userId)){
        console.log(data["users"][i]);
        res.send(data["users"][i]);
      }
    }
  })

  .listen(PORT, () => console.log(`Listening on ${PORT}`));

  

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
