
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#send: run after a tick", function (check) {
  var value = false
  var venue = new Sydney(function () {
    value = true
  })

  venue.send()

  if (value) check("Should be async")

  process.nextTick(function () {
    check( value || "Should be run by now")
  })
})


example("#send: run with immediate if there is no tick", function (check) {
  var value = false
  var nextTick = process.nextTick
  var venue = new Sydney(function () {
    value = true
  })

  process.nextTick = undefined

  venue.send()

  process.nextTick = nextTick

  if (value) check("Should be async")

  process.nextTick(function () {
    check( ! value || "Should not be run yet")
  })

  setImmediate(function () {
    check( value || "Should be run by now")
  })
})


example("#send: run with timeout if no other choice", function (check) {
  var value           = false
  var nextTick        = process.nextTick
  var setImmediate    = global.setImmediate
  var venue           = new Sydney(function () {
    value = true
  })

  global.setImmediate = undefined
  process.nextTick    = undefined

  venue.send()

  global.setImmediate = setImmediate
  process.nextTick    = nextTick

  if (value) check("Should be async")

  process.nextTick(function () {
    check( ! value || "Should not be run yet")
  })

  setImmediate(function () {
    check( ! value || "Should not be run yet")
  })

  setTimeout(function () {
    check( value || "Should have been run by now")
  }, 0)
})


example("#send: send the event to the callback", function (check) {
  var event = { name: "event" }

  new Sydney(function (e) {
    check(e, event)
  }).send(event)
})


example("#send: send the venue to the callback", function (check) {
  var event = { name: "event" }
  var venue = new Sydney(function (e, v) {
    check(v, venue)
  })

  venue.send(event)
})


example("#send: preserve the binding of the callback", function (check) {
  var context   = { value: { name: "some value" } }
  var callback  = function () {
    check(this.value, context.value)
  }.bind(context)

  new Sydney(callback).send()
})


example("#send: @endpoint should not call if doesn't match", function (check) {
  var context   = { value: { name: "some value" } }
  var endpoint  = { match: function () { return false } }
  var called    = false
  var callback  = function () { called = true }

  new Sydney(endpoint, callback).send()

  process.nextTick(function () {
    check(! called)
  })
})


example("#send: chainable", function () {
  var venue = new Sydney(function () {})

  return venue.send() === venue
})


example("#send: @no-subscribers won't fail", function () {
  new Sydney().send()
})
