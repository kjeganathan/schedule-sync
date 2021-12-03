const { google } = require("googleapis");
const CREDENTIALS = require("./auth/credentials.json");

async function listCalendars(tokens) {
  const { client_secret, client_id, redirect_uris } = CREDENTIALS.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(tokens);

  // Authorize a client with credentials, then call the Google Calendar API.
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const calendars = (await calendar.calendarList.list()).data.items;

  const events = await Promise.all(
    calendars.map(async (obj) => {
      const data = await (
        await calendar.events.list({
          calendarId: obj.id,
        })
      ).data.items;
      return data;
    })
  );
  var calendar_events = [];
  events.map((calendar) => {
    calendar.forEach((item) => {
      calendar_events.push(item);
    });
  });
  return calendar_events;
}

module.exports = {
  listCalendars,
};
