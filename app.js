//packages
const express = require('express'),
  morgan = require("morgan"),
  cheerio = require("cheerio"),
  mongoose = require("mongoose"),
  Promise = require("bluebird")

//models go here


//variables
PORT = process.env.PORT || 3000,
  app = express(),



  app.set("view engine", "ejs"),
  app.use(express.urlencoded({
    extended: true
  })),
  app.use(express.json())
app.use(express.static("public"))
app.use(morgan("dev"))


app.listen(PORT, console.log(`Server running on Port ${PORT}`))