var example = require("washington")
var Sydney  = require("./sydney")



example("notify: call async by default", function (done) {
  var value   = false
  var venue  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  venue.notify()

  if (value)
    throw new Error("Should be async")

  process.nextTick(function () {
    done( value ? null : new Error("Should be run by now") )
  })
})



example("notify: call with setImmediate if process.nextTick is not available", function (done) {
  var value   = false
  var venue  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  var nextTick = process.nextTick
  process.nextTick = null

  venue.notify()

  process.nextTick = nextTick

  if (value)
    throw new Error("Should be async")

  process.nextTick(function () {
    done( value ? new Error("Should not be run yet") : null )
  })

  setImmediate(function () {
    done( value ? null : new Error("Should be run by now") )
  })
})



example("notify: call with setTimeout if setImmediate is not available", function (done) {
  var value   = false
  var venue  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  var nextTick = process.nextTick
  var setImmediate = global.setImmediate
  process.nextTick = null
  global.setImmediate = null

  venue.notify()

  process.nextTick = nextTick
  global.setImmediate = setImmediate

  if (value)
    throw new Error("Should be async")

  process.nextTick(function () {
    done( value ? new Error("Should not be run yet") : null )
  })

  setImmediate(function () {
    done( value ? new Error("Should not be run yet") : null )
  })

  setTimeout(function () {
    done( value ? null : new Error("Should have been run by now") )
  }, 0)
})


example("notify: should not run if it does not match", function (done) {
  var value = false
  var venue = new Sydney(
    { match: function () { return false } },
    function () { value = true },
    { context: "something" }
  )

  venue.notify()

  process.nextTick(function () {
    done( !value ? null : new Error("Shouldn't have run") )
  })
})


example("notify: forwards the event", function (done) {
  var value     = false
  var someEvent = { content: "text" }
  var venue     = new Sydney(
    { match: function () { return true } },
    function (event) { value = event },
    {}
  )

  venue.notify(someEvent)

  process.nextTick(function () {
    done( value === someEvent ?
      null : Error("Should have been the event") )
  })
})


example("nofify: calls with the proper context")


example("match: delegates to the endpoint match", function () {
  var result = {}
  var endpoint = {
    match: function () {
      this.match.args = arguments
      return result } }
  var event = { a: 'particular event' }
  var venue = new Sydney( endpoint, function () {}, {})

  if (venue.match(event) !== result)
    throw new Error("Should have returned the result of endpoint match")

  if (endpoint.match.args[0] !== event)
    throw new Error("Should have forwarded the event object")
})
