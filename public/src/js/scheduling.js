'use strict';

window.addEventListener("load", async function () {
  const scheduleButton = document.getElementById('schedule');
  scheduleButton.addEventListener('click', async () => {
    const addMeetingTitle = document.getElementById('meetingTitle').value; 
    const meetingDate = document.getElementById('meetingDate').value;
    const startTime = document.getElementById('startTime').value; 
    const endTime = document.getElementById('endTime').value; 
    const location = document.getElementById('Location').value; 
    const description = document.getElementById('Description').value;
    const attendeeNumber = document.getElementById('attendeeNumber').value;

    if(addMeetingTitle === '' || meetingDate === '' || startTime === '' || endTime === '' || location === '' || description === '' || attendeeNumber ===''){
      alert('Required information is missing.');
    }
    else {
      const response = await fetch('/schedule', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            meetingTitle: addMeetingTitle,
            meetingDate: meetingDate,
            startTime: startTime,
            endTime: endTime,
            location:location,
            description: description,
            attendeeNumber: attendeeNumber
        })
      });

      if (!response.ok) {
        console.error("Could not save the user to the server.");
      }
      else{
        window.location.href = '/login';
      }
    }
  });
});