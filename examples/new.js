
"use strict"


let example = require("washington")
let Sydney  = require("../sydney")


example("#new: takes a callback", function () {
  let callback = function () {}

  return new Sydney(callback).callback === callback
})


example("#new: initializes the subscribers array", function () {
  return new Sydney().subscribers instanceof Array
})


example("#Sydney: no need for new", function () {
  return Sydney() instanceof Sydney
})
