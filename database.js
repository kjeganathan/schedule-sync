/* * * * * * * * * * * * * * * * * * * * * *  
 *             DATABASE TABLES             *
 * * * * * * * * * * * * * * * * * * * * * * 
    
create table users(user_id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL, meetings text[], tentative_meetings text[]);
create table meetings( meeting_id SERIAL PRIMARY KEY, title TEXT NOT NULL, date TEXT, start_time TIME NOT NULL, end_time TIME NOT NULL, location TEXT NOT NULL, description TEXT, attendees text[]);

Example tables:
        
user_id  |       full_name       |            email            |    meetings      |     tentative meetings   
---------+-----------------------+------------------+-----------------------------+--------------------------
1        |    Emma  Martinez     |   emmaMartinez@gmail.com    |      ["1"]       |           [ "2" ]


meeting_id   |       title         |        date         |    start_time    |    end_time    |    location     |         description         |                       attendees                        |         event_id
-------------+---------------------+---------------------+------------------+----------------+-----------------+-----------------------------+--------------------------------------------------------+--------------------------
1            |   Music Arts Club   |     11/09/2021      |      9:00 AM     |    10:00 AM    |      Zoom       |   Music Arts Club Meeting   |   ["emmaMartinez@gmail.com", "sammyRemerez@gmail.com"] | tsgsjb6koud6il13lpiv8iklmc

*/

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pgp = require("pg-promise")({
  connect(client) {
    console.log("Connected to database:", client.connectionParameters.database);
  },

  disconnect(client) {
    console.log(
      "Disconnected from database:",
      client.connectionParameters.database
    );
  },
});

let secrets = require("././secrets.json");
let username = secrets.username;
let password = secrets.password;

const url = `postgres://${username}:${password}@ec2-52-201-195-11.compute-1.amazonaws.com:5432/d5jgvmlhrb3udn?sslmode=require`;
const db = pgp(url);

async function connectAndRun(task) {
  let connection = null;

  try {
    connection = await db.connect();
    return await task(connection);
  } catch (e) {
    // eslint-disable-next-line no-useless-catch
    throw e;
  } finally {
    try {
      connection.done();
    } catch (ignored) {
      // eslint-disable-next-line no-empty
    }
  }
}

//Database functions
async function addUser(full_name, email) {
  return await connectAndRun((db) =>
    db.none(
      "INSERT INTO users (full_name, email, meetings, tentative_meetings) VALUES ($1, $2, $3, $4);",
      [full_name, email, [], []]
    )
  );
}

async function getUser(email) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM users WHERE email = $1;", [email])
  );
}

async function delUser(email) {
  return await connectAndRun((db) =>
    db.none("DELETE FROM users where email = $1;", [email])
  );
}

async function updateUserMeetings(meetings, tentative_meetings, email) {
  return await connectAndRun((db) =>
    db.any(
      "UPDATE users SET meetings = $1, tentative_meetings = $2 where email = $3;",
      [meetings, tentative_meetings, email]
    )
  );
}

async function addMeeting(
  event_id,
  title,
  date,
  start_time,
  end_time,
  location,
  description,
  attendees
) {
  return await connectAndRun((db) =>
    db.any(
      "INSERT INTO meetings (title, date, start_time, end_time, location, description, attendees, event_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING meeting_id;",
      [
        title,
        date,
        start_time,
        end_time,
        location,
        description,
        attendees,
        event_id,
      ]
    )
  );
}

async function getMeeting(meeting_id) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM meetings where meeting_id = $1;", [meeting_id])
  );
}

async function delMeeting(meeting_id) {
  return await connectAndRun((db) =>
    db.none("DELETE FROM meetings where meeting_id = $1;", [meeting_id])
  );
}

// async function updateMeeting(meeting_id) {
//   return await connectAndRun((db) =>
//     db.none("UPDATE FROM meetings where meeting_id = $1;", [meeting_id])
//   );
// }

async function getTentativeMeetings(email) {
  return await connectAndRun((db) =>
    db.any("SELECT tentative_meetings FROM users where email = $1;", [email])
  );
}

async function updateTentativeMeetings(tentative_meetings, email) {
  return await connectAndRun((db) =>
    db.any("UPDATE users SET tentative_meetings = $1 where email = $2;", [
      tentative_meetings,
      email,
    ])
  );
}

async function updateUpcomingMeetings(meetings, email) {
  return await connectAndRun((db) =>
    db.any("UPDATE users SET meetings = $1 where email = $2;", [
      meetings,
      email,
    ])
  );
}
async function getUpcomingMeetings(email) {
  return await connectAndRun((db) =>
    db.any("SELECT meetings FROM users where email = $1;", [email])
  );
}

module.exports = {
  addUser,
  getUser,
  delUser,
  updateUserMeetings,
  addMeeting,
  getMeeting,
  delMeeting,
  getTentativeMeetings,
  getUpcomingMeetings,
  updateTentativeMeetings,
  updateUpcomingMeetings,
};
