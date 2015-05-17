
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


example("#remove: @endpoint remove subscriber with this endpoint", function () {
  var venue       = new Sydney
  var endpoint    = { match: function () {} }
  var subscriber  = function () {}

  venue.add(endpoint, subscriber)

  venue.remove(endpoint)

  return venue.subscribers.length === 0
})


example("#remove: chainable", function () {
  var venue       = new Sydney
  var subscriber  = function () {}

  venue.add(subscriber)

  return venue.remove(subscriber) === venue
})


example("#remove: @no-subscribers won't fail", function () {
  new Sydney().remove(function () {})
})


example("#remove: @vanilla is also removed")
