"use strict";

// Get the upcoming meeting id from url query string
const urlParams = new URLSearchParams(window.location.search);
// Get the user's email
const email = urlParams.get("email");
const full_name = urlParams.get("name");
const picture = urlParams.get("picture");

window.addEventListener("load", async function () {
  // Set NAVBAR LINKS
  document.getElementById(
    "myCalendar"
  ).href = `./calendar?email=${email}&name=${full_name}&picture=${picture}`;
  document.getElementById(
    "scheduleMeeting"
  ).href = `./scheduling?email=${email}&name=${full_name}&picture=${picture}`;
  document.getElementById(
    "myMeetings"
  ).href = `./meetings?email=${email}&name=${full_name}&picture=${picture}`;
  // load user information
  loadUserInformation(email, full_name, picture);
  // load the user's upcoming meetings
  loadUpcomingMeetings(email);
});

async function loadUpcomingMeetings(email) {
  let upcoming_html = "";
  await fetch(`/upcoming-meetings/${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      let meetings = JSON.parse(result);
      // Sort meetings by closest meeting
      meetings.sort(function (a, b) {
        return (
          new Date(a.date) - new Date(b.date) ||
          a.start_time.localeCompare(b.start_time)
        );
      });
      meetings.forEach((upcoming_meeting) => {
        let meeting_html = "";
        if (
          !(
            new Date(upcoming_meeting.date).toDateString() <
            new Date(new Date().toDateString())
          )
        ) {
          meeting_html = `<div class="cell"><div class="card" id="card2">
          <div id="entire-card" class="card-horizontal">
             <div class="img-square-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="calendar-icon" class="bi bi-calendar-fill" viewBox="0 0 16 16">
                   <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5h16V4H0V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/>
                   <text font-size="3px" font-weight="bold" x="2" y="11" fill="black">${new Date(
                     upcoming_meeting.date
                   ).toLocaleString("en-us", {
                     month: "short",
                   })} ${upcoming_meeting.date.replace(
            /(\d{2})\/(\d{2})\/(\d{4})/,
            "$2"
          )}</text>
                </svg>
             </div>
             <div class="card-body">
                <div id="upcoming-card-title" class="card-title">${
                  upcoming_meeting.title
                }</div>
                <br />
                <div class="card-text">
                   <div id="start-time">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="clock-icon" class="bi bi-alarm-fill" viewBox="0 0 16 16">
                         <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5zm2.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5zM.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z"/>
                      </svg>
                      <span id="upcoming-start-time">Start Time: ${tConvert(
                        upcoming_meeting.start_time
                      )}</span>
                   </div>
                   <div id="end-time">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="clock-icon" class="bi bi-alarm-fill" viewBox="0 0 16 16">
                         <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5zm2.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5zM.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z"/>
                      </svg>
                      <span id="upcoming-end-time">End Time: ${tConvert(
                        upcoming_meeting.end_time
                      )}</span>
                   </div>
                   <div id="location">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="location-icon" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                         <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                      </svg>
                      <span id="upcoming-location">Location: ${
                        upcoming_meeting.location.includes("https")
                          ? "Remote"
                          : "In Person"
                      } </span>
                   </div>
                   <div>
                      <button id="${upcoming_meeting.meeting_id}-${
            upcoming_meeting.event_id
          }" type="button" class="btn btn-light detail">Details</button></div>
                </div>
             </div>
          </div>
       </div>
       </div>`;
        }
        upcoming_html += meeting_html;
      });
      // Insert the upcoming meetings string into the tentative meetings div
      document.getElementById("grid").innerHTML = upcoming_html;
      // Initialize the event listener for the details button
      const detailButtons = document.querySelectorAll(".btn-light");
      detailButtons.forEach((button) => {
        button.addEventListener("click", meetingDetails);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

// load user information
async function loadUserInformation(email, full_name, picture) {
  $("#photo").html(`<img src=${picture}>`);
  $("#full-name").text(full_name);
  $("#email").text(email);
}

// Get the meeting information
async function meetingDetails() {
  const meeting_id = this.id.split("-")[0];
  const event_id = this.id.split("-")[1];
  window.location.href = `/meeting-info?meeting-id=${meeting_id}&event-id=${event_id}&email=${email}&name=${full_name}&picture=${picture}`;
}

function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time.pop();
    time[5] = +time[0] < 12 ? " AM" : " PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(""); // return adjusted time or original string
}
