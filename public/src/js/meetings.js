'use strict';

const email = localStorage.getItem("email");
const tentativeTitle = "";
const tentativeStartTime = "";
const tentativeEndTime = "";

window.addEventListener("load", async function () {
    let response = await fetch('/tentativemeetings', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email:JSON.parse(email)
        })
      });
      let data = await response.json();
      document.getElementById('card-title').innerText = data[0]["title"];
      document.getElementById('start-time-title').innerText = "Start Time: " +data[0]["start_time"];
      document.getElementById('end-time-title').innerText = "End Time: " +data[0]["end_time"];
      document.getElementById('location-title').innerText = "Location: " +data[0]["location"];
      console.log(tentativeTitle);
      console.log(data[0]);

      let responseupcoming = await fetch('/upcomingmeetings', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email:JSON.parse(email)
        })
      });

      let upcomingdata = await responseupcoming.json();    
      console.log(upcomingdata[0]);
      document.getElementById('upcoming-card-title').innerText = upcomingdata[0]["title"];
      document.getElementById('upcoming-start-time').innerText = "Start Time: " +upcomingdata[0]["start_time"];
      document.getElementById('upcoming-end-time').innerText = "End Time: " +upcomingdata[0]["end_time"];
      document.getElementById('upcoming-location').innerText = "Location: " +upcomingdata[0]["location"];
});

let acceptButton = document.getElementById('tentativeButton1');
let declineButton = document.getElementById('tentativeButton2');


