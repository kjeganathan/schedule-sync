'use strict';

window.addEventListener("load", async function () {

    const response = await fetch('/', {
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
}

