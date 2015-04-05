
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#add: add the Sydney venue as subscriber", function () {
  var venue       = new Sydney
  var subscriber  = new Sydney

  venue.add(subscriber)

  return venue.subscribers[0] === subscriber
})


example("#add: add the callback as Sydney venue subscriber", function () {
  var venue       = new Sydney
  var subscriber  = function () {}

  venue.add(subscriber)

  return venue.subscribers[0].callback === subscriber
})


example("#add: @endpoint first argument used as endpoint", function () {
  var venue       = new Sydney
  var endpoint    = { match: function () {} }
  var subscriber  = function () {}

  venue.add(endpoint, subscriber)

  return venue.subscribers[0].endpoint === endpoint
})


example("#add: @endpoint second argument used as callback", function () {
  var venue       = new Sydney
  var endpoint    = { match: function () {} }
  var subscriber  = function () {}

  venue.add(endpoint, subscriber)

  return venue.subscribers[0].callback === subscriber
})


example("#add: chainable", function () {
  var venue       = new Sydney
  var subscriber  = function () {}

  return venue.add(subscriber) === venue
})
