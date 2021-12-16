const { google } = require("googleapis");
const CREDENTIALS = require("./auth/credentials.json");
const { client_secret, client_id, redirect_uris } = CREDENTIALS.web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// List a user's events from all their calendars
async function listEvents(tokens) {
  oAuth2Client.setCredentials(tokens);
  // Authorize a client with credentials, then call the Google Calendar API.
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  // Get all the calendar ids
  const calendars = (await calendar.calendarList.list()).data.items;

  // Map all the events to one array from each calendar id
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
  // For each array of events push each event to one single array
  var calendar_events = [];
  events.map((calendar) => {
    calendar.forEach((item) => {
      calendar_events.push(item);
    });
  });
  // Return array of calendar events
  return calendar_events;
}

// Get a user's availability based on a specified time range
async function freeBusy(tokens, dateMin, dateMax) {
  oAuth2Client.setCredentials(tokens);
  // Authorize a client with credentials, then call the Google Calendar API.
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  let busy = [];
  let errors = [];

  // Call Free/Busy API and get when the user is busy
  const result = await calendar.freebusy.query({
    resource: {
      // Set times to ISO strings as such
      timeMin: new Date(dateMin).toISOString(),
      timeMax: new Date(dateMax).toISOString(),
      timeZone: "EST",
      items: (await calendar.calendarList.list()).data.items,
    },
  });
  // Sort through the data to populate busy object and errors object
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
  // Return busy object
  return busy;
}

// Insert an event into a user's Google Calendar
async function insertIntoCalendar(tokens, event) {
  oAuth2Client.setCredentials(tokens);
  // Authorize a client with credentials, then call the Google Calendar API.
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  // insert the event into the user's google calendar
  const result = await calendar.events.insert({
    auth: oAuth2Client,
    calendarId: "primary",
    resource: event,
  });

  // Return Event ID
  return result.data.id;
}

// Check the attendee's status for a specific event
async function attendeeStatus(tokens, event_id, email) {
  oAuth2Client.setCredentials(tokens);
  // Authorize a client with credentials, then call the Google Calendar API.
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  // Get the event
  const result = await calendar.events.get({
    auth: oAuth2Client,
    calendarId: "primary",
    eventId: event_id,
  });

  // populate the status of the specified attendee
  const attendees = result.data.attendees;
  let status = "";
  attendees.forEach((attendee) => {
    status = attendee.email === email ? attendee.responseStatus : "";
  });

  // If the status is empty, this is the host's email -> set to accepted
  if (status === "") {
    status = "accepted";
  }
  // Return status
  return status;
}

module.exports = {
  listEvents,
  freeBusy,
  insertIntoCalendar,
  attendeeStatus,
};
