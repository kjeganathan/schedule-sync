"use strict";

// Get the upcoming meeting id from url query string
const urlParams = new URLSearchParams(window.location.search);
// Get the user's email
const email = urlParams.get("email");

window.addEventListener("load", async function () {
  // Set NAVBAR LINKS
  document.getElementById("myCalendar").href = `./calendar?email=${email}`;
  document.getElementById(
    "scheduleMeeting"
  ).href = `./scheduling?email=${email}`;
  document.getElementById("myMeetings").href = `./meetings?email=${email}`;

  // Add event listener for minimum choice of end time as start time
  const startTime = document.getElementById("startTime");
  startTime.addEventListener("input", async () => {
    if (startTime.value !== "") {
      document.getElementById("endTime").setAttribute("min", startTime.value);
    }
  });

  // Check validity of end time
  const endTime = document.getElementById("endTime");
  endTime.addEventListener("input", async () => {
    if (!endTime.checkValidity()) {
      $("#endTime").tooltip("show");
    } else {
      $("#endTime").tooltip("hide");
    }
  });
  // Add event listeners to schedule button and remote/in person input
  const scheduleButton = document.getElementById("Schedule");
  const remoteInput = document.getElementById("remote");
  const inPersonInput = document.getElementById("inPerson");
  remoteInput.addEventListener("input", async () => {
    document.getElementById("inPerson").disabled = remoteInput.value != "";
  });
  inPersonInput.addEventListener("input", async () => {
    document.getElementById("remote").disabled = inPersonInput.value != "";
  });

  scheduleButton.addEventListener("click", scheduleMeeting);
});

async function scheduleMeeting() {
  // Get form information
  const addMeetingTitle = document.getElementById("meetingTitle").value;
  let meetingDate = document.getElementById("meetingDate").value;
  meetingDate = meetingDate.replace(/(\d{4})\-(\d{2})\-(\d{2})/, "$2/$3/$1");
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const description = document.getElementById("description").value;
  const attendeeEmails = document.getElementById("attendeeEmail").value;
  const attendeeEmailsArray = attendeeEmails.split(",");
  let locationValue = "";

  if (document.getElementById("remote").value != "") {
    locationValue = document.getElementById("remote").value;
  }
  if (document.getElementById("inPerson").value != "") {
    locationValue = document.getElementById("inPerson").value;
  }

  if (
    addMeetingTitle === "" ||
    meetingDate === "" ||
    startTime === "" ||
    endTime === "" ||
    description === "" ||
    attendeeEmails === "" ||
    locationValue === ""
  ) {
    $("#message").text(
      "Required information is missing. Please add missing information to schedule your meeting."
    );
    $("#modalNotification").modal("show");
  } else if (!document.getElementById("endTime").checkValidity()) {
    $("#message").text("Please input an End Time later than Start Time");
    $("#modalNotification").modal("show");
  } else {
    let event = {
      title: addMeetingTitle,
      date: meetingDate,
      start_time: startTime,
      end_time: endTime,
      location: locationValue,
      description: description,
      attendees: attendeeEmailsArray,
    };

    // Add the meeting to user's calendar
    let event_id = await addMeetingToCalendar(event);
    // Add event id to event
    event.event_id = event_id;

    // Schedule meeting
    let response = await fetch("/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(event),
    });
    // Get the returned meeting id
    let meeting_id = (await response.json()).id;
    // Update the attendees meetings with the new meeting
    updateAttendeeMeetings(
      { meeting_id: meeting_id, event_id: event_id },
      attendeeEmailsArray
    );
    // Alert user that meeting has been successfully scheduled
    $("#message").text("Meeting Successfully Scheduled");
    $("#modalNotification").modal("show");
    // Reset form
    document.getElementById("schedule-meeting").reset();
    document.getElementById("inPerson").disabled = false;
    document.getElementById("remote").disabled = false;
  }
}

// Add the scheduled meeting to the attendees meetings
async function updateAttendeeMeetings(meeting, attendees) {
  const response = await fetch(`/meetings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meeting: meeting,
      attendees: attendees.concat([email]),
    }),
  });
  const result = await response.json();
  console.log(result);
}

// Add the meeting to the attendees google calendars
async function addMeetingToCalendar(event) {
  let google_event = {
    title: event.title,
    date: event.date,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location,
    description: event.description,
    attendees: event.attendees,
  };
  google_event.date = document.getElementById("meetingDate").value;

  const startTime = moment(
    `${google_event.date} ${google_event.start_time}`,
    "YYYY-MM-DD HH:mm:ss"
  ).format();

  const endTime = moment(
    `${google_event.date} ${google_event.end_time}`,
    "YYYY-MM-DD HH:mm:ss"
  ).format();

  let attendees = google_event.attendees.map((email) => {
    return { email: email };
  });

  google_event.start_time = startTime;
  google_event.end_time = endTime;
  google_event.attendees = attendees;

  const response = await fetch(`/add-to-calendar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(google_event),
  });
  const result = await response.json();
  return result.event_id;
}

// Provide meeting suggestions
async function meetingSuggestions(dateMin, dateMax) {
  await fetch(`/availability/${dateMin}/${dateMax}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
}
