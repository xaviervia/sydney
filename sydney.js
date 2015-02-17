// Sydney
// ======
//
// [ ![Codeship Status for xaviervia/sydney](https://codeship.com/projects/317ce050-9903-0132-893b-365d53813970/status?branch=master)](https://codeship.com/projects/63545)
//
// Event [Subscription]()/[Venue]() library. Whole new approach:
//
// - Asynchronous emission only.
// - Callbacks are middlewares. Propagation in the Venue is mediated by
//   the main callback.
// - String named events are replaced by Endpoint objects that are expected to //   expose a `match` method. Used in conjunction with [`object-pattern`](),
//   it provides suppport for any object structure to be used as key to
//   describe the event.
//
// Installation
// ------------
//
// ```shell
// npm install --save sydney
// ```
//
var Sydney = function (endpoint, callback, context) {
  this.endpoint = endpoint
  this.callback = callback
  this.context  = context
}

Sydney.prototype.notify = function (event) {
  if (!this.match()) return

  var deferred = function () {
    this.callback.call(this.context, event)
  }.bind(this)

  if (process && process.nextTick) process.nextTick(deferred)
  else if (setImmediate) setImmediate(deferred)
  else setTimeout(deferred, 0)
}

Sydney.prototype.match = function (event) {
  return this.endpoint.match(event)
}

module.exports = Sydney

// License
// -------
//
// Copyright 2015 Xavier Via
//
// ISC license.
//
// See [LICENSE](LICENSE) attached.
