window.addEventListener("load", async function () {
  // populate the meeting details
  populateMeetingInfo(36);
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
      let attendeeListHtml = "";
      meeting.attendees.forEach((attendee) => {
        attendeeListHtml += `<span class="badge rounded-pill bg-success">${attendee}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="#28a745"
              class="bi bi-check-circle-fill" viewBox="0 0 16 16">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>`;
      });
      document.getElementById("attendee-list").innerHTML = attendeeListHtml;
    })
    .catch((error) => console.log("error", error));
}
