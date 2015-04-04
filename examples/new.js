
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#new: takes a callback", function () {
  var callback = function () {}

  return new Sydney(callback).callback === callback
})


example("#new: initializes the subscribers array", function () {
  return new Sydney().subscribers instanceof Array
})


example("#Sydney: no need for new", function () {
  return Sydney() instanceof Sydney
})
