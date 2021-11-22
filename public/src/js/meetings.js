'use strict';

const email = localStorage.getItem("email");

window.addEventListener("load", async function () {
    let response = await fetch('/tentativemeetings', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email
        })
      });
      console.log(response.data);
})
