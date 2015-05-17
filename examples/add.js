
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


example("#add: @vanilla @callback a Sydney is created", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    }
  }

  venue.add(subscriber)

  return venue.subscribers[0] instanceof Sydney
})


example("#add: @vanilla @callback is bound to original context", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    }
  }

  venue.add(subscriber)

  return venue.subscribers[0].callback()
})


example("#add: @vanilla @endpoint a Sydney is created", function () {
  var venue       = new Sydney
  var subscriber  = {
    endpoint: {}
  }

  venue.add(subscriber)

  return venue.subscribers[0] instanceof Sydney
})


example("#add: @vanilla @endpoint is preserved", function () {
  var venue       = new Sydney
  var subscriber  = {
    endpoint: {
      match: function () {}
    }
  }

  venue.add(subscriber)

  return venue.subscribers[0].endpoint === subscriber.endpoint
})


example("#add: @vanilla @endpoint & @callback, callback keeps context", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    },

    endpoint: {
      match: function () {}
    }
  }

  venue.add(subscriber)

  return venue.subscribers[0].callback()
})


example("#add: @vanilla @endpoint & @callback, endpoint is kept", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    },

    endpoint: {
      match: function () {}
    }
  }

  venue.add(subscriber)

  return venue.subscribers[0].endpoint === subscriber.endpoint
})
