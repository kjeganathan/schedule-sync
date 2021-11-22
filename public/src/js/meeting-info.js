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
    })
    .catch((error) => console.log("error", error));
}
