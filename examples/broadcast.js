
"use strict"


let example = require("washington")
let Sydney  = require("../sydney")


example("#broadcast: send to the subscriber", function (check) {
  let venue = new Sydney
  let event = { name: "event" }

  venue.add(function (e) { check(e, event) })

  venue.broadcast(event)
})


example("#broadcast: chainable", function () {
  let venue = new Sydney
  let event = { name: "event" }

  venue.add(function () {})

  return venue.broadcast(event) === venue
})
