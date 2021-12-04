"use strict";

const email = localStorage.getItem("email");

window.addEventListener("load", async function () {
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
    remote === "" ||
    inPerson === ""
  ) {
    alert("Required information is missing.");
  } else {
    await fetch("/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        title: addMeetingTitle,
        date: meetingDate,
        start_time: startTime,
        end_time: endTime,
        location: locationValue,
        description: description,
        attendeeEmails: attendeeEmails,
        attendees: attendeeEmailsArray,
      }),
    })
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        updateAttendeeMeetings(JSON.parse(result).id);
        alert("Meeting successfully scheduled.");
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

async function updateAttendeeMeetings(meeting_id) {}
