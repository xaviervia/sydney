
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#new: takes a callback", function () {
  var callback = function () {}

  return new Sydney(callback).callback === callback
})


example("#new: takes an endpoint if has `match`", function () {
  var endpoint = { match: function () {} }

  return new Sydney(endpoint).endpoint === endpoint
})


example("#new: ❌ does not initialize subscribers", function () {
  return new Sydney().subscribers === undefined
})


example("#new: @endpoint endpoint is first argument", function () {
  var endpoint = { match: function () {} }
  var callback = function () {}
  var venue = new Sydney(endpoint, callback)

  return venue.endpoint === endpoint
})


example("#new: @endpoint callback is second argument", function () {
  var endpoint = { match: function () {} }
  var callback = function () {}
  var venue = new Sydney(endpoint, callback)

  return venue.callback === callback
})


example("#Sydney: no need for new", function () {
  return Sydney() instanceof Sydney
})


example("#new: @vanilla @callback is bound to original context", function () {
  var subscriber  = {
    callback: function () {
      return this === subscriber
    }
  }
  var venue = new Sydney(subscriber)

  return venue.callback()
})


example("#new: @vanilla @endpoint is preserved", function () {
  var subscriber  = {
    endpoint: {
      match: function () {}
    }
  }
  var venue = new Sydney(subscriber)

  return venue.endpoint === subscriber.endpoint
})


example("#new: @vanilla @endpoint & @callback, callback keeps context", function () {
  var subscriber  = {
    callback: function () {
      return this === subscriber
    },

    endpoint: {
      match: function () {}
    }
  }
  var venue = new Sydney(subscriber)

  return venue.callback()
})


example("#new: @vanilla @endpoint & @callback, endpoint is kept", function () {
  var subscriber  = {
    callback: function () {
      return this === subscriber
    },

    endpoint: {
      match: function () {}
    }
  }
  var venue = new Sydney(subscriber)

  return venue.endpoint === subscriber.endpoint
})
