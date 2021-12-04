"use strict";

const email = localStorage.getItem("email");

window.addEventListener("load", async function () {
  loadTentativeMeetings();
  loadUpcomingMeetings();
});

async function loadTentativeMeetings(email) {
  await fetch(`/tentative-meetings-info/${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      let meetings = JSON.parse(result);
      let tentative_html = "";
      meetings.forEach((tentative_meeting) => {
        let meeting_html = `<div class="card">
               <div id="entire-card" class="card-horizontal">
                  <div class="img-square-wrapper">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="calendar-icon" class="bi bi-calendar-fill" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5h16V4H0V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/>
                        <text font-size="3px" font-weight="bold" x="2" y="11" fill="black">Nov 18</text>
                     </svg>
                  </div>
                  <div class="card-body">
                     <div id="card-title" class="card-title">${tentative_meeting.title}</div>
                     <br />
                     <div class="card-text">
                        <div id="start-time">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="clock-icon" class="bi bi-alarm-fill" viewBox="0 0 16 16">
                              <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5zm2.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5zM.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z"/>
                           </svg>
                           <span id="start-time-title">${tentative_meeting.start_time}</span>
                        </div>
                        <div id="end-time">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="clock-icon" class="bi bi-alarm-fill" viewBox="0 0 16 16">
                              <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5zm2.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5zM.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z"/>
                           </svg>
                           <span id="end-time-title">${tentative_meeting.end_time}</span>
                        </div>
                        <div id="location">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="location-icon" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                           </svg>
                           <span id="location-title">${tentative_meeting.location}</span>
                           <button id="${tentative_meeting.meeting_id}" type="button" class="btn btn-success">Accept</button>
                           <button id="${tentative_meeting.meeting_id}" type="button" class="btn btn-danger">Decline</button>  
                        </div>
                     </div>
                  </div>
               </div>
            </div>`;
        tentative_html += meeting_html;
      });
      // Insert the tentative meetings string into the tentative meetings div
      document.getElementById("tentative-meetings").innerHTML = tentative_html;
      // Initialize the event listener for the accept/delete button
      const acceptButtons = document.getElementsByClassName("btn-success");
      const declineButtons = document.getElementsByClassName("btn-danger");
      acceptButtons.addEventListener("click", acceptMeeting);
      declineButtons.addEventListener("click", declineMeeting);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function loadUpcomingMeetings(email) {
  await fetch(`/upcoming-meetings/${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      let meetings = JSON.parse(result);
      let upcoming_html = "";
      meetings.forEach((upcoming_meeting) => {
        let meeting_html = `<div class="card" id="card2">
            <div id="entire-card" class="card-horizontal">
               <div class="img-square-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="calendar-icon" class="bi bi-calendar-fill" viewBox="0 0 16 16">
                     <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5h16V4H0V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/>
                     <text font-size="3px" font-weight="bold" x="2" y="11" fill="black">Nov 20</text>
                  </svg>
               </div>
               <div class="card-body">
                  <div id="upcoming-card-title" class="card-title">${upcoming_meeting.title}</div>
                  <br />
                  <div class="card-text">
                     <div id="start-time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="clock-icon" class="bi bi-alarm-fill" viewBox="0 0 16 16">
                           <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5zm2.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5zM.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z"/>
                        </svg>
                        <span id="upcoming-start-time">${upcoming_meeting.start_time}</span>
                     </div>
                     <div id="end-time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="clock-icon" class="bi bi-alarm-fill" viewBox="0 0 16 16">
                           <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5zm2.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5zM.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z"/>
                        </svg>
                        <span id="upcoming-end-time">${upcoming_meeting.end_time}</span>
                     </div>
                     <div id="location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="location-icon" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                           <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        <span id="upcoming-location"></span>
                        <button id="${upcoming_meeting.meeting_id}" type="button" class="btn btn-light">Details</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>`;
        upcoming_html += meeting_html;
      });
      // Insert the upcoming meetings string into the tentative meetings div
      document.getElementById("upcoming-meetings").innerHTML = tentative_html;
      // Initialize the event listener for the details button
      const detailButtons = document.getElementsByClassName("btn-light");
      detailButtons.addEventListener("click", meetingDetails);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function acceptMeeting() {
  const meeting_id = this.id;
  await fetch(`/meeting-accepted`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {},
  })
    .then((response) => response.text())
    .then((result) => {})
    .catch((error) => console.log("error", error));
}

async function declineMeeting() {
  const meeting_id = this.id;
  await fetch(`/meeting-declined`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {},
  })
    .then((response) => response.text())
    .then((result) => {})
    .catch((error) => console.log("error", error));
}

async function meetingDetails() {
  const meeting_id = this.id;
  localStorage.setItem("meeting-id", meeting_id);
  window.location.href = "/meeting-info";
}
