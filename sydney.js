// Sydney
// ======
//
// [ ![Codeship Status for xaviervia/sydney](https://codeship.com/projects/317ce050-9903-0132-893b-365d53813970/status?branch=master)](https://codeship.com/projects/63545)
//
// Event [Subscription]()/[Venue]() library. Whole new approach:
//
// - Asynchronous emission only.
// - The venue is a middlewares. Propagation in the venue is mediated by
//   the main callback.
//
// Installation
// ------------
//
// ```shell
// npm install --save sydney
// ```
//

"use strict";

(function (name, definition) {

  //! AMD
  if (typeof define === 'function')
    define(definition)

  //! CommonJS
  else if (typeof module !== 'undefined' && module.exports)
    module.exports = definition()

  //! Browser
  else {
    var theModule = definition(), global = window, old = global[name];

    theModule.noConflict = function () {
      global[name] = old;
      return theModule;
    }

    global[name] = theModule
  }

})('Sydney', function () {

  var Sydney = function (callback) {
    if (!(this instanceof Sydney)) return new Sydney(callback)

    this.callback = callback

    this.subscribers = []
  }


  Sydney.prototype.send = function (event) {
    var callback = function () { this.callback(event, this) }.bind(this)

    if (process && process.nextTick) process.nextTick(callback)
    else if (setImmediate) setImmediate(callback)
    else setTimeout(callback, 0)
  }


  Sydney.prototype.add = function (subscriber) {
    if (subscriber instanceof Function)
      subscriber = new Sydney(subscriber)
    
    this.subscribers.push(subscriber)
  }


  return Sydney

})
// License
// -------
//
// Copyright 2015 Xavier Via
//
// ISC license.
//
// See [LICENSE](LICENSE) attached.
