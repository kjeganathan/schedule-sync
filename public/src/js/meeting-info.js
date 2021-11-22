window.addEventListener("load", async function () {
  // populate the meeting details
  let upcomingMeeting = localStorage.getItem("upcomingMeetingId");
  populateMeetingInfo(upcomingMeeting);
});

async function populateMeetingInfo(meeting_id) {
  await fetch(`/meetings/${meeting_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      const meeting = JSON.parse(result)[0];
      document.getElementById("title").innerHTML = meeting.title;
      document.getElementById("date").innerHTML = meeting.date;
      document.getElementById("start-time").innerHTML = meeting.start_time;
      document.getElementById("end-time").innerHTML = meeting.end_time;
      document.getElementById("attendee-number").innerHTML =
        meeting.attendees.length;
      document.getElementById("description").innerHTML = meeting.description;
      document.getElementById("location").innerHTML = meeting.location;
      //   populateAttendees(meeting.attendees, meeting_id);
    })
    .catch((error) => console.log("error", error));
}

async function populateAttendees(attendees, meeting_id) {
  let attendeeListHtml = "";
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

  attendees.forEach(async (attendee) => {
    await fetch(`/tenativemeetings/${attendee}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        if (result.length !== 0) {
          const tentative_meetings = JSON.parse(result)[0];
          tentative_meetings.forEach((meeting) => {
            if (meeting.meeting_id === meeting_id) {
              if (meeting.isDecline === null) {
                acceptedClass = tentativeClass;
                actualIcon = tentativeIcon;
              } else {
                actualClass = meeting.isDecline ? acceptedClass : declinedClass;
                actualIcon = meeting.isDecline ? acceptedIcon : declinedIcon;
              }
            }
          });
        }
      })
      .catch((error) => console.log("error", error));
    attendeeListHtml += `<span class="badge rounded-pill ${actualClass}">${attendee}</span> ${actualIcon}`;
  });
  document.getElementById("attendee-list").innerHTML = attendeeListHtml;
}
