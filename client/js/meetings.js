"use strict";

const email = localStorage.getItem("email");

window.addEventListener("load", async function () {
  let response = await fetch("/tentativemeetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: JSON.parse(email),
    }),
  });
  console.log(email);
  let data = await response.json();
  console.log(data[0]);
  document.getElementById("card-title").innerText = data[0]["title"];
  document.getElementById("start-time-title").innerText =
    "Start Time: " + data[0]["start_time"];
  document.getElementById("end-time-title").innerText =
    "End Time: " + data[0]["end_time"];
  document.getElementById("location-title").innerText =
    "Location: " + data[0]["location"];

  let responseupcoming = await fetch("/upcomingmeetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: JSON.parse(email),
    }),
  });

  let upcomingdata = await responseupcoming.json();
  console.log(upcomingdata[0]["meeting_id"]);
  let upcomingindex = upcomingdata[0]["meeting_id"];
  localStorage.setItem("upcomingMeetingId", JSON.stringify(upcomingindex));
  document.getElementById("upcoming-card-title").innerText =
    upcomingdata[0]["title"];
  document.getElementById("upcoming-start-time").innerText =
    "Start Time: " + upcomingdata[0]["start_time"];
  document.getElementById("upcoming-end-time").innerText =
    "End Time: " + upcomingdata[0]["end_time"];
  document.getElementById("upcoming-location").innerText =
    "Location: " + upcomingdata[0]["location"];
});

let acceptButton = document.getElementById("tentativeButton1");
let declineButton = document.getElementById("tentativeButton2");

declineButton.addEventListener("click", async () => {
  let tentativeCard = document.getElementById("card1");
  tentativeCard.remove();
  let responsedeclined = await fetch("/meetingdeclined", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: JSON.parse(email),
    }),
  });
  let declineddata = await responsedeclined.json();
  console.log(declineddata);
});

acceptButton.addEventListener("click", async () => {
  //get tentative meeting data and store it

  let upcoming = document.getElementById("createAccountCol");
  const namediv = document.createElement("div");
  namediv.classList.add("card");
  namediv.setAttribute("id", "card3");
  upcoming.appendChild(namediv);

  let response2 = await fetch("/tentativemeetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: JSON.parse(email),
    }),
  });

  let data2 = await response2.json();

  let card3 = document.getElementById("card3");
  const newdiv = document.createElement("div");
  newdiv.classList.add("card-title");
  newdiv.innerHTML = data2[0]["title"];
  newdiv.setAttribute("id", "newdiv");
  card3.appendChild(newdiv);

  const startdiv = document.createElement("div");
  startdiv.classList.add("start-time");
  startdiv.innerHTML = data2[0]["start_time"];
  startdiv.setAttribute("id", "start-time");
  card3.appendChild(startdiv);

  const enddiv = document.createElement("div");
  enddiv.classList.add("end-time");
  enddiv.innerHTML = data2[0]["end_time"];
  enddiv.setAttribute("id", "end-time");
  card3.appendChild(enddiv);

  const locationdiv = document.createElement("div");
  locationdiv.classList.add("location");
  locationdiv.innerHTML = data2[0]["location"];
  locationdiv.setAttribute("id", "location");
  card3.appendChild(locationdiv);

  // let tentativeCardToDelete = document.getElementById("card1");
  // tentativeCard.remove();
});

let detailButton = document.getElementById("detailButton");
detailButton.addEventListener("click", () => {
  window.location.href = "/meeting-info";
});
