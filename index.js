const express = require("express");
const path = require("path");
const router = express.Router();
const PORT = process.env.PORT || 8081;
const { Pool } = require("pg");
// environment variables
require("dotenv").config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// environment variables
require("dotenv").config();

express()
  .use(
    express.static(path.join(__dirname, "public"), {
      index: false,
    })
  )
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use("/api", router)
  .get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/src/html/login.html"));
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
