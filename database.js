/* * * * * * * * * * * * * * * * * * * * * *  
 *             DATABASE TABLES             *
 * * * * * * * * * * * * * * * * * * * * * * 
    
create table users(user_id SERIAL PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL, meetings text[], tentative_meetings jsonb);
create table meetings( meeting_id SERIAL PRIMARY KEY, title TEXT NOT NULL, date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL, location TEXT NOT NULL, description TEXT NOT NULL, attendees text[]);

Example tables:
        
user_id  |  first_name   |    last_name     |            email            |       meetings      
---------+---------------+------------------+-----------------------------+----------------------    
1        |    Emma       |     Martinez     |   emmaMartinez@gmail.com    |  ["Music Arts Club"]


meeting_id   |       title         |        date         |    start_time    |    end_time    |    location     |         description         |                       attendees  
-------------+---------------------+---------------------+------------------+----------------+-----------------+-----------------------------+-------------------------------------------------------
1            |   Music Arts Club   |     11/09/2021      |      9:00 AM     |    10:00 AM    |      Zoom       |   Music Arts Club Meeting   |   ["emmaMartinez@gmail.com", "sammyRemerez@gmail.com"]

*/

process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';

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

let secrets = require('././secrets.json');
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
async function addUser(first_name, last_name, email) {
  return await connectAndRun((db) =>
    db.none(
      "INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3);",
      [first_name, last_name, email]
    )
  );
}

async function getUser(email) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM users WHERE email = $1;", [email])
  );
}

async function addMeeting(
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
      "INSERT INTO meetings (title, date, start_time, end_time, location, description, attendees) VALUES ($1, $2, $3, $4, $5, $6, $7);",
      [title, date, start_time, end_time, location, description, attendees]
    )
  );
}

async function getMeetings(meeting_id) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM meetings where meeting_id = $1;", [meeting_id])
  );
}

async function delMeeting(meeting_id) {
  return await connectAndRun((db) =>
    db.none("DELETE FROM meetings where meeting_id = $1;", [meeting_id])
  );
}

module.exports = {
  addUser,
  getUser,
  addMeeting,
  getMeetings,
  delMeeting,
};
