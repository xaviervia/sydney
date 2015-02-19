var example = require("washington")
var Sydney  = require("./sydney")



example("notify: call async by default", function (check) {
  var value   = false
  var venue  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  venue.notify()

  if (value) check(Error("Should be async"))

  process.nextTick(function () {
    check( value || Error("Should be run by now") )
  })
})



example("notify: call with setImmediate if process.nextTick is not available", function (check) {
  var value   = false
  var venue  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  var nextTick = process.nextTick
  process.nextTick = undefined

  venue.notify()

  process.nextTick = nextTick

  if (value) check(Error("Should be async"))

  process.nextTick(function () {
    check( !value || Error("Should not be run yet") )
  })

  setImmediate(function () {
    check( value || Error("Should be run by now") )
  })
})



example("notify: call with setTimeout if setImmediate is not available", function (check) {
  var value           = false
  var venue           = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  var nextTick        = process.nextTick
  var setImmediate    = global.setImmediate
  process.nextTick    = undefined
  global.setImmediate = undefined

  venue.notify()

  process.nextTick = nextTick
  global.setImmediate = setImmediate

  if (value) check(Error("Should be async"))

  process.nextTick(function () {
    check( !value || Error("Should not be run yet") )
  })

  setImmediate(function () {
    check( !value || Error("Should not be run yet") )
  })

  setTimeout(function () {
    check( value || Error("Should have been run by now") )
  }, 0)
})


example("notify: should not run if it does not match", function (check) {
  var value = false
  var venue = new Sydney(
    { match: function () { return false } },
    function () { value = true },
    { context: "something" }
  )

  venue.notify()

  process.nextTick(function () {
    check( !value || Error("Shouldn't have run") )
  })
})


example("notify: forwards the event", function (check) {
  var value     = false
  var someEvent = { content: "text" }
  var venue     = new Sydney(
    { match: function () { return true } },
    function (event) { value = event },
    {}
  )

  venue.notify(someEvent)

  process.nextTick(function () {
    check( value === someEvent || Error("Should have been the event") )
  })
})


example("notify: calls with the proper context", function (check) {
  var value     = undefined
  var someEvent = { content: "different" }
  var context   = { name: { last: "Bond", first: "James" } }
  var venue     = new Sydney(
    { match: function () { return true } },
    function (event) { value = this.name },
    context
  )

  venue.notify(someEvent)

  process.nextTick(function () {
    check(
      value === context.name ||
      Error("Should have been the context.name") )
  })
})


example("match: delegates to the endpoint match", function () {
  var result = {}
  var endpoint = {
    match: function () {
      this.match.args = arguments
      return result } }
  var event = { a: 'particular event' }
  var venue = new Sydney( endpoint, function () {}, {})

  if (venue.match(event) !== result)
    return "Should have returned the result of endpoint match"

  if (endpoint.match.args[0] !== event)
    return "Should have forwarded the event object"
})
