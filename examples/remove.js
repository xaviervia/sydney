
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#remove: remove the subscriber", function () {
  var venue       = new Sydney
  var subscriber  = new Sydney

  venue.add(subscriber)

  venue.remove(subscriber)

  return venue.subscribers.length === 0
})


example("#remove: remove the subscriber with this callback", function () {
  var venue       = new Sydney
  var subscriber  = function () {}

  venue.add(subscriber)

  venue.remove(subscriber)

  return venue.subscribers.length === 0
})


example("#remove: chainable", function () {
  var venue       = new Sydney
  var subscriber  = function () {}

  venue.add(subscriber)

  return venue.remove(subscriber) === venue
})
