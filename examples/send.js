
"use strict"


let example = require("washington")
let Sydney  = require("../sydney")


example("#send: run after a tick", function (check) {
  let value = false
  let venue = new Sydney(function () {
    value = true
  })

  venue.send()

  if (value) check("Should be async")

  process.nextTick(function () {
    check( value || "Should be run by now")
  })
})


example("#send: run with immediate if there is no tick", function (check) {
  let value = false
  let nextTick = process.nextTick
  let venue = new Sydney(function () {
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
  let value           = false
  let nextTick        = process.nextTick
  var setImmediate    = global.setImmediate
  let venue           = new Sydney(function () {
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
  let event = { name: "event" }

  new Sydney(function (e) {
    check(e, event)
  }).send(event)
})


example("#send: send the venue to the callback", function (check) {
  let event = { name: "event" }
  let venue = new Sydney(function (e, v) {
    check(v, venue)
  })

  venue.send(event)
})


example("#send: preserve the binding of the callback", function (check) {
  let context = { value: { name: "some value" } }
  let callback = function () {
    check(this.value, context.value)
  }.bind(context)

  new Sydney(callback).send()
})


example("#send: chainable", function () {
  let venue = new Sydney(function () {})

  return venue.send() === venue
})
