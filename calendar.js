const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const TOKENS = require("./auth/token.json");
const CREDENTIALS = require("./auth/credentials.json");

async function listCalendars() {
  const { client_secret, client_id, redirect_uris } = CREDENTIALS.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(TOKENS);

  // Authorize a client with credentials, then call the Google Calendar API.
  var calendar_ids = [];

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const calendars = (await calendar.calendarList.list()).data.items;
  calendars.forEach((obj) => {
    calendar_ids.push({ googleCalendarId: obj.id });
  });
  return calendar_ids;
}

module.exports = {
  SCOPES,
  listCalendars,
};
