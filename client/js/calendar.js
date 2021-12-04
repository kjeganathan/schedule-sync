const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");
localStorage.setItem("email", email);

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
      events.forEach((item) => {
        var event = {
          title: item.summary,
          start: item.start ? item.start.dateTime : "",
          rrule: item.recurrence
            ? `DTSTART:${new Date(item.start.dateTime)
                .toISOString()
                .replace(/-|:/g, "")
                .replace(/\.\d{3}Z/, "Z")}\n${item.recurrence[0]}`
            : "",
          url: item.htmlLink,
        };
        calendar_events.push(event);
      });
    });

  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
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

      if (info.event.url) {
        window.open(info.event.url);
      }
    },
  });
  calendar.render();
});
