const express = require("express");
let fs = require('fs');
const path = require("path");
const router = express.Router();
const PORT = process.env.PORT || 8081;

// environment variables
require("dotenv").config();

const app = express();

// App configuration
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", router);

// ENDPOINT for sending the app to the login page on the main domain
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
