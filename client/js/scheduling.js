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

  scheduleButton.addEventListener("click", async () => {
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
      const response1 = await fetch("/schedule", {
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
      });

      if (!response1.ok) {
        console.error("Could not save the user to the server.");
      } 
      
      const response2 = await fetch("/tentativemeetings/:email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          email: email,
          attendees: attendeeEmailsArray,
        }),
      });

      if (!response2.ok) {
        console.error("Could not save the user to the server.");
      } 
        alert("Meeting successfully scheduled.");
    }
  });
});
