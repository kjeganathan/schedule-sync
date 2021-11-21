'use strict';

window.addEventListener("load", async function () {
  const scheduleButton = document.getElementById('Schedule');
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
            description: description,
            attendeeEmails: attendeeEmails,
            attendeeEmailsArray: attendeeEmailsArray,
            location: locationValue

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