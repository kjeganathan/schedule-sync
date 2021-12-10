const { google } = require("googleapis");
const CREDENTIALS = require("./auth/credentials.json");
const { client_secret, client_id, redirect_uris } = CREDENTIALS.web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

async function listCalendars(tokens) {
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

async function freeBusy(tokens, dateMin, dateMax) {
  oAuth2Client.setCredentials(tokens);
  // Authorize a client with credentials, then call the Google Calendar API.
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  let busy = [];
  let errors = [];

  const result = await calendar.freebusy.query({
    resource: {
      // Set times to ISO strings as such
      timeMin: new Date(dateMin).toISOString(),
      timeMax: new Date(dateMax).toISOString(),
      timeZone: "EST",
      items: (await calendar.calendarList.list()).data.items,
    },
  });
  const data = result.data.calendars;
  for (const [key, value] of Object.entries(data)) {
    busy = busy.concat(data[key].busy);
    if (data[key].errors !== undefined) {
      errors = errors.concat(data[key].errors);
    }
  }
  if (errors.length) {
    console.error("Check that this calendar has public free busy visibility");
    console.log(errors);
  } else if (busy.length !== 0) {
    console.log("Busy");
  } else {
    console.log("Free");
  }
  return busy;
}

async function insertIntoCalendar(tokens, event) {
  oAuth2Client.setCredentials(tokens);
  // Authorize a client with credentials, then call the Google Calendar API.
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  calendar.events.insert(
    {
      auth: oAuth2Client,
      calendarId: "primary",
      resource: event,
    },
    function (err, event) {
      if (err) {
        console.log(
          "There was an error contacting the Calendar service: " + err
        );
        return;
      }
      console.log("Event created: %s", event.htmlLink);
    }
  );
}

module.exports = {
  listCalendars,
  freeBusy,
  insertIntoCalendar,
};
