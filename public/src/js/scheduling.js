'use strict';

window.addEventListener("load", async function () {
  const scheduleButton = document.getElementById('Schedule');
  const remoteCheckbox = document.getElementById('remoteCheckbox');
  const inPersonCheckbox = document.getElementById('inPersonCheckbox');

  remoteCheckbox.addEventListener('click', async () => {
    document.getElementById('inPerson').disabled = true;
    document.getElementById('remote').disabled = false;
  });
  

  inPersonCheckbox.addEventListener('click', async () => {
    document.getElementById('remote').disabled =true;
    document.getElementById('inPerson').disabled = false;
  });
  
  scheduleButton.addEventListener('click', async () => {
    const addMeetingTitle = document.getElementById('meetingTitle').value; 
    const meetingDate = document.getElementById('meetingDate').value;
    const startTime = document.getElementById('startTime').value; 
    const endTime = document.getElementById('endTime').value; 
    const description = document.getElementById('description').value;
    const attendeeEmails = document.getElementById('attendeeEmail').value;
    const attendeeEmailsArray = attendeeEmails.split(",");
    let locationValue = ""; 

    if(document.getElementById('remoteCheckbox').checked){
      locationValue = document.getElementById('remote').value;
    }
    if(document.getElementById('inPersonCheckbox').checked){
      locationValue = document.getElementById('inPerson').value;
    }

    if(addMeetingTitle === '' || meetingDate === '' || startTime === '' || endTime === '' || description === '' || attendeeEmails ==='' || remote === '' || inPerson ===''){
      alert('Required information is missing.');
    } else {
      const response = await fetch('/schedule', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            title: addMeetingTitle,
            date: meetingDate,
            star_time: startTime,
            end_time: endTime,
            location: locationValue,
            description: description,
            attendeeEmails: attendeeEmails,
            attendees: attendeeEmailsArray,
        })
      });

      if (!response.ok) {
        console.error("Could not save the user to the server.");
      }
    }
  });
});