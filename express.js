const express = require('express');
const app = express();
app.use(express.json()); // lets you handle JSON input
const port = process.env.PORT || 8081;

const database = require('./data.json');
import { getAuth } from "firebase/auth";
const user = getAuth().currentUser;

app.get('/check_if_logged_in', async (req, res) => {
  if (user) {//user signed in
    //go to default page, wherever that is
  } else {
    res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
  }
  
});

//intialize user
app.post('/new-user', async (req, res) => {
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


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

