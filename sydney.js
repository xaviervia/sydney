var example   = require("washington")
var assert    = require("assert")

/*

If the callback is by default a filter over the execution of the contained subscriptions... we should I

*/
//
//
// new Sydney(function (event, venue) {
//   venue.run(event)
// }, { name: "context" })
//
//
// Sydney({
//   match: function (event, venue) {
//     venue.run(event)
//   }
// }, function () {}, { name: "context" })
var Sydney = function (endpoint, callback, context) {
  this.endpoint = endpoint
  this.callback = callback
  this.context  = context
}

Sydney.prototype.run = function () {
  if (process && process.nextTick)
    process.nextTick(function () {
      this.callback.call(this.context)
    }.bind(this))
  else if (setImmediate)
    setImmediate(function () {
      this.callback.call(this.context)
    }.bind(this))
  else
    setTimeout(function () {
      this.callback.call(this.context)
    }.bind(this))
}

example("Call async by default", function (done) {
  var value   = false
  var sydney  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  sydney.run()

  if (value)
    throw new Error("Should be async")

  process.nextTick(function () {
    done( value ? null : new Error("Should be run by now") )
  })
})

example("Call with setImmediate if process.nextTick is not available", function (done) {
  var value   = false
  var sydney  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  var nextTick = process.nextTick
  process.nextTick = null

  sydney.run()

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

example("Call with setTimeout if setImmediate is not available", function (done) {
  var value   = false
  var sydney  = new Sydney(
    { match: function () { return true } },
    function () { value = this.value },
    { value: true }
  )
  var nextTick = process.nextTick
  var setImmediate = global.setImmediate
  process.nextTick = null
  global.setImmediate = null
  
  sydney.run()

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
