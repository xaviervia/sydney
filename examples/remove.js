
"use strict"


let example = require("washington")
let Sydney  = require("../sydney")


example("#remove: remove the subscriber", function () {
  let venue       = new Sydney
  let subscriber  = new Sydney

  venue.add(subscriber)

  venue.remove(subscriber)

  return venue.subscribers.length === 0
})


example("#remove: remove the subscriber with this callback", function () {
  let venue       = new Sydney
  let subscriber  = function () {}

  venue.add(subscriber)

  venue.remove(subscriber)

  return venue.subscribers.length === 0
})
