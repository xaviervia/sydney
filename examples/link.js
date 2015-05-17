
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#link: add as subscriber", function () {
  var mother    = new Sydney
  var daughter  = new Sydney

  mother.link(daughter)

  return mother.subscribers[0] === daughter
})


example("#link: subscribe back", function () {
  var mother    = new Sydney
  var daughter  = new Sydney

  mother.link(daughter)

  return daughter.subscribers[0] === mother
})


example("#link: @function create venue and add as subscriber", function () {
  var mother            = new Sydney
  var daughterCallback  = function () {}

  mother.link(daughterCallback)

  return mother.subscribers[0].callback === daughterCallback
})


example("#link: @function subscribe back", function () {
  var mother            = new Sydney
  var daughterCallback  = function () {}

  mother.link(daughterCallback)

  return mother.subscribers[0].subscribers[0] === mother
})


example("#link: @endpoint create venue and add endpoint", function () {
  var mother            = new Sydney
  var endpoint          = { match: function () {} }
  var daughterCallback  = function () {}

  mother.link(endpoint, daughterCallback)

  return mother.subscribers[0].endpoint === endpoint
})


example("#link: @endpoint create venue and add callback", function () {
  var mother            = new Sydney
  var endpoint          = { match: function () {} }
  var callback          = function () {}

  mother.link(endpoint, callback)

  return mother.subscribers[0].callback === callback
})


example("#link: @endpoint subscribe back", function () {
  var mother            = new Sydney
  var endpoint          = { match: function () {} }
  var callback          = function () {}

  mother.link(endpoint, callback)

  return mother.subscribers[0].subscribers[0] === mother
})


example("#link: chainable", function () {
  var mother = new Sydney

  return mother.link(function () {}) === mother
})


example("#link: @vanilla @callback the Sydney is added back", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    }
  }

  venue.link(subscriber)

  return venue.subscribers[0].subscribers[0] === venue
})


example("#link: @vanilla @callback a Sydney is created", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    }
  }

  venue.link(subscriber)

  return venue.subscribers[0] instanceof Sydney
})


example("#link: @vanilla @callback is bound to original context", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    }
  }

  venue.link(subscriber)

  return venue.subscribers[0].callback()
})


example("#link: @vanilla @endpoint a Sydney is created", function () {
  var venue       = new Sydney
  var subscriber  = {
    endpoint: {
      match: function () {}
    }
  }

  venue.link(subscriber)

  return venue.subscribers[0] instanceof Sydney
})


example("#link: @vanilla @endpoint is preserved", function () {
  var venue       = new Sydney
  var subscriber  = {
    endpoint: {
      match: function () {}
    }
  }

  venue.link(subscriber)

  return venue.subscribers[0].endpoint === subscriber.endpoint
})


example("#link: @vanilla @endpoint & @callback, callback keeps context", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    },

    endpoint: {
      match: function () {}
    }
  }

  venue.link(subscriber)

  return venue.subscribers[0].callback()
})


example("#link: @vanilla @endpoint & @callback, endpoint is kept", function () {
  var venue       = new Sydney
  var subscriber  = {
    callback: function () {
      return this === subscriber
    },

    endpoint: {
      match: function () {}
    }
  }

  venue.link(subscriber)

  return venue.subscribers[0].endpoint === subscriber.endpoint
})
