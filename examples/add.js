
"use strict"


let example = require("washington")
let Sydney  = require("../sydney")


example("#add: add the Sydney venue as subscriber", function () {
  let venue       = new Sydney()
  let subscriber  = new Sydney()

  venue.add(subscriber)

  return venue.subscribers[0] === subscriber
})


example("#add: add the callback as Sydney venue subscriber", function () {
  let venue       = new Sydney()
  let subscriber  = function () {}

  venue.add(subscriber)

  return venue.subscribers[0].callback === subscriber
})
