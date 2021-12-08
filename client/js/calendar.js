// Get user email from the url query string
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");
// Set it in local storage if user is first logging in
if (email !== null) {
  localStorage.setItem("email", email);
}

document.addEventListener("DOMContentLoaded", async function () {
  var calendar_events = [];
  // Get user's google calendar events
  await fetch("/google-calendar", {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      const events = JSON.parse(result)["calendars"];
      // format each of the google calendar events to fit the FullCalendar format
      events.forEach((item) => {
        var event = {
          title: item.summary,
          start: item.start ? item.start.dateTime : "",
          url: item.htmlLink,
        };
        if (item.recurrence) {
          event["rrule"] = `DTSTART:${new Date(item.start.dateTime)
            .toISOString()
            .replace(/-|:/g, "")
            .replace(/\.\d{3}Z/, "Z")}\n${item.recurrence[0]}`;
        }
        calendar_events.push(event);
      });
    });

  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    // plugins: ["rrule"],
    initialView: "dayGridMonth",
    dayMaxEvents: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: calendar_events,
    eventClick: function (info) {
      info.jsEvent.preventDefault(); // don't let the browser navigate
      // open google calendar url in new tab
      if (info.event.url) {
        window.open(info.event.url);
      }
    },
  });
  calendar.render();

  await fetch("/availability", {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
    });
});
