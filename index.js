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
    res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
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

import { getAuth } from "firebase/auth";
const user = getAuth().currentUser;

const database = require('./data.json');
import {readFileSync} from 'fs';
function reload(){
	if (existsSync("'./data.json'")) {
		database = JSON.parse(readFileSync("'./data.json'"));
	}
}

app.get('/check_if_logged_in', async (req, res) => {
  if (user) {//user signed in
    //go to default page, wherever that is
  } else {
    res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
  }
  
});

app.get('/calendar', async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/src/html/calendar.html"));
});
app.get('/meeting-info', async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/src/html/meeting-info.html"));
});
app.get('/meetings', async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/src/html/meetings.html"));
});
app.get('/scheduling', async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/src/html/scheduling.html"));
});


//intialize user
app.post('/new-user', async (req, res) => {
  reload();
  req.on('end', () => {
    const data = JSON.parse(body);
    database.wordScores.push({
        user_id: 1, //dunno what the plan for this is | fill it in when known
        first_name: data.first_name,
        last_name: data.last_name,
        email: user.email,
        meetings: [],
        tentative_meetings: []
        
        //not included in the commented out list above, but we can consider them
        /*
        ,
        user_photo: user.photoURL,
        notifications: [] //meetings
        */
    });
    
    writeFile("./data.json", JSON.stringify(database), err => {
        if (err) {
            console.err(err);
        } else res.end();
    });
});

});

//create meeting
app.post('/create-meeting', async (req, res) => {
  reload();
  req.on('end', () => {
    const data = JSON.parse(body);
    database.wordScores.push({
      meeting_id: 1, //dunno what the plan for this is | fill it in when known
      title: data.title,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      description: data.description,
      attendees: data.attendees,
    });
    
    writeFile("./data.json", JSON.stringify(database), err => {
        if (err) {
            console.err(err);
        } else res.end();
    });
});

});

















