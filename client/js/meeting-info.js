// Get the upcoming meeting id from local storage
const upcomingMeeting = localStorage.getItem("meeting-id");

window.addEventListener("load", async function () {
  // Set event listener for delete button
  const deleteButton = document.getElementById("delete");
  deleteButton.addEventListener("click", deleteMeeting);
  // populate the meeting details
  populateMeetingInfo(upcomingMeeting);
});

// Fetch a specific meeting an populate the html with the meeting information
async function populateMeetingInfo(meeting_id) {
  await fetch(`/meetings/${meeting_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      const meeting = JSON.parse(result);
      document.getElementById("title").innerHTML = meeting.title;
      document.getElementById("date").innerHTML = meeting.date;
      document.getElementById("start-time").innerHTML = tConvert(
        meeting.start_time
      );
      document.getElementById("end-time").innerHTML = tConvert(
        meeting.end_time
      );
      document.getElementById("attendee-number").innerHTML =
        meeting.attendees.length;
      document.getElementById("description").innerHTML = meeting.description;
      document.getElementById("location").innerHTML = meeting.location;
      populateAttendees(meeting.attendees, meeting_id);
    })
    .catch((error) => console.log("error", error));
}

// Get the attendees and populate the attendee list html with whether or not they accepted, declined, or haven't replied yet
async function populateAttendees(attendees, meeting_id) {
  let actualClass = "";
  let actualIcon = "";
  let acceptedClass = "bg-success";
  let tentativeClass = "bg-warning text-dark";
  let declinedClass = "bg-danger";
  let acceptedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="#28a745"
              class="bi bi-check-circle-fill" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>`;
  let tentativeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="#ffc107" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
            </svg>`;
  let declinedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="#dc3545" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>`;
  let attendeeList = await Promise.all(
    attendees.map(async (attendee) => {
      let tentativeMeetings = [];
      let upcomingMeetings = [];
      // Get tentative meetings
      await fetch(`/tentative-meetings/${attendee}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      })
        .then((response) => response.text())
        .then((result) => {
          tentativeMeetings = result;
        })
        .catch((error) => console.log("error", error));
      // Get upcoming meetings
      await fetch(`/upcoming-meetings/${attendee}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      })
        .then((response) => response.text())
        .then((result) => {
          upcomingMeetings = result;
        })
        .catch((error) => console.log("error", error));
      // User has declined if the meeting id is not in either tentative meetings or their upcoming meetings
      if (
        !tentativeMeetings.includes(meeting_id) &&
        !upcomingMeetings.includes(meeting_id)
      ) {
        actualClass = declinedClass;
        actualIcon = declinedIcon;
      }
      // Otherwise, the user has either accepted or hasn't replied
      else {
        actualClass = upcomingMeetings.includes(meeting_id)
          ? acceptedClass
          : tentativeClass;
        actualIcon = upcomingMeetings.includes(meeting_id)
          ? acceptedIcon
          : tentativeIcon;
      }
      return `<div class="icons-container"><span class="badge rounded-pill ${actualClass}">${attendee}</span> ${actualIcon}</div>`;
    })
  );
  // populate the html
  document.getElementById("attendee-list").innerHTML = attendeeList.join("");
}

// Delete the current meeting
async function deleteMeeting() {
  var attendees = [];
  // Get the attendees
  await fetch(`/meetings/${upcomingMeeting}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      const meeting = JSON.parse(result);
      attendees = meeting.attendees;
    })
    .catch((error) => console.log("error", error));
  // Update the attendees tentative and upcoming meetings and delete the meeting from their list
  updateAttendeeMeetings(upcomingMeeting, attendees);
  // Delete the meeting from the database
  const response = await fetch(`/meetings/${upcomingMeeting}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
  console.log(response);
  location.href = "/meetings";
}

// update each attendee's meetings by deleting the meeting id
async function updateAttendeeMeetings(meeting_id, attendees) {
  const response = await fetch(`/attendee-meetings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      meeting_id: meeting_id,
      attendees: attendees,
    }),
  });
  let result = await response.json();
  console.log(result);
}

function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(""); // return adjusted time or original string
}
